import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import { getSetupStatus } from "@/lib/porchlyte/operations";
import {
  AGENT_ORDER,
  AGENTS,
  FOUNDATIONS,
  FOUNDATION_ORDER,
} from "@/lib/porchlyte/content";
import { RESOURCE_NAV } from "@/lib/porchlyte/resources";
import { planIncludesTeam } from "@/lib/porchlyte/constants";
import { ConnectClaudeCard } from "@/components/ConnectClaudeCard";

const FOUNDATION_STATUS_LABEL: Record<string, string> = {
  complete: "Complete",
  partial: "In progress",
  empty: "Not started",
};
const TEAM_STATUS_LABEL: Record<string, string> = {
  hired: "Active",
  partial: "In progress",
  not_hired: "Not hired",
};

export default async function HubHome() {
  const ctx = await getPortalContext();
  if (!ctx) redirect("/");

  const setup = await getSetupStatus(ctx.db, ctx.memberId);
  const { data: connector } = await ctx.db
    .from("connector_status")
    .select("*")
    .eq("member_id", ctx.memberId)
    .maybeSingle();

  const foundationStatus = new Map(setup.foundations.map((f) => [f.kind, f.status]));
  const teamStatus = new Map(setup.team.map((t) => [t.agent, t.status]));
  const teamUnlocked = planIncludesTeam(setup.member.plan);

  const firstName = setup.member.name?.split(" ")[0] ?? "there";

  return (
    <>
      <div className="pl-page-head">
        <h1 className="pl-page-title">Welcome back, {firstName}</h1>
        <p className="pl-page-sub">
          This is your team&apos;s home — everything your AI agents know about
          you lives here. Set up your Foundations, meet your agents, and connect
          Claude when you&apos;re ready to go to work.
        </p>
      </div>

      <div className="pl-section-label">Your Foundations</div>
      <div className="pl-grid">
        {FOUNDATION_ORDER.map((kind) => {
          const f = FOUNDATIONS[kind];
          const st = (foundationStatus.get(kind) as string) ?? "empty";
          return (
            <Link key={kind} href={`/dashboard/foundations/${kind}`} className="pl-tile">
              <div className="pl-tile-head">
                <span className="pl-tile-name">{f.label}</span>
                <span className={`pl-dot ${st}`} />
              </div>
              <div className="pl-tile-role">{f.tagline}</div>
              <p className="pl-tile-body" style={{ marginTop: 8 }}>
                {FOUNDATION_STATUS_LABEL[st]}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="pl-section-label">Your Agents</div>
      <div className="pl-grid">
        {AGENT_ORDER.map((agent) => {
          const a = AGENTS[agent];
          const st = (teamStatus.get(agent) as string) ?? "not_hired";
          return (
            <Link key={agent} href={`/dashboard/agents/${agent}`} className="pl-tile">
              <div className="pl-tile-head">
                <span className="pl-tile-name">{a.name}</span>
                <span className={`pl-dot ${st}`} />
              </div>
              <div className="pl-tile-role">{a.role}</div>
              <p className="pl-tile-body" style={{ marginTop: 8 }}>
                {TEAM_STATUS_LABEL[st]}
              </p>
            </Link>
          );
        })}
      </div>
      {!teamUnlocked && (
        <div className="pl-diag" style={{ marginTop: 14 }}>
          Your plan covers Foundations. Upgrade to unlock the full ten-agent
          team.
        </div>
      )}

      <div className="pl-section-label">Resources</div>
      <div className="pl-grid">
        {RESOURCE_NAV.map((r) => (
          <Link key={r.id} href={r.href} className="pl-tile">
            <div className="pl-tile-head">
              <span className="pl-tile-name">{r.label}</span>
            </div>
            <p className="pl-tile-body" style={{ marginTop: 8 }}>
              {r.blurb}
            </p>
          </Link>
        ))}
      </div>

      <div className="pl-section-label">Connect to Claude</div>
      <ConnectClaudeCard
        linked={!!connector?.connector_linked_at}
        lastSync={connector?.last_successful_sync_at ?? null}
      />
    </>
  );
}
