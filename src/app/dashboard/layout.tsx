import { redirect } from "next/navigation";
import "./dashboard.css";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import { getSetupStatus, PlatformError } from "@/lib/porchlyte/operations";
import { Sidebar, type SidebarStatus } from "@/components/Sidebar";
import { SignOutButton } from "@/components/SignOutButton";
import type { FoundationKind, TeamAgent } from "@/lib/porchlyte/constants";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPortalContext();
  if (!ctx) redirect("/");

  let setup;
  try {
    setup = await getSetupStatus(ctx.db, ctx.memberId);
  } catch (error) {
    if (error instanceof PlatformError) {
      return (
        <div className="pl-shell pl-shell-blocked">
          <main className="pl-main">
            <div className="pl-page-head">
              <h1 className="pl-page-title">Your membership needs attention</h1>
              <p className="pl-page-sub">{error.message}</p>
            </div>
            <SignOutButton />
          </main>
        </div>
      );
    }
    throw error;
  }

  const adminCheck = await ctx.db
    .from("members")
    .select("is_admin")
    .eq("id", ctx.memberId)
    .maybeSingle();

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
