import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  planFromPriceAndMetadata,
  statusFromStripe,
} from "@/lib/porchlyte/stripe-plan";
import type { MemberPlan, MemberStatus } from "@/lib/porchlyte/constants";
import type { TablesUpdate } from "@/lib/supabase/types";

// Raw body + crypto verification require the Node runtime.
export const runtime = "nodejs";

/**
 * Stripe webhooks drive members.status / members.plan. This is the billing
 * boundary: a plugin being installed never implies access — the member row,
 * updated here, is what the MCP tools and portal gate on. Wired to Stripe
 * directly (not GHL) so it survives any future move off GHL.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    console.error("Stripe env not configured");
    return new Response("Stripe not configured", { status: 500 });
  }

  const stripe = new Stripe(secret);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const db = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const email =
          session.customer_details?.email ?? session.customer_email ?? null;

        // Pull the purchased price to derive the plan.
        let priceId: string | null = null;
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          priceId = sub.items.data[0]?.price.id ?? null;
        }
        const plan = planFromPriceAndMetadata(priceId, session.metadata);

        await applyMembership(db, { email, customerId, plan, status: "active" });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const priceId = sub.items.data[0]?.price.id ?? null;
        const plan = planFromPriceAndMetadata(priceId, sub.metadata);
        const status = statusFromStripe(sub.status);
        await applyMembership(db, { customerId, plan, status });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await applyMembership(db, { customerId, status: "canceled" });
        break;
      }

      default:
        // Unhandled event types are fine — acknowledge so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}

type Db = ReturnType<typeof createAdminClient>;

/**
 * Find the member (by stripe_customer_id, else email) and update their
 * status/plan. Idempotent: safe to run for duplicate webhook deliveries.
 */
async function applyMembership(
  db: Db,
  input: {
    email?: string | null;
    customerId?: string | null;
    plan?: MemberPlan;
    status?: MemberStatus;
  }
) {
  let memberId: string | null = null;

  if (input.customerId) {
    const { data } = await db
      .from("members")
      .select("id")
      .eq("stripe_customer_id", input.customerId)
      .maybeSingle();
    memberId = data?.id ?? null;
  }
  if (!memberId && input.email) {
    const { data } = await db
      .from("members")
      .select("id")
      .eq("email", input.email)
      .maybeSingle();
    memberId = data?.id ?? null;
  }

  if (!memberId) {
    console.warn("Stripe webhook: no matching member", {
      customerId: input.customerId,
      email: input.email,
    });
    return;
  }

  const update: TablesUpdate<"members"> = {};
  if (input.status) update.status = input.status;
  if (input.plan) update.plan = input.plan;
  if (input.customerId) update.stripe_customer_id = input.customerId;

  const { error } = await db.from("members").update(update).eq("id", memberId);
  if (error) throw error;

  await db.from("audit_log").insert({
    member_id: memberId,
    actor: "stripe",
    action: "membership_updated",
    entity: JSON.stringify(update),
  });
}
