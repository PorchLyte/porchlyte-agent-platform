import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/porchlyte/portal-auth";
import { AGENTS, AGENT_ORDER } from "@/lib/porchlyte/content";
import { TEAM_AGENTS } from "@/lib/porchlyte/constants";

const QUIET_DAYS = 14;

export default async function AdminPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/dashboard");

  // Admin uses the service-role client (already gated on is_admin). Aggregate
  // in JS — fine at early scale; move to SQL views if the member base grows.
  const [members, profiles, team, connectors, usage] = await Promise.all([
    ctx.db.from("members").select("id, email, name, plan, status, created_at").order("created_at"),
    ctx.db.from("profiles").select("member_id, status"),
    ctx.db.from("team_profiles").select("member_id, status"),
    ctx.db.from("connector_status").select("member_id, connector_linked_at"),
    ctx.db
      .from("usage_events")
      .select("member_id, agent, event, created_at")
      .order("created_at", { ascending: false })
      .limit(20000),
  ]);

  const memberRows = members.data ?? [];
  const profileRows = profiles.data ?? [];
  const teamRows = team.data ?? [];
  const connectorRows = connectors.data ?? [];
  const usageRows = usage.data ?? [];

  const foundationsByMember = new Map<string, number>();
  for (const p of profileRows) {
    if (p.status === "complete")
      foundationsByMember.set(p.member_id, (foundationsByMember.get(p.member_id) ?? 0) + 1);
  }
  const teamByMember = new Map<string, number>();
  for (const t of teamRows) {
    if (t.status === "hired")
      teamByMember.set(t.member_id, (teamByMember.get(t.member_id) ?? 0) + 1);
  }
  const connectedSet = new Set(
    connectorRows.filter((c) => c.connector_linked_at).map((c) => c.member_id)
  );
  const lastActiveByMember = new Map<string, string>();
  const sessionsByMember = new Map<string, number>();
  const agentUsage = new Map<string, number>();
  for (const u of usageRows) {
    if (!lastActiveByMember.has(u.member_id))
      lastActiveByMember.set(u.member_id, u.created_at); // rows are desc-ordered
    if (u.event === "session_start")
      sessionsByMember.set(u.member_id, (sessionsByMember.get(u.member_id) ?? 0) + 1);
    if (u.agent && (TEAM_AGENTS as readonly string[]).includes(u.agent))
      agentUsage.set(u.agent, (agentUsage.get(u.agent) ?? 0) + 1);
  }

  const now = Date.now();
  const quietCutoff = now - QUIET_DAYS * 24 * 60 * 60 * 1000;
  const activeMembers = memberRows.filter((m) => m.status === "active").length;
  const quietMembers = memberRows.filter((m) => {
    const last = lastActiveByMember.get(m.id);
    return !last || new Date(last).getTime() < quietCutoff;
  }).length;

  const maxAgentUse = Math.max(1, ...AGENT_ORDER.map((a) => agentUsage.get(a) ?? 0));
  const rankedAgents = AGENT_ORDER.map((a) => ({
    agent: a,
    name: AGENTS[a].name,
    count: agentUsage.get(a) ?? 0,
  })).sort((x, y) => y.count - x.count);

  return (
    <>
      <div className="pl-page-head">
        <div className="pl-q-count">Admin</div>
        <h1 className="pl-page-title">Members &amp; usage</h1>
        <p className="pl-page-sub">
          Everyone on the platform, how far along their setup is, and how the AI
          team is actually being used.
        </p>
      </div>

      <div className="pl-stats">
        <div className="pl-stat">
          <div className="pl-stat-label">Members</div>
          <div className="pl-stat-value">{memberRows.length.toLocaleString()}</div>
        </div>
        <div className="pl-stat">
          <div className="pl-stat-label">Active</div>
          <div className="pl-stat-value">{activeMembers.toLocaleString()}</div>
        </div>
        <div className="pl-stat">
          <div className="pl-stat-label">Connected to Claude</div>
          <div className="pl-stat-value">{connectedSet.size.toLocaleString()}</div>
        </div>
        <div className="pl-stat">
          <div className="pl-stat-label">Quiet ({QUIET_DAYS}d)</div>
          <div className={`pl-stat-value${quietMembers === 0 ? " muted" : ""}`}>
            {quietMembers.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="pl-section-label">Most-used agents</div>
      <div className="pl-card">
        {usageRows.length === 0 ? (
          <p className="pl-card-body">No usage recorded yet.</p>
        ) : (
          <div className="pl-rank">
            {rankedAgents.map((a) => (
              <div key={a.agent} className="pl-rank-row">
                <span className="pl-rank-name">{a.name}</span>
                <span className="pl-rank-bar">
                  <span
                    className="pl-rank-fill"
                    style={{ width: `${Math.round(((a.count || 0) / maxAgentUse) * 100)}%` }}
                  />
                </span>
                <span className="pl-rank-val">{a.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pl-section-label">All members</div>
      <div className="pl-table-wrap">
        <table className="pl-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Foundations</th>
              <th>Team</th>
              <th>Claude</th>
              <th>Sessions</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            {memberRows.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link href={`/dashboard/admin/${m.id}`}>{m.name ?? m.email}</Link>
                  <div style={{ color: "var(--text-soft)", fontSize: 12 }}>{m.email}</div>
                </td>
                <td style={{ textTransform: "capitalize" }}>{m.plan}</td>
                <td>
                  <span className="pl-meter">
                    <span className={`pl-dot ${m.status === "active" ? "active" : m.status === "paused" ? "partial" : "empty"}`} />
                    {m.status}
                  </span>
                </td>
                <td>{foundationsByMember.get(m.id) ?? 0}/3</td>
                <td>{teamByMember.get(m.id) ?? 0}/9</td>
                <td>{connectedSet.has(m.id) ? "Yes" : "—"}</td>
                <td>{sessionsByMember.get(m.id) ?? 0}</td>
                <td style={{ color: "var(--text-soft)" }}>
                  {lastActiveByMember.has(m.id)
                    ? new Date(lastActiveByMember.get(m.id)!).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    : "never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
