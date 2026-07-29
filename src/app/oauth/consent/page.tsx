import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth 2.1 consent screen. Supabase Auth redirects here (Site URL +
 * authorization path configured in the dashboard) with an authorization_id
 * when an MCP client — Claude — asks to connect to the member's PorchLyte
 * account. Approve/deny is handled by /api/oauth/decision.
 */
export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string }>;
}) {
  const { authorization_id: authorizationId } = await searchParams;

  if (!authorizationId) {
    return <main style={{ padding: "3rem" }}>Missing authorization request.</main>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/?redirect=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`
    );
  }

  const { data: authDetails, error } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (error || !authDetails) {
    return (
      <main style={{ padding: "3rem" }}>
        This authorization request is invalid or has expired. Please try
        connecting again from Claude.
      </main>
    );
  }

  // Already consented previously — Supabase says to send them straight back.
  if (!("authorization_id" in authDetails)) {
    redirect(authDetails.redirect_url);
  }

  return (
    <main style={{ maxWidth: "28rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1>Connect {authDetails.client.name ?? "Claude"} to PorchLyte</h1>
      <p>
        This will let your AI team read and update your PorchLyte profiles —
        your Voice, Brand, and Local foundations and your team hires — while
        you work in Claude.
      </p>
      <form
        action="/api/oauth/decision"
        method="POST"
        style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}
      >
        <input type="hidden" name="authorization_id" value={authorizationId} />
        <button type="submit" name="decision" value="approve">
          Connect
        </button>
        <button type="submit" name="decision" value="deny">
          Cancel
        </button>
      </form>
    </main>
  );
}
