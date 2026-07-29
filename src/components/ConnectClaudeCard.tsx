"use client";

import { useState } from "react";
import {
  MCP_CONNECTOR_URL,
  PLUGIN_VERSION,
  PLUGIN_ZIP_PATH,
} from "@/lib/porchlyte/connector";

export function ConnectClaudeCard({
  linked,
  lastSync,
}: {
  linked: boolean;
  lastSync: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    await navigator.clipboard.writeText(MCP_CONNECTOR_URL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="pl-card">
      <div className="pl-card-title">
        {linked ? "Claude is connected" : "Connect Claude"}
      </div>
      <p className="pl-card-body" style={{ marginBottom: 14 }}>
        {linked
          ? `Last synced ${formatWhen(lastSync)}. Your agents read and update this hub while you work in Claude.`
          : "Two steps: add the PorchLyte connector in Claude, then install the plugin (skills). Foundations can be finished on this hub anytime — connecting does not require them first."}
      </p>

      <ol className="pl-connect-steps">
        <li>
          In Claude / Cowork open <strong>Settings → Connectors → Add custom
          connector</strong>.
        </li>
        <li>
          Paste this URL, then click Connect and sign in with your PorchLyte
          membership email:
          <div className="pl-connect-url-row">
            <code className="pl-connect-url">{MCP_CONNECTOR_URL}</code>
            <button type="button" className="pl-btn pl-btn-ghost" onClick={copyUrl}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </li>
        <li>
          Download and install the plugin (v{PLUGIN_VERSION}) so Voice, Brand,
          Local, and the nine agents use your account:
          <div style={{ marginTop: 10 }}>
            <a className="pl-btn pl-btn-primary" href={PLUGIN_ZIP_PATH} download>
              Download plugin (.zip)
            </a>
          </div>
        </li>
        <li>
          Already set up in an old Claude chat? After connecting, run{" "}
          <strong>/migrate</strong> in that project so your Foundations and
          hires save here — no need to redo questions.
        </li>
      </ol>

      {linked && (
        <div className="pl-diag" style={{ marginTop: 14 }}>
          Connector linked. Plugin v{PLUGIN_VERSION} is current.
        </div>
      )}
    </div>
  );
}

function formatWhen(iso: string | null): string {
  if (!iso) return "recently";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
