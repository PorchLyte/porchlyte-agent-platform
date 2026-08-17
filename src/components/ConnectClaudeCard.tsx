"use client";

import { useState } from "react";
import {
  MCP_CONNECTOR_URL,
  PLUGIN_MARKETPLACE_REPO,
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
  const [copied, setCopied] = useState<"url" | "repo" | null>(null);

  async function copyText(text: string, which: "url" | "repo") {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    window.setTimeout(() => setCopied(null), 2000);
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
            <button
              type="button"
              className="pl-btn pl-btn-ghost"
              onClick={() => copyText(MCP_CONNECTOR_URL, "url")}
            >
              {copied === "url" ? "Copied" : "Copy"}
            </button>
          </div>
        </li>
        <li>
          Install the plugin (v{PLUGIN_VERSION}) so Voice, Brand, Local, and
          the ten agents use your account — two ways, pick either:
          <div style={{ marginTop: 10 }}>
            <div className="pl-connect-url-row">
              <code className="pl-connect-url">{PLUGIN_MARKETPLACE_REPO}</code>
              <button
                type="button"
                className="pl-btn pl-btn-ghost"
                onClick={() => copyText(PLUGIN_MARKETPLACE_REPO, "repo")}
              >
                {copied === "repo" ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="pl-field-hint" style={{ marginTop: 4 }}>
              Recommended — paste into Customize → Plugins → Add marketplace.
              Updates later are one click.
            </p>
            <a
              className="pl-btn pl-btn-primary"
              href={PLUGIN_ZIP_PATH}
              download
              style={{ marginTop: 10, display: "inline-flex" }}
            >
              Or download plugin (.zip)
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
