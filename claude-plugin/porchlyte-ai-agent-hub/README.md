# PorchLyte AI Agent Hub (Claude plugin)

One plugin: Voice, Brand, Local + the nine-agent team, wired to your PorchLyte account.

## Connector URL (custom connector)

```
https://aiagents.porchlyte.com/api/mcp/mcp
```

In Claude / Cowork: **Settings → Connectors → Add custom connector** → paste that URL → Connect → sign in with your PorchLyte membership email.

## Install this plugin

1. Download `porchlyte-claude-plugin.zip` from the hub (Connect to Claude).
2. Install from zip in Claude (Plugins / marketplace → install from file), **or** unpack and install as a local plugin.
3. Confirm the **porchlyte** MCP server is connected (OAuth to aiagents.porchlyte.com).

## After connect

- Set up Foundations on https://aiagents.porchlyte.com if you haven't.
- Existing members: run `/migrate` in your **old** Claude project to pull chat-memory setups into your account.
- New work: skills call `get_foundations` / `get_team_member` / `save_*` on the connector.

## Version

2.0.0 — connector-first.
