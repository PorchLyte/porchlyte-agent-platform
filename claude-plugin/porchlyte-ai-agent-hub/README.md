# PorchLyte AI Agent Hub (Claude plugin)

One plugin: Voice, Brand, Local + the nine-agent team, wired to your PorchLyte account.

## Connector URL (custom connector)

```
https://aiagents.porchlyte.com/api/mcp/mcp
```

In Claude / Cowork: **Settings → Connectors → Add custom connector** → paste that URL → Connect → sign in with your PorchLyte membership email.

## Install this plugin

Two ways — pick whichever works. If one gets stuck, the other is your fallback.

**Marketplace (recommended — updates with one click, no re-downloading):**
1. In Claude, go to **Customize → Plugins → Add → Add marketplace**.
2. Paste `PorchLyte/porchlyte-ai-agent-hub` and sync.
3. Find **porchlyte-ai-agent-hub** and click **+** to install.
4. Later, to get the newest skills: click the **···** next to the marketplace and choose **Update**.

**Zip (fallback — if the marketplace won't pick up an update):**
1. Download `porchlyte-claude-plugin.zip` from the hub (Connect to Claude).
2. Install from zip in Claude (Plugins / marketplace → install from file), **or** unpack and install as a local plugin.
3. If you're switching from the marketplace install, remove that marketplace first so the two don't both register the same skills.

Either way, confirm the **porchlyte** MCP server is connected (OAuth to aiagents.porchlyte.com) — that part is the same regardless of how the plugin itself got installed.

## After connect

- Set up Foundations on https://aiagents.porchlyte.com if you haven't.
- Existing members: run `/migrate` in your **old** Claude project to pull chat-memory setups into your account.
- New work: skills call `get_foundations` / `get_team_member` / `save_*` on the connector.

## Version

2.0.0 — connector-first.
