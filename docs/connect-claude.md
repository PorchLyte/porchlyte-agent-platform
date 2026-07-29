# Connect Claude — ops checklist

## Member path (ready after deploy)

1. Sign in at https://aiagents.porchlyte.com
2. **Settings → Connectors → Add custom connector** in Claude/Cowork
3. URL: `https://aiagents.porchlyte.com/api/mcp/mcp`
4. Connect → OAuth → approve on `/oauth/consent`
5. Download plugin zip from hub → install
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

## Plugin source

- Source: `claude-plugin/porchlyte-ai-agent-hub/`
- Zip: `public/downloads/porchlyte-claude-plugin.zip`
- Rebuild: `npm run build:plugin-zip`

## Member-facing instructions page (no login required)

- Source: `public/connect-and-migrate.html` — served statically, no auth, safe to link directly
- Live: `https://aiagents.porchlyte.com/connect-and-migrate.html`
- Covers: connect the connector, install the new plugin, run `/migrate` in the old chat/project, delete the old `porchlyte-foundations` / `porchlyte-agents` marketplaces (they're frozen by the Cowork plugin-cache bug and never update)
- Edit directly and redeploy — no build step
