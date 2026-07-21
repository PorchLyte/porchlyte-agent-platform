import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role Supabase client for trusted server-only contexts:
 * Stripe webhooks, the MCP server's tool handlers, and admin operations
 * that must bypass row-level security.
 *
 * NEVER import this into a Client Component or expose the service-role key
 * to the browser. Server-side only.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // New-format secret key (sb_secret_...), with the legacy service-role JWT
    // as fallback. Both carry service-role privileges.
    (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
