import { redirect } from "next/navigation";
import "./hub.css";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import { getSetupStatus } from "@/lib/porchlyte/operations";
import { Sidebar, type SidebarStatus } from "@/components/Sidebar";
import type { FoundationKind, TeamAgent } from "@/lib/porchlyte/constants";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPortalContext();
  if (!ctx) redirect("/login");

  const setup = await getSetupStatus(ctx.db, ctx.memberId);

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
      <Sidebar status={status} />
      <main className="pl-main">{children}</main>
    </div>
  );
}
