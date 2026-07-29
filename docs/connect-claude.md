# Connect Claude — ops checklist

## Member path (ready after deploy)

1. Sign in at https://aiagents.porchlyte.com
2. **Settings → Connectors → Add custom connector** in Claude/Cowork
3. URL: `https://aiagents.porchlyte.com/api/mcp/mcp`
4. Connect → OAuth → approve on `/oauth/consent`
5. Install the plugin — two paths:
   - **Marketplace (recommended):** Customize → Plugins → Add marketplace → `PorchLyte/porchlyte-ai-agent-hub` → sync → install `porchlyte-ai-agent-hub`. Updates via the `···` menu → Update, no re-download.
   - **Zip (fallback):** download from hub → install from file. Use this if a marketplace sync ever seems stuck.
6. Existing cohort: `/migrate` in old Claude project

## Supabase (must be on)

Authentication → **OAuth Server**:
- Enabled
- Authorization path: `/oauth/consent`
- Dynamic client registration: on

URL Configuration:
- Site URL: `https://aiagents.porchlyte.com`
- Redirect URLs include `https://aiagents.porchlyte.com/**`

## Verify

```bash
# Expect 401 + resource_metadata header (auth required = healthy)
curl -sI https://aiagents.porchlyte.com/api/mcp/mcp

# Expect authorization_servers JSON
curl -s https://aiagents.porchlyte.com/.well-known/oauth-protected-resource
```

To see what tools production is *actually* serving (ground truth, read-only):

```bash
MCP_BASE=https://aiagents.porchlyte.com/api/mcp/mcp ./scripts/mcp-door-test.sh
```

Note that script also writes test data; for a pure read, do `initialize` then
`tools/list` with a token from `node scripts/get-test-token.mjs`.

### Gotcha: clients cache the tool list

Claude caches an MCP server's tool list per session. After deploying a tool
change (new tool, new parameter), an already-connected session keeps showing
the **old** tools and will insist the new ones "don't exist" — even though the
server is correct. This is a client-side cache, not a deploy problem.

Confirm with `tools/list` against production before believing a session's
report. Fix is to refresh the tool list / reconnect the connector. Expect
members to hit this after any MCP tool change; it resolves on reconnect.

## Plugin source

- Source: `claude-plugin/porchlyte-ai-agent-hub/` — single source of truth for both install paths. Edit here, nowhere else.
- Marketplace repo: `PorchLyte/porchlyte-ai-agent-hub` (public, dedicated) — what members paste into Add marketplace. It holds a published *copy* of the source folder above.
- Zip: `public/downloads/porchlyte-claude-plugin.zip` — the fallback install path.

**After any skill/command change, run both:**

```bash
npm run build:plugin-zip      # refresh the downloadable zip
npm run publish:marketplace   # push the same content to the marketplace repo
```

Skipping either one leaves the two install paths on different versions. The
publish script clones the marketplace repo, rsyncs the source folder in, and
pushes only if something actually changed.

Why a separate repo: Claude's desktop "Add marketplace" only accepts a GitHub
repo or git URL (no plain HTTPS manifest URL), and this platform repo is
planned to go private. A private repo can't serve as a member-facing
marketplace, so the plugin lives in its own public repo.

## Member-facing instructions page (no login required)

- Source: `public/connect-and-migrate.html` — served statically, no auth, safe to link directly
- Live: `https://aiagents.porchlyte.com/connect-and-migrate.html`
- Covers: connect the connector, install the new plugin, run `/migrate` in the old chat/project, delete the old `porchlyte-foundations` / `porchlyte-agents` marketplaces (they're frozen by the Cowork plugin-cache bug and never update)
- Edit directly and redeploy — no build step
