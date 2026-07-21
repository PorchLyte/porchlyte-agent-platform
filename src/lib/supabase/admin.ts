import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for trusted server-only contexts:
 * Stripe webhooks, the MCP server's tool handlers, and admin operations
 * that must bypass row-level security.
 *
 * NEVER import this into a Client Component or expose the service-role key
 * to the browser. Server-side only.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
