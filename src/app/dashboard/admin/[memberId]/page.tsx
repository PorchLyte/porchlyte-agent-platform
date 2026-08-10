import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminContext } from "@/lib/porchlyte/portal-auth";
import { AGENTS, FOUNDATIONS, FOUNDATION_ORDER } from "@/lib/porchlyte/content";
import { isFoundationKind, isTeamAgent } from "@/lib/porchlyte/constants";
import { AdminSetPassword } from "@/components/AdminSetPassword";

export default async function AdminMemberPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const ctx = await getAdminContext();
  if (!ctx) redirect("/dashboard");

  const { data: member } = await ctx.db
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();
  if (!member) notFound();

  const [profiles, team] = await Promise.all([
    ctx.db.from("profiles").select("kind, content, status, updated_at, updated_by").eq("member_id", memberId),
    ctx.db.from("team_profiles").select("agent, content, status, updated_at, updated_by").eq("member_id", memberId),
  ]);

  // Audit every admin view of a member's data (consent/accountability trail).
  await ctx.db.from("audit_log").insert({
    member_id: memberId,
    actor: `admin:${ctx.memberId}`,
    action: "view_member",
    entity: "member",
  });

  const profileByKind = new Map((profiles.data ?? []).map((p) => [p.kind, p]));
  const teamByAgent = new Map((team.data ?? []).map((t) => [t.agent, t]));

  return (
    <>
      <div className="pl-page-head">
        <Link href="/dashboard/admin" className="pl-inline-link" style={{ fontSize: 13 }}>
          ← All members
        </Link>
        <h1 className="pl-page-title" style={{ marginTop: 10 }}>
          {member.name ?? member.email}
        </h1>
        <p className="pl-page-sub">
          {member.email} · {member.plan} · {member.status}
        </p>
      </div>

      <div className="pl-section-label">Access</div>
      <AdminSetPassword memberId={member.id} email={member.email} />

      <div className="pl-section-label">Foundations</div>
      {FOUNDATION_ORDER.filter(isFoundationKind).map((kind) => {
        const p = profileByKind.get(kind);
        return (
          <div key={kind} className="pl-card">
            <div className="pl-card-title" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{FOUNDATIONS[kind].label}</span>
              <span className="pl-pill">{p?.status ?? "empty"}</span>
            </div>
            <p className="pl-card-body" style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>
              {p?.content ?? "Not set up yet."}
            </p>
          </div>
        );
      })}

      <div className="pl-section-label">Team</div>
      {Object.keys(AGENTS)
        .filter(isTeamAgent)
        .map((agent) => {
          const t = teamByAgent.get(agent);
          if (!t || t.status === "not_hired") return null;
          return (
            <div key={agent} className="pl-card">
              <div className="pl-card-title" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{AGENTS[agent].name}</span>
                <span className="pl-pill">{t.status}</span>
              </div>
              <p className="pl-card-body" style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>
                {t.content ?? ""}
              </p>
            </div>
          );
        })}
      {(team.data ?? []).filter((t) => t.status !== "not_hired").length === 0 && (
        <div className="pl-card">
          <p className="pl-card-body">No team members hired yet.</p>
        </div>
      )}
    </>
  );
}
