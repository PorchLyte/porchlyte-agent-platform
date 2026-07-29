import { notFound, redirect } from "next/navigation";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import {
  getSetupStatus,
  getTaskState,
  getTeamMember,
} from "@/lib/porchlyte/operations";
import {
  isScheduledAgent,
  isTeamAgent,
  planIncludesTeam,
} from "@/lib/porchlyte/constants";
import { AGENTS } from "@/lib/porchlyte/content";
import { AgentTabs } from "@/components/AgentTabs";

const STATUS_PILL: Record<string, string> = {
  hired: "Active",
  partial: "In progress",
  not_hired: "Not hired yet",
};

export default async function AgentPage({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent } = await params;
  if (!isTeamAgent(agent)) notFound();

  const ctx = await getPortalContext();
  if (!ctx) redirect("/");

  const content = AGENTS[agent];
  const scheduled = isScheduledAgent(agent);

  const [record, setup, usageResult, task] = await Promise.all([
    getTeamMember(ctx.db, ctx.memberId, agent),
    getSetupStatus(ctx.db, ctx.memberId),
    ctx.db
      .from("usage_events")
      .select("created_at", { count: "exact" })
      .eq("member_id", ctx.memberId)
      .eq("agent", agent)
      .order("created_at", { ascending: false })
      .limit(1),
    scheduled ? getTaskState(ctx.db, ctx.memberId, agent) : Promise.resolve(null),
  ]);

  const teamUnlocked = planIncludesTeam(setup.member.plan);
  const usage = {
    total: usageResult.count ?? 0,
    lastActive: usageResult.data?.[0]?.created_at ?? null,
  };

  return (
    <>
      <div className="pl-page-head">
        <div className="pl-q-count">{content.role}</div>
        <h1 className="pl-page-title">{content.name}</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
          <span className="pl-pill">
            <span className={`pl-dot ${record.status}`} />
            {STATUS_PILL[record.status] ?? record.status}
          </span>
          {scheduled && <span className="pl-pill">Scheduled agent</span>}
        </div>
        <p className="pl-page-sub" style={{ marginTop: 16 }}>
          {content.purpose}
        </p>
      </div>

      <AgentTabs
        content={content}
        status={record.status}
        scheduled={scheduled}
        scheduledAgent={scheduled ? agent : null}
        teamUnlocked={teamUnlocked}
        usage={usage}
        task={
          task
            ? {
                state: task.state === "paused" ? "paused" : "active",
                schedule_label: task.schedule_label,
                last_run_at: task.last_run_at,
                last_run_summary: task.last_run_summary,
              }
            : null
        }
      />
    </>
  );
}
