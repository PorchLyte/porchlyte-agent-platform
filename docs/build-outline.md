# PorchLyte Platform — Build Outline

**Status:** Draft v1 · July 15, 2026
**Purpose:** Simple task breakdown by line item, for scoping and pricing. Full detail lives in [mcp-server-implementation-plan.md](./mcp-server-implementation-plan.md) and [connectors-directory-submission.md](./connectors-directory-submission.md).

---

## 1. MCP Server + API (data layer)

Everything needed for Claude and the portal to read/write the same member records.

- Postgres schema: `members`, `profiles`, `team_profiles`, `connector_status`, `usage_events`, `scheduled_tasks`, `audit_log`
- MCP server as Next.js route handlers on Vercel (OAuth 2.1 + PKCE, Streamable HTTP) — same app as the portal, one deploy
- Eight MCP tools, built as separate read/write pairs: `get_foundations` / `save_foundation`, `get_team_member` / `save_team_member`, `get_setup_status`, `save_partial`, `get_task_state` / `log_task_run`
- Automatic usage-event logging on every tool call (powers member + admin analytics with no extra skill work)
- Plain REST API layer for the portal (same DB, no Claude involved)
- Plan gating (`members.plan` checked server-side on every write)
- Membership-status gating (active / paused / canceled → access)
- Token revocation ("Disconnect Claude")
- Test: MCP and API both reading/writing the same record correctly

## 2. Platform / Portal (porchlyte.com)

The web app itself — auth, hosting, account layer.

- Supabase Auth wired to porchlyte.com login
- Stripe webhooks syncing `members.status` and `plan` (billing is Stripe today via GHL checkout — hooking Stripe directly survives any future GHL move)
- Account page: membership status, connected-Claude indicator + revoke, export-all-data
- Per-agent hub pages: what each agent does, prompts/tools, hire status, usage stats
- Schedule panel for Darla/Rhonda: active/paused toggle, last run time + summary
- Admin view for Tracy: member list, setup-status columns, per-member connector diagnostics, usage analytics (sessions, most-used agents, who's gone quiet), edit-with-consent

## 3. Onboarding wizard

Where setup actually happens — no Claude account required.

- Voice / Brand / Local interview forms (same questions/pacing as the skills, as a form flow)
- Server-side Claude API call (Tracy's key) to write the plain-prose profile from answers
- "Meet your team" hiring wizard, one hire at a time, same answers-to-prose pattern
- Save-and-resume for partial answers
- Dashboard: Foundations (3 chips) + Team (9 chips) + connector diagnostics (plugin version installed vs. latest, last sync, linked-since)

## 4. Plugin consolidation

Merging today's two plugins into one, connector-first.

- Merge `porchlyte-foundations` + `porchlyte-agents` into one plugin/marketplace
- Rewrite all 12 skills (3 Foundations + 9 hires): connector-first read/write, local-file fallback retained
- Scheduled skills (Darla, Rhonda) check `get_task_state` at run start (pause/resume honored) and call `log_task_run` on completion
- Bundle the connector declaration in the plugin manifest (install = connect, one flow) — **phase-1 spike: verify the bundled OAuth flow works from a `.zip` install on a clean account before building onboarding copy around it**
- Migration path for existing two-plugin members
- Package for manual `.zip` distribution (works around the current marketplace caching bug)
- `/rescue`-equivalent logic retained as the safety net

## 5. Courses

Migrated off GoHighLevel, living inside the same portal login.

- Course structure: modules, lessons (video + text)
- Content migration from GHL (content moves as-is; no new content production)
- Member progress tracking
- Access tied to membership status/plan, same gating as the AI team

## 6. Community

Basic, on purpose — "our people in our house," not a Facebook rebuild.

- Posts, comments, reactions
- A handful of topic areas
- Pinned posts for announcements
- Member invite/migration off GHL community
- Access tied to membership status

## 7. Directory submission (optional, not part of core build)

Only if/when it's worth doing — see [connectors-directory-submission.md](./connectors-directory-submission.md) for why this is low priority.

- Confirm Team/Enterprise Claude.ai org status
- Public docs page + privacy policy page
- Fully-populated test account for reviewers
- `claude plugin validate` + MCP Inspector pass
- Submit and wait (no fixed timeline) — doesn't block or gate anything else

---

*This is a task outline, not a quote. See the proposal doc for pricing and phasing.*
