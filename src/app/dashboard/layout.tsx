import { redirect } from "next/navigation";
import "./dashboard.css";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import { getSetupStatus } from "@/lib/porchlyte/operations";
import { Sidebar, type SidebarStatus } from "@/components/Sidebar";
import type { FoundationKind, TeamAgent } from "@/lib/porchlyte/constants";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPortalContext();
  if (!ctx) redirect("/");

  const [setup, adminCheck] = await Promise.all([
    getSetupStatus(ctx.db, ctx.memberId),
    ctx.db.from("members").select("is_admin").eq("id", ctx.memberId).maybeSingle(),
  ]);

  const status: SidebarStatus = {
    foundations: Object.fromEntries(
      setup.foundations.map((f) => [f.kind, f.status])
    ) as Partial<Record<FoundationKind, string>>,
    team: Object.fromEntries(
      setup.team.map((t) => [t.agent, t.status])
    ) as Partial<Record<TeamAgent, string>>,
  };

  return (
    <div className="pl-shell">
      <Sidebar status={status} isAdmin={!!adminCheck.data?.is_admin} />
      <main className="pl-main">{children}</main>
    </div>
  );
}
