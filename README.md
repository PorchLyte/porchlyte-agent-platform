# PorchLyte Agent Platform

The member platform for PorchLyte's AI Agent program: the hub where members set
up and manage their AI team, and the hosted data layer their Claude connects to.

See the implementation plan in [`../docs/mcp-server-implementation-plan.md`](../docs/mcp-server-implementation-plan.md)
and the ongoing platform planning in [`../docs/platform/`](../docs/platform/).

## Stack

- **Next.js 16** (App Router, TypeScript) on **Vercel**
- **Supabase** (Postgres + Auth)
- **Anthropic API** for the server-side onboarding wizard (writes profile prose)
- **Stripe** webhooks for membership status/plan sync
- Remote **MCP server** (planned) served from this same app's route handlers

> **Note on Next.js 16:** this project uses Next 16, which has breaking changes
> from earlier versions. The `middleware` file convention is now `proxy` — the
> root request handler lives in `src/proxy.ts` and exports a `proxy` function.
> See `AGENTS.md`.

## Getting started

1. Copy the env template and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   Fill in Supabase URL + keys (Supabase dashboard → Settings → API), your
   Anthropic API key, and Stripe keys when you get to those phases.

2. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Project structure

```
src/
  app/                  App Router pages
  proxy.ts              Root request handler (Supabase session refresh)
  lib/supabase/
    client.ts           Browser client (Client Components)
    server.ts           Server client (Server Components, Route Handlers, Actions)
    admin.ts            Service-role client (webhooks, MCP, admin — server only)
    proxy.ts            Session-refresh helper used by src/proxy.ts
```

## Environment variables

See `.env.example`. Never commit `.env.local`. The `SUPABASE_SERVICE_ROLE_KEY`
bypasses row-level security and must never reach the browser.

## Roadmap (from the implementation plan)

- **Phase 1** — Data layer: Postgres schema, MCP server + tools, REST API.
  First task is the bundled-connector OAuth spike.
- **Phase 2** — Portal onboarding wizard (Voice/Brand/Local + hiring) and dashboard.
- **Phase 3** — Consolidated Claude plugin (connector-first, manual `.zip` dist).
- **Phase 4** — Launch + member migration.
- **Phase 5** — Memories, deeper analytics, admin depth.
