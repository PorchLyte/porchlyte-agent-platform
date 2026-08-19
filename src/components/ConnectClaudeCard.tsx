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
    <>
      <div className="pl-card" style={{ marginBottom: 14 }}>
        <div className="pl-card-title">
          {linked
            ? "Step 1 of 2 · Connector — connected ✓"
            : "Step 1 of 2 · Add the PorchLyte connector"}
        </div>
        <p className="pl-card-body" style={{ marginBottom: 14 }}>
          {linked
            ? `Last synced ${formatWhen(lastSync)}. The connector links Claude to your PorchLyte account — but it's only half the setup. Make sure you've also done Step 2 below.`
            : "The connector is how Claude reads and saves your real account — your Foundations, your team, your brand kit."}
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
            When the <strong>Tool permissions</strong> list appears, change{" "}
            <strong>Other tools</strong> from &ldquo;Needs approval&rdquo; to{" "}
            <strong>Always allow</strong> so nothing interrupts your
            interviews.
          </li>
        </ol>
      </div>

      <div className="pl-card">
        <div className="pl-card-title">
          Step 2 of 2 · Install the PorchLyte plugin
        </div>
        <p className="pl-card-body" style={{ marginBottom: 14 }}>
          The connector alone isn&apos;t enough — the plugin is what gives
          Claude your team&apos;s skills: Voice, Brand, Local, and all ten
          agents (v{PLUGIN_VERSION}). Two ways to install, pick either:
        </p>

        <ol className="pl-connect-steps">
          <li>
            <strong>Marketplace (recommended):</strong> in Claude go to{" "}
            <strong>Customize → Plugins → Add → Add marketplace</strong>, paste
            this, sync, then install <strong>porchlyte-ai-agent-hub</strong>.
            Updates later are one click.
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
          </li>
          <li>
            <strong>Zip (fallback):</strong> if the marketplace ever seems
            stuck, download the plugin and install it from file instead.
            <div style={{ marginTop: 8 }}>
              <a
                className="pl-btn pl-btn-primary"
                href={PLUGIN_ZIP_PATH}
                download
                style={{ display: "inline-flex" }}
              >
                Download plugin (.zip)
              </a>
            </div>
          </li>
        </ol>
      </div>
    </>
  );
}

function formatWhen(iso: string | null): string {
  if (!iso) return "recently";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
