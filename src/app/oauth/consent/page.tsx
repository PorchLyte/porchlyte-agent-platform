import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import "../../dashboard/dashboard.css";

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
    return (
      <div className="pl-auth">
        <div className="pl-auth-card">
          <p className="pl-auth-lead">Missing authorization request.</p>
        </div>
      </div>
    );
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
      <div className="pl-auth">
        <div className="pl-auth-card">
          <p className="pl-auth-lead">
            This authorization request is invalid or has expired. Please try
            connecting again from Claude.
          </p>
        </div>
      </div>
    );
  }

  // Already consented previously — Supabase says to send them straight back.
  if (!("authorization_id" in authDetails)) {
    redirect(authDetails.redirect_url);
  }

  return (
    <div className="pl-auth">
      <div className="pl-auth-card">
        <div style={{ marginBottom: 24 }}>
          <div className="pl-brand-mark" style={{ fontSize: 26 }}>
            PorchLyte
          </div>
          <div className="pl-brand-sub">AI Agent Hub</div>
        </div>

        <p className="pl-auth-lead">
          Connect <strong>{authDetails.client.name ?? "Claude"}</strong> to
          PorchLyte. This will let your AI team read and update your
          PorchLyte profiles — your Voice, Brand, and Local foundations and
          your team hires — while you work in Claude.
        </p>

        <form
          action="/api/oauth/decision"
          method="POST"
          style={{ display: "flex", gap: 12 }}
        >
          <input type="hidden" name="authorization_id" value={authorizationId} />
          <button
            type="submit"
            name="decision"
            value="approve"
            className="pl-btn pl-btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
          >
            Connect
          </button>
          <button
            type="submit"
            name="decision"
            value="deny"
            className="pl-btn pl-btn-ghost"
            style={{ flex: 1, justifyContent: "center" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
