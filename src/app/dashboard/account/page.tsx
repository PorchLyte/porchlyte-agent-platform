import { redirect } from "next/navigation";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import { AccountControls } from "@/components/AccountControls";
import { AccountSetPassword } from "@/components/AccountSetPassword";

const PLAN_LABEL: Record<string, string> = {
  foundations: "Foundations",
  team: "Team",
  trifecta: "Trifecta",
  full: "Full team",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  canceled: "Canceled",
};

export default async function AccountPage() {
  const ctx = await getPortalContext();
  if (!ctx) redirect("/");

  const [{ data: member }, { data: connector }] = await Promise.all([
    ctx.db.from("members").select("*").eq("id", ctx.memberId).maybeSingle(),
    ctx.db
      .from("connector_status")
      .select("*")
      .eq("member_id", ctx.memberId)
      .maybeSingle(),
  ]);

  if (!member) redirect("/");
  const linked = !!connector?.connector_linked_at;

  return (
    <>
      <div className="pl-page-head">
        <div className="pl-q-count">Your account</div>
        <h1 className="pl-page-title">Account</h1>
      </div>

      <div className="pl-section-label">Membership</div>
      <div className="pl-card">
        <div className="pl-stats" style={{ marginBottom: 0 }}>
          <div className="pl-stat">
            <div className="pl-stat-label">Plan</div>
            <div className="pl-stat-value">{PLAN_LABEL[member.plan] ?? member.plan}</div>
          </div>
          <div className="pl-stat">
            <div className="pl-stat-label">Status</div>
            <div className="pl-stat-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`pl-dot ${member.status === "active" ? "active" : member.status === "paused" ? "partial" : "empty"}`} />
              {STATUS_LABEL[member.status] ?? member.status}
            </div>
          </div>
          <div className="pl-stat">
            <div className="pl-stat-label">Member since</div>
            <div className="pl-stat-value muted">
              {new Date(member.created_at).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        <p className="pl-card-body" style={{ marginTop: 16, fontSize: 13 }}>
          Billing is managed through PorchLyte. Changes to your plan or status
          sync here automatically.
        </p>
      </div>

      <div className="pl-section-label">Sign-in</div>
      <AccountSetPassword />

      <div className="pl-section-label">Claude connection</div>
      <div className="pl-card">
        <div className="pl-card-title">
          {linked ? "Claude is connected" : "Not connected"}
        </div>
        <p className="pl-card-body" style={{ marginTop: 6 }}>
          {linked
            ? `Connected since ${new Date(connector!.connector_linked_at!).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}. Your AI team can read and update everything here while you work in Claude.`
            : "Once your Foundations are set up, install the PorchLyte plugin to connect Claude."}
        </p>
      </div>

      <div className="pl-section-label">Your data</div>
      <div className="pl-card">
        <p className="pl-card-body" style={{ marginBottom: 16 }}>
          Everything your AI team knows about you is yours. Export a full copy
          any time, or disconnect Claude to revoke its access.
        </p>
        <AccountControls linked={linked} />
      </div>
    </>
  );
}
