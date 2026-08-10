"use client";

import { useState } from "react";

function generateTempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function AdminSetPassword({
  memberId,
  email,
}: {
  memberId: string;
  email: string;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function setMemberPassword(nextPassword: string) {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch(
        `/api/portal/admin/members/${memberId}/password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: nextPassword }),
        }
      );
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || "Couldn't set password");
      setPassword(nextPassword);
      setDone(
        `Password set for ${email}. Give it to them securely — they sign in on the login page with “Use password instead.”`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await setMemberPassword(password.trim());
  }

  async function onGenerate() {
    const next = generateTempPassword();
    setPassword(next);
    await setMemberPassword(next);
  }

  async function copyPassword() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="pl-card">
      <div className="pl-card-title">Temporary password</div>
      <p className="pl-card-body" style={{ marginBottom: 14 }}>
        Use this when OTP / magic-link email isn&apos;t arriving. Sets an
        email+password login for <strong>{email}</strong>. Share the password
        out of band (text/Zoom) — it is not emailed.
      </p>

      <form onSubmit={onSubmit}>
        <div className="pl-field">
          <label htmlFor="admin-temp-password">Password</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input
              id="admin-temp-password"
              type="text"
              className="pl-input"
              style={{ marginTop: 0, flex: 1 }}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setDone(null);
                setError(null);
              }}
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
              required
            />
            <button
              type="button"
              className="pl-btn pl-btn-ghost"
              disabled={!password || busy}
              onClick={copyPassword}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="submit"
            className="pl-btn pl-btn-primary"
            disabled={busy || password.trim().length < 8}
          >
            {busy ? "Saving…" : "Set password"}
          </button>
          <button
            type="button"
            className="pl-btn pl-btn-ghost"
            disabled={busy}
            onClick={onGenerate}
          >
            Generate &amp; set
          </button>
        </div>
      </form>

      {error && <p className="pl-error">{error}</p>}
      {done && (
        <div className="pl-diag" style={{ marginTop: 14 }}>
          {done}
        </div>
      )}
    </div>
  );
}
