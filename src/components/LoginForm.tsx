"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "code";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/dashboard";
  const authError = params.get("error");

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(
    authError === "magic_link"
      ? "That sign-in link expired or was already used. Request a new one below."
      : null
  );
  const [sentNotice, setSentNotice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);
  const autoSubmittedRef = useRef<string | null>(null);

  useEffect(() => {
    if (step !== "code" || resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [step, resendIn]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  function nextPath() {
    return redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/dashboard";
  }

  async function sendCode(targetEmail: string) {
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath())}`,
      },
    });
    return error;
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSentNotice(false);
    const trimmed = email.trim().toLowerCase();
    const err = await sendCode(trimmed);
    setBusy(false);
    setEmail(trimmed);
    setStep("code");
    setCode("");
    setResendIn(60);
    setSentNotice(true);
    if (err) {
      // Same UX either way — don't reveal whether the email is on the list.
      setError(null);
    }
  }

  async function verifyToken(token: string) {
    const supabase = createClient();
    // signInWithOtp always issues an "email" type code — verifying against
    // that single type avoids burning the member's remaining attempts on
    // types that were never going to match.
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    return error ? new Error("invalid") : null;
  }

  async function onCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\s/g, "");
    if (token.length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    setError(null);
    const err = await verifyToken(token);
    setBusy(false);
    if (err) {
      setError("That code didn't work. Try again, or resend a new one.");
      return;
    }
    router.push(nextPath());
    router.refresh();
  }

  async function onResend() {
    if (resendIn > 0 || busy) return;
    setBusy(true);
    setError(null);
    const err = await sendCode(email);
    setBusy(false);
    setResendIn(60);
    setCode("");
    setSentNotice(true);
    if (err) {
      setError("Couldn't resend just now. Wait a minute and try again.");
    }
  }

  function onCodeChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    setCode(digits);
    setError(null);
  }

  useEffect(() => {
    if (step !== "code" || busy) return;
    const token = code.replace(/\D/g, "");
    if (token.length !== 6) {
      autoSubmittedRef.current = null;
      return;
    }
    if (autoSubmittedRef.current === token) return;
    autoSubmittedRef.current = token;
    codeRef.current?.form?.requestSubmit();
  }, [code, step, busy]);

  return (
    <div className="pl-auth">
      <div className="pl-auth-card">
        <div style={{ marginBottom: 24 }}>
          <div className="pl-brand-mark" style={{ fontSize: 26 }}>
            PorchLyte
          </div>
          <div className="pl-brand-sub">AI Agent Hub</div>
        </div>

        {step === "email" ? (
          <form onSubmit={onEmailSubmit}>
            <p className="pl-auth-lead">
              Enter the email on your PorchLyte membership. We&apos;ll send a
              one-time code — no password.
            </p>
            <div className="pl-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="pl-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <button
              type="submit"
              className="pl-btn pl-btn-primary"
              disabled={busy}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {busy ? "Sending…" : "Send sign-in code"}
            </button>
            {error && <p className="pl-error">{error}</p>}
          </form>
        ) : (
          <form onSubmit={onCodeSubmit}>
            <p className="pl-auth-lead">
              Enter the one-time code from your email. You can also tap the
              sign-in button in that message.
            </p>

            <div className="pl-auth-notice" role="status">
              <p className="pl-auth-notice-title">
                Code sent to <strong>{email}</strong>
              </p>
              <p>
                Check your inbox — and spam/junk if it isn&apos;t there in a
                minute. Confirm the address above is spelled right; if not, go
                back and try again.
              </p>
              {sentNotice && (
                <p className="pl-auth-notice-meta">
                  From PorchLyte AI Agent Hub · expires shortly · one use only
                </p>
              )}
            </div>

            <div className="pl-field">
              <label htmlFor="code">One-time code</label>
              <input
                ref={codeRef}
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                className="pl-input pl-input-code"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="000000"
                aria-describedby="code-help"
                required
              />
              <p id="code-help" className="pl-field-hint">
                6-digit code from the email
              </p>
            </div>
            <button
              type="submit"
              className="pl-btn pl-btn-primary"
              disabled={busy || code.replace(/\D/g, "").length < 6}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
            {error && <p className="pl-error">{error}</p>}
            <div className="pl-auth-actions">
              <button
                type="button"
                className="pl-btn pl-btn-ghost"
                disabled={busy || resendIn > 0}
                onClick={onResend}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
              <button
                type="button"
                className="pl-btn pl-btn-ghost"
                disabled={busy}
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                  setSentNotice(false);
                }}
              >
                Different email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
