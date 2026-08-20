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
          <li>Open Claude and go to <strong>Settings</strong></li>
          <li>Click <strong>Connectors</strong></li>
          <li>Click <strong>Add custom connector</strong></li>
          <li>
            Paste this URL:
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
            Click <strong>Connect</strong>, then sign in with your PorchLyte
            membership email
          </li>
          <li>
            When the <strong>Tool permissions</strong> list appears, change{" "}
            <strong>Other tools</strong> from &ldquo;Needs approval&rdquo; to{" "}
            <strong>Always allow</strong>
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
          agents (v{PLUGIN_VERSION}).
        </p>

        <ol className="pl-connect-steps">
          <li>In Claude, click <strong>Customize</strong></li>
          <li>Click <strong>Plugins</strong></li>
          <li>
            Click <strong>Add</strong>, then <strong>Add marketplace</strong>
          </li>
          <li>
            Paste this:
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
            Sync, then install <strong>porchlyte-ai-agent-hub</strong>
          </li>
        </ol>
      </div>

      <p className="pl-field-hint" style={{ marginTop: 10 }}>
        Having trouble installing the plugin? You can{" "}
        <a href={PLUGIN_ZIP_PATH} download style={{ textDecoration: "underline" }}>
          download the zip file version
        </a>{" "}
        and install it from file instead.
      </p>
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
