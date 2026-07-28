import type { MemberPlan, MemberStatus } from "./constants";

/**
 * Map a Stripe subscription to a PorchLyte plan.
 *
 * The source of truth is a JSON env var STRIPE_PRICE_MAP — `{"price_abc":"full"}` —
 * so Tracy can change what a tier includes (and add new prices) without a code
 * deploy. Falls back to a `plan` value in the subscription/price metadata, then
 * to "foundations". Fill STRIPE_PRICE_MAP with the real price IDs once the
 * Stripe products exist.
 */
const VALID_PLANS: MemberPlan[] = ["foundations", "team", "trifecta", "full"];

function priceMap(): Record<string, MemberPlan> {
  try {
    const raw = process.env.STRIPE_PRICE_MAP;
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    const out: Record<string, MemberPlan> = {};
    for (const [price, plan] of Object.entries(parsed)) {
      if (VALID_PLANS.includes(plan as MemberPlan)) out[price] = plan as MemberPlan;
    }
    return out;
  } catch {
    return {};
  }
}

function asPlan(value: unknown): MemberPlan | null {
  return typeof value === "string" && VALID_PLANS.includes(value as MemberPlan)
    ? (value as MemberPlan)
    : null;
}

export function planFromPriceAndMetadata(
  priceId: string | null | undefined,
  metadata: Record<string, string> | null | undefined
): MemberPlan {
  if (priceId) {
    const mapped = priceMap()[priceId];
    if (mapped) return mapped;
  }
  return asPlan(metadata?.plan) ?? "foundations";
}

/** Stripe subscription status → PorchLyte membership status. */
export function statusFromStripe(stripeStatus: string): MemberStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "paused":
      return "paused";
    default:
      // canceled, incomplete_expired, anything unknown
      return "canceled";
  }
}
