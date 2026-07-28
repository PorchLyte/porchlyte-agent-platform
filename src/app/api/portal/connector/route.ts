import { getPortalContext, unauthorized } from "@/lib/porchlyte/portal-auth";

/**
 * Disconnect Claude. Clears the connector link so the dashboard reflects the
 * disconnected state and the member can re-link cleanly.
 *
 * NOTE: this clears PorchLyte's view of the link. Fully revoking the member's
 * Supabase OAuth grant (so an existing bearer token stops working immediately)
 * is a follow-up once the OAuth-server dashboard config is in place — it goes
 * through Supabase's OAuth client/session revocation. Tracked in the plan.
 */
export async function DELETE() {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();

  const { error } = await ctx.db
    .from("connector_status")
    .update({ connector_linked_at: null, last_successful_sync_at: null })
    .eq("member_id", ctx.memberId);
  if (error) {
    console.error("disconnect failed:", error.message);
    return Response.json({ error: "Couldn't disconnect." }, { status: 500 });
  }

  await ctx.db.from("audit_log").insert({
    member_id: ctx.memberId,
    actor: "member",
    action: "disconnect_claude",
    entity: "connector_status",
  });

  return Response.json({ ok: true });
}
