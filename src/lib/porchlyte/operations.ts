/**
 * The eight platform operations — the single implementation behind both doors:
 * the MCP tools (Claude connector) and the portal REST API call these same
 * functions, so a save from a chat interview and one from the web wizard are
 * indistinguishable downstream.
 *
 * All functions run on the service-role client with explicit member scoping.
 * Callers are responsible for authenticating the member first (portal session
 * or MCP OAuth token); RLS remains as defense-in-depth for direct client reads.
 *
 * Cross-cutting rules (from docs/implementation-plan.md):
 * - Every call logs a usage_event server-side. No dedicated logging tool.
 * - Plan gating lives here: team writes require a team/full plan.
 * - Membership status gates every call: canceled members are blocked entirely;
 *   paused members can read but not write.
 * - All writes are idempotent upserts.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/supabase/types";
import {
  type FoundationKind,
  type ScheduledAgent,
  type TeamAgent,
  type UpdatedBy,
  planIncludesTeam,
} from "./constants";

type Db = SupabaseClient<Database>;

/** Error whose message is safe to relay to the member (in chat or the portal). */
export class PlatformError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "membership_canceled"
      | "membership_paused"
      | "plan_required"
      | "member_not_found"
  ) {
    super(message);
    this.name = "PlatformError";
  }
}

async function getMember(db: Db, memberId: string): Promise<Tables<"members">> {
  const { data, error } = await db
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new PlatformError(
      "We couldn't find your PorchLyte membership. Please contact support.",
      "member_not_found"
    );
  }
  return data;
}

async function requireMember(
  db: Db,
  memberId: string,
  access: "read" | "write"
): Promise<Tables<"members">> {
  const member = await getMember(db, memberId);
  if (member.status === "canceled") {
    throw new PlatformError(
      "Your PorchLyte membership isn't active right now. Visit porchlyte.com to reactivate, and your AI team will be right where you left them.",
      "membership_canceled"
    );
  }
  if (member.status === "paused" && access === "write") {
    throw new PlatformError(
      "Your membership is paused, so your profiles are read-only right now. Visit porchlyte.com to resume.",
      "membership_paused"
    );
  }
  return member;
}

function logUsage(
  db: Db,
  memberId: string,
  event: string,
  agent?: string | null,
  metadata?: Json
) {
  // Fire-and-forget: analytics must never fail or slow down the member's call.
  void db
    .from("usage_events")
    .insert({ member_id: memberId, event, agent: agent ?? null, metadata: metadata ?? null })
    .then(({ error }) => {
      if (error) console.error("usage_events insert failed:", error.message);
    });
}

// ---------------------------------------------------------------------------
// Foundations
// ---------------------------------------------------------------------------

export async function getFoundations(db: Db, memberId: string) {
  await requireMember(db, memberId, "read");
  const { data, error } = await db
    .from("profiles")
    .select("kind, content, status, updated_at, updated_by")
    .eq("member_id", memberId);
  if (error) throw error;

  logUsage(db, memberId, "profile_read", null, { scope: "foundations" });

  const byKind = new Map(data.map((row) => [row.kind, row]));
  const empty = { content: null, status: "empty", updated_at: null, updated_by: null };
  return {
    voice: byKind.get("voice") ?? empty,
    brand: byKind.get("brand") ?? empty,
    local: byKind.get("local") ?? empty,
  };
}

export async function saveFoundation(
  db: Db,
  memberId: string,
  input: {
    kind: FoundationKind;
    content: string;
    interview_answers?: Json;
    status?: "complete" | "partial";
  },
  updatedBy: UpdatedBy
) {
  await requireMember(db, memberId, "write");
  const { error } = await db.from("profiles").upsert(
    {
      member_id: memberId,
      kind: input.kind,
      content: input.content,
      status: input.status ?? "complete",
      ...(input.interview_answers !== undefined
        ? { interview_answers: input.interview_answers }
        : {}),
      updated_by: updatedBy,
    },
    { onConflict: "member_id,kind" }
  );
  if (error) throw error;

  logUsage(db, memberId, "profile_saved", null, { kind: input.kind, updated_by: updatedBy });
  return { ok: true as const, kind: input.kind, status: input.status ?? "complete" };
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export async function getTeamMember(db: Db, memberId: string, agent: TeamAgent) {
  await requireMember(db, memberId, "read");
  const { data, error } = await db
    .from("team_profiles")
    .select("agent, content, status, updated_at, updated_by")
    .eq("member_id", memberId)
    .eq("agent", agent)
    .maybeSingle();
  if (error) throw error;

  logUsage(db, memberId, "profile_read", agent);

  return (
    data ?? {
      agent,
      content: null,
      status: "not_hired" as const,
      updated_at: null,
      updated_by: null,
    }
  );
}

export async function saveTeamMember(
  db: Db,
  memberId: string,
  input: {
    agent: TeamAgent;
    content: string;
    interview_answers?: Json;
    status?: "hired" | "partial";
  },
  updatedBy: UpdatedBy
) {
  const member = await requireMember(db, memberId, "write");
  if (!planIncludesTeam(member.plan)) {
    throw new PlatformError(
      "Team hires aren't included in your current PorchLyte plan. Visit porchlyte.com to upgrade and unlock your full AI team.",
      "plan_required"
    );
  }
  const { error } = await db.from("team_profiles").upsert(
    {
      member_id: memberId,
      agent: input.agent,
      content: input.content,
      status: input.status ?? "hired",
      ...(input.interview_answers !== undefined
        ? { interview_answers: input.interview_answers }
        : {}),
      updated_by: updatedBy,
    },
    { onConflict: "member_id,agent" }
  );
  if (error) throw error;

  logUsage(db, memberId, "profile_saved", input.agent, { updated_by: updatedBy });
  return { ok: true as const, agent: input.agent, status: input.status ?? "hired" };
}

// ---------------------------------------------------------------------------
// Setup status + partial saves
// ---------------------------------------------------------------------------

export async function getSetupStatus(db: Db, memberId: string) {
  const member = await requireMember(db, memberId, "read");
  const [profiles, teamProfiles] = await Promise.all([
    db.from("profiles").select("kind, status, updated_at").eq("member_id", memberId),
    db.from("team_profiles").select("agent, status, updated_at").eq("member_id", memberId),
  ]);
  if (profiles.error) throw profiles.error;
  if (teamProfiles.error) throw teamProfiles.error;

  logUsage(db, memberId, "session_start");

  return {
    member: { name: member.name, plan: member.plan, status: member.status },
    foundations: profiles.data,
    team: teamProfiles.data,
  };
}

/**
 * Mid-interview save so a member can stop and resume later, in chat or on the
 * portal. Stores raw answers plus a pointer to the next question inside
 * interview_answers; leaves any previously saved prose content untouched.
 */
export async function savePartial(
  db: Db,
  memberId: string,
  input:
    | { kind: FoundationKind; answers: Json; next_question?: string }
    | { agent: TeamAgent; answers: Json; next_question?: string },
  updatedBy: UpdatedBy
) {
  await requireMember(db, memberId, "write");
  const answers: Json = {
    answers: input.answers,
    next_question: input.next_question ?? null,
  };

  if ("kind" in input) {
    const { error } = await db.from("profiles").upsert(
      {
        member_id: memberId,
        kind: input.kind,
        status: "partial",
        interview_answers: answers,
        updated_by: updatedBy,
      },
      { onConflict: "member_id,kind" }
    );
    if (error) throw error;
    logUsage(db, memberId, "profile_saved", null, { kind: input.kind, partial: true });
    return { ok: true as const, kind: input.kind, status: "partial" as const };
  }

  const { error } = await db.from("team_profiles").upsert(
    {
      member_id: memberId,
      agent: input.agent,
      status: "partial",
      interview_answers: answers,
      updated_by: updatedBy,
    },
    { onConflict: "member_id,agent" }
  );
  if (error) throw error;
  logUsage(db, memberId, "profile_saved", input.agent, { partial: true });
  return { ok: true as const, agent: input.agent, status: "partial" as const };
}

// ---------------------------------------------------------------------------
// Scheduled tasks (Darla's brief, Rhonda's scan)
// ---------------------------------------------------------------------------

export async function getTaskState(db: Db, memberId: string, agent: ScheduledAgent) {
  await requireMember(db, memberId, "read");
  const { data, error } = await db
    .from("scheduled_tasks")
    .select("agent, state, schedule_label, last_run_at, last_run_summary")
    .eq("member_id", memberId)
    .eq("agent", agent)
    .maybeSingle();
  if (error) throw error;

  // No row yet = nothing has paused it; scheduled skills treat this as active.
  return (
    data ?? {
      agent,
      state: "active" as const,
      schedule_label: null,
      last_run_at: null,
      last_run_summary: null,
    }
  );
}

export async function logTaskRun(
  db: Db,
  memberId: string,
  agent: ScheduledAgent,
  summary: string
) {
  await requireMember(db, memberId, "write");
  const { error } = await db.from("scheduled_tasks").upsert(
    {
      member_id: memberId,
      agent,
      last_run_at: new Date().toISOString(),
      last_run_summary: summary,
    },
    { onConflict: "member_id,agent" }
  );
  if (error) throw error;

  logUsage(db, memberId, "task_run", agent, { summary });
  return { ok: true as const };
}

/** Hub panel toggle: pause/resume a scheduled agent, update its label. */
export async function setTaskState(
  db: Db,
  memberId: string,
  agent: ScheduledAgent,
  input: { state?: "active" | "paused"; schedule_label?: string }
) {
  await requireMember(db, memberId, "write");
  const { error } = await db.from("scheduled_tasks").upsert(
    {
      member_id: memberId,
      agent,
      ...(input.state ? { state: input.state } : {}),
      ...(input.schedule_label !== undefined
        ? { schedule_label: input.schedule_label }
        : {}),
    },
    { onConflict: "member_id,agent" }
  );
  if (error) throw error;
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Connector diagnostics
// ---------------------------------------------------------------------------

/**
 * Called by the MCP layer on every successful tool call. First call for a
 * member also stamps connector_linked_at; later calls leave it untouched.
 */
export async function touchConnectorSync(
  db: Db,
  memberId: string,
  pluginVersion?: string
) {
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("connector_status")
    .update({
      last_successful_sync_at: now,
      ...(pluginVersion ? { plugin_installed_version: pluginVersion } : {}),
    })
    .eq("member_id", memberId)
    .select("member_id");
  if (error) {
    console.error("connector_status update failed:", error.message);
    return;
  }
  if (data.length === 0) {
    const { error: insertError } = await db.from("connector_status").insert({
      member_id: memberId,
      connector_linked_at: now,
      last_successful_sync_at: now,
      ...(pluginVersion ? { plugin_installed_version: pluginVersion } : {}),
    });
    if (insertError)
      console.error("connector_status insert failed:", insertError.message);
  }
}
