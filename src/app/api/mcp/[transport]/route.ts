/**
 * The PorchLyte MCP server — the Claude-side door into the member database.
 *
 * Transport: Streamable HTTP at /api/mcp/mcp (SSE disabled; no Redis needed).
 * Auth: OAuth 2.1 + PKCE, with Supabase Auth as the authorization server.
 * Bearer tokens are Supabase-issued access tokens; we resolve them to the
 * member and pass member-scoped calls into the shared operations layer —
 * the exact same functions the portal REST API uses.
 */
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  FOUNDATION_KINDS,
  SCHEDULED_AGENTS,
  TEAM_AGENTS,
} from "@/lib/porchlyte/constants";
import {
  PlatformError,
  getFoundations,
  getSetupStatus,
  getTaskState,
  getTeamMember,
  logTaskRun,
  registerScheduledTask,
  saveFoundation,
  savePartial,
  saveTeamMember,
  touchConnectorSync,
} from "@/lib/porchlyte/operations";

const kindSchema = z.enum(FOUNDATION_KINDS);
const agentSchema = z.enum(TEAM_AGENTS);
const scheduledAgentSchema = z.enum(SCHEDULED_AGENTS);

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

function json(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function memberIdFrom(extra: { authInfo?: AuthInfo }): string {
  const memberId = extra.authInfo?.extra?.memberId;
  if (typeof memberId !== "string") {
    throw new PlatformError(
      "We couldn't verify your PorchLyte connection. Try reconnecting the PorchLyte connector.",
      "member_not_found"
    );
  }
  return memberId;
}

/**
 * Runs a tool body with the shared error contract: PlatformError messages are
 * member-safe and relayed verbatim so the skill can speak them in chat;
 * anything else becomes a generic failure. Successful calls stamp
 * connector_status so the hub's diagnostics stay current.
 */
async function run(
  extra: { authInfo?: AuthInfo },
  body: (db: ReturnType<typeof createAdminClient>, memberId: string) => Promise<unknown>
): Promise<ToolResult> {
  const db = createAdminClient();
  try {
    const memberId = memberIdFrom(extra);
    const result = await body(db, memberId);
    await touchConnectorSync(db, memberId);
    return json(result);
  } catch (error) {
    if (error instanceof PlatformError) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    console.error("mcp tool error:", error);
    return {
      content: [{ type: "text", text: "Something went wrong on PorchLyte's side. Please try again in a moment." }],
      isError: true,
    };
  }
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "get_foundations",
      "Get all three PorchLyte Foundations (voice, brand, local) for the signed-in member in one call. Call this at session start. Each foundation has content, status (complete | partial | empty), and last-updated info.",
      {},
      async (_args, extra) => run(extra, (db, memberId) => getFoundations(db, memberId))
    );

    server.tool(
      "save_foundation",
      "Save (upsert) one Foundation profile for the signed-in member. Pass the full plain-prose profile as content. Optionally include the raw interview answers so the profile can be regenerated later without re-interviewing.",
      {
        kind: kindSchema,
        content: z.string().describe("The full plain-prose profile text"),
        interview_answers: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Raw Q&A from the interview, keyed by question"),
      },
      async (args, extra) =>
        run(extra, (db, memberId) =>
          saveFoundation(
            db,
            memberId,
            {
              kind: args.kind,
              content: args.content,
              interview_answers: args.interview_answers as never,
            },
            "mcp_claude"
          )
        )
    );

    server.tool(
      "get_team_member",
      "Get one team member's profile for the signed-in member. Status not_hired means the member hasn't hired this agent yet — offer to run the hiring interview right here in chat, or point them to porchlyte.com.",
      { agent: agentSchema },
      async (args, extra) =>
        run(extra, (db, memberId) => getTeamMember(db, memberId, args.agent))
    );

    server.tool(
      "save_team_member",
      "Save (upsert) a team member's profile for the signed-in member, marking them hired. Works identically whether the interview happened in chat or on the portal. Fails with a member-friendly message if the member's plan doesn't include team hires.",
      {
        agent: agentSchema,
        content: z.string().describe("The full plain-prose profile text"),
        interview_answers: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Raw Q&A from the hiring interview"),
      },
      async (args, extra) =>
        run(extra, (db, memberId) =>
          saveTeamMember(
            db,
            memberId,
            {
              agent: args.agent,
              content: args.content,
              interview_answers: args.interview_answers as never,
            },
            "mcp_claude"
          )
        )
    );

    server.tool(
      "get_setup_status",
      "Get the member's full setup summary: plan, membership status, all three Foundations, and all nine team hires with their statuses. Powers resume logic — call this to decide what setup to offer next.",
      {},
      async (_args, extra) => run(extra, (db, memberId) => getSetupStatus(db, memberId))
    );

    server.tool(
      "save_partial",
      "Save a mid-interview checkpoint so the member can stop and resume later (in chat or on the portal). Provide either kind (for a Foundation) or agent (for a hire), the answers so far, and the next question to ask on resume.",
      {
        kind: kindSchema.optional(),
        agent: agentSchema.optional(),
        answers: z.record(z.string(), z.unknown()).describe("Answers collected so far, keyed by question"),
        next_question: z.string().optional().describe("The question to resume with"),
      },
      async (args, extra) =>
        run(extra, (db, memberId) => {
          if (!args.kind && !args.agent) {
            throw new PlatformError(
              "save_partial needs either a foundation kind or a team agent.",
              "member_not_found"
            );
          }
          const input = args.kind
            ? { kind: args.kind, answers: args.answers as never, next_question: args.next_question }
            : { agent: args.agent!, answers: args.answers as never, next_question: args.next_question };
          return savePartial(db, memberId, input, "mcp_claude");
        })
    );

    server.tool(
      "register_scheduled_task",
      "Call this once, right after setting up a NEW scheduled task in Cowork for Darla's brief or Rhonda's scan. Use the exact task name Cowork gave the task, so this stays in sync with what fires automatically. Registers it on the member's hub so they can see and pause this specific task (not just the agent as a whole). Safe to call again for a task that's already registered — it won't reset a paused task back to active.",
      {
        agent: scheduledAgentSchema,
        task_name: z.string().min(1).describe("The exact name Cowork gave this scheduled task"),
        schedule_label: z
          .string()
          .optional()
          .describe("Human-readable cadence, e.g. \"Weekdays 7:00 AM\" or \"Monthly on the 1st\""),
      },
      async (args, extra) =>
        run(extra, (db, memberId) =>
          registerScheduledTask(db, memberId, args.agent, {
            task_name: args.task_name,
            schedule_label: args.schedule_label,
          })
        )
    );

    server.tool(
      "get_task_state",
      "Scheduled skills (Darla's morning brief, Rhonda's scan) MUST call this at the start of every scheduled run, passing the exact task_name Cowork is running. If state is paused, exit quietly without producing output — the member paused this specific task from their hub.",
      {
        agent: scheduledAgentSchema,
        task_name: z.string().min(1).describe("The exact name Cowork gave this scheduled task"),
      },
      async (args, extra) =>
        run(extra, (db, memberId) => getTaskState(db, memberId, args.agent, args.task_name))
    );

    server.tool(
      "log_task_run",
      "Scheduled skills call this after completing a run, passing the exact task_name and a one-line summary of what the run produced. Feeds the last-run display on the member's hub for that specific task.",
      {
        agent: scheduledAgentSchema,
        task_name: z.string().min(1).describe("The exact name Cowork gave this scheduled task"),
        summary: z.string().describe("One line: what this run produced"),
      },
      async (args, extra) =>
        run(extra, (db, memberId) =>
          logTaskRun(db, memberId, args.agent, args.task_name, args.summary)
        )
    );
  },
  {
    serverInfo: { name: "porchlyte", version: "0.1.0" },
  },
  {
    basePath: "/api/mcp",
    disableSse: true,
    maxDuration: 60,
  }
);

/**
 * Bearer tokens are Supabase-issued OAuth access tokens. auth.getUser(token)
 * both validates the token and resolves the member (members.id == auth user id).
 */
async function verifyToken(
  _req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.getUser(bearerToken);
  if (error || !data.user) return undefined;
  return {
    token: bearerToken,
    clientId: data.user.id,
    scopes: [],
    extra: { memberId: data.user.id },
  };
}

const authedHandler = withMcpAuth(handler, verifyToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { authedHandler as GET, authedHandler as POST, authedHandler as DELETE };
