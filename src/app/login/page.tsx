"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "../hub/hub.css";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/hub";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push(redirectTo);
    router.refresh();
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
        <form onSubmit={onSubmit}>
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
          <div className="pl-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="pl-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="pl-btn pl-btn-primary" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {error && <p className="pl-error">{error}</p>}
        </form>
        <p style={{ marginTop: 18, fontSize: 12.5, color: "var(--text-soft)" }}>
          Members normally reach the AI Agent Hub from inside their PorchLyte
          course area.
          This page is for direct access and connecting Claude.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
