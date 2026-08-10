"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AccountSetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = password.trim();
    if (next.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (next !== confirm.trim()) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    setDone(false);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: next,
    });
    setBusy(false);
    if (updateError) {
      setError(updateError.message || "Couldn't update password.");
      return;
    }
    setPassword("");
    setConfirm("");
    setDone(true);
  }

  return (
    <div className="pl-card">
      <div className="pl-card-title">Set / reset password</div>
      <p className="pl-card-body" style={{ marginBottom: 14 }}>
        Optional backup to the email code. Use this if codes aren&apos;t
        arriving, or to change a temporary password from support.
      </p>
      <form onSubmit={onSubmit}>
        <div className="pl-field">
          <label htmlFor="account-password">New password</label>
          <input
            id="account-password"
            type="password"
            className="pl-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setDone(false);
              setError(null);
            }}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div className="pl-field">
          <label htmlFor="account-password-confirm">Confirm password</label>
          <input
            id="account-password-confirm"
            type="password"
            className="pl-input"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setDone(false);
              setError(null);
            }}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <button
          type="submit"
          className="pl-btn pl-btn-primary"
          disabled={busy || password.trim().length < 8}
        >
          {busy ? "Saving…" : "Save password"}
        </button>
      </form>
      {error && <p className="pl-error">{error}</p>}
      {done && (
        <div className="pl-diag" style={{ marginTop: 14 }}>
          Password saved. You can sign in with{" "}
          <a href="/?mode=password" className="pl-inline-link">
            email + password
          </a>{" "}
          anytime.
        </div>
      )}
    </div>
  );
}
