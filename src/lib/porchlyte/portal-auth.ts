import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { PlatformError } from "./operations";

export type PortalContext = {
  memberId: string;
  db: SupabaseClient<Database>;
};

/**
 * Resolve the logged-in portal member from the Supabase session cookie.
 * Returns null when there is no valid session (routes respond 401).
 * The returned db client is service-role: operations scope every query by
 * memberId explicitly, and plan/status gating happens in the operations layer.
 */
export async function getPortalContext(): Promise<PortalContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { memberId: user.id, db: createAdminClient() };
}

/** Map thrown errors to portal JSON responses without leaking internals. */
export function errorResponse(error: unknown): Response {
  if (error instanceof PlatformError) {
    const status =
      error.code === "member_not_found"
        ? 404
        : error.code === "plan_required"
          ? 403
          : 403;
    return Response.json({ error: error.message, code: error.code }, { status });
  }
  console.error("portal api error:", error);
  return Response.json({ error: "Something went wrong." }, { status: 500 });
}

export const unauthorized = () =>
  Response.json({ error: "Not signed in." }, { status: 401 });

/**
 * Resolve the portal context AND confirm the member is an admin. Returns null
 * when not signed in or not an admin — admin pages redirect to /dashboard in both
 * cases (don't reveal the page exists).
 */
export async function getAdminContext(): Promise<PortalContext | null> {
  const ctx = await getPortalContext();
  if (!ctx) return null;
  const { data } = await ctx.db
    .from("members")
    .select("is_admin")
    .eq("id", ctx.memberId)
    .maybeSingle();
  return data?.is_admin ? ctx : null;
}
