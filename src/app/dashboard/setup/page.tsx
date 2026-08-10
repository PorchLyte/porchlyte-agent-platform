import { redirect } from "next/navigation";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import { ConnectClaudeCard } from "@/components/ConnectClaudeCard";

export default async function SetupInstructionsPage() {
  const ctx = await getPortalContext();
  if (!ctx) redirect("/");

  const { data: connector } = await ctx.db
    .from("connector_status")
    .select("*")
    .eq("member_id", ctx.memberId)
    .maybeSingle();

  return (
    <>
      <div className="pl-page-head">
        <h1 className="pl-page-title">Setup instructions</h1>
        <p className="pl-page-sub">
          Get your hub connected to Claude so your Foundations and agents live
          in your PorchLyte account — not in chat memory.
        </p>
      </div>

      <div className="pl-section-label">1. Foundations on this hub</div>
      <div className="pl-card">
        <p className="pl-card-body">
          On the Home page, set up <strong>Voice</strong>,{" "}
          <strong>Brand</strong>, and <strong>Local</strong> (or finish them
          later). Connecting Claude does not require Foundations first — but
          your agents work best once those are saved here.
        </p>
      </div>

      <div className="pl-section-label">2. Connect Claude</div>
      <ConnectClaudeCard
        linked={!!connector?.connector_linked_at}
        lastSync={connector?.last_successful_sync_at ?? null}
      />

      <div className="pl-section-label">3. Already set up in an old Claude chat?</div>
      <div className="pl-card">
        <p className="pl-card-body">
          After the connector is linked, open that old project and run{" "}
          <strong>/migrate</strong>. Claude will pull your Foundations and
          hired agents into this hub so you don&apos;t redo the questions.
        </p>
      </div>
    </>
  );
}
