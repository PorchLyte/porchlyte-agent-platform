import { notFound, redirect } from "next/navigation";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import { getTeamMember, getTaskState } from "@/lib/porchlyte/operations";
import { isScheduledAgent, isTeamAgent, planIncludesTeam } from "@/lib/porchlyte/constants";
import { AGENTS, PLACEHOLDER_NOTE } from "@/lib/porchlyte/content";
import { CopyButton } from "@/components/CopyButton";
import { SchedulePanel } from "@/components/SchedulePanel";
import { getSetupStatus } from "@/lib/porchlyte/operations";

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
  if (!ctx) redirect("/login");

  const content = AGENTS[agent];
  const record = await getTeamMember(ctx.db, ctx.memberId, agent);
  const setup = await getSetupStatus(ctx.db, ctx.memberId);
  const teamUnlocked = planIncludesTeam(setup.member.plan);

  const scheduled = isScheduledAgent(agent);
  const task = scheduled ? await getTaskState(ctx.db, ctx.memberId, agent) : null;

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

      <div className="pl-card">
        <div className="pl-card-title">What {content.name} does</div>
        <p className="pl-card-body" style={{ marginTop: 8 }}>
          {content.intro}
        </p>
      </div>

      <div className="pl-section-label">Useful ways to use {content.name}</div>
      <div className="pl-card">
        <ul className="pl-list">
          {content.waysToUse.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>

      <div className="pl-section-label">Tips</div>
      <div className="pl-card">
        <ul className="pl-list">
          {content.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="pl-section-label">Ready-to-use prompts</div>
      <div className="pl-card">
        {content.prompts.map((p) => (
          <div key={p.title} className="pl-prompt">
            <div>
              <div className="pl-prompt-title">{p.title}</div>
              <div className="pl-prompt-text">{p.text}</div>
            </div>
            <CopyButton text={p.text} />
          </div>
        ))}
        <p className="pl-card-body" style={{ marginTop: 14, fontSize: 13 }}>
          {PLACEHOLDER_NOTE}
        </p>
      </div>

      {scheduled && task && (
        <>
          <div className="pl-section-label">Scheduled runs</div>
          <SchedulePanel
            agent={agent}
            agentName={content.name}
            initial={{
              state: task.state === "paused" ? "paused" : "active",
              schedule_label: task.schedule_label,
              last_run_at: task.last_run_at,
              last_run_summary: task.last_run_summary,
            }}
          />
        </>
      )}

      {!teamUnlocked && (
        <div className="pl-diag" style={{ marginTop: 24 }}>
          {content.name} is part of the full team. Your current plan covers
          Foundations — upgrade to hire your agents.
        </div>
      )}
    </>
  );
}
