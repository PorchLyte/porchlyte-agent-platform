# Submitting the PorchLyte Connector to Anthropic's Connectors Directory

**Status:** Draft v1 · July 15, 2026
**Relates to:** [mcp-server-implementation-plan.md](./mcp-server-implementation-plan.md)

This doc covers whether, when, and how to submit the PorchLyte MCP server to Anthropic's public [Connectors Directory](https://claude.com/connectors/directory) — a separate, optional step from building and shipping the connector itself. Members can use the PorchLyte connector today by adding it as a **custom connector** with a direct URL (Settings → Connectors → Add custom connector), whether or not it's ever listed in the public directory. Submission only matters for public discoverability.

---

## Do we actually want this?

Worth deciding deliberately before doing any of the submission work below, because it's not free and it's not required.

**The case for submitting:**
- Directory listing is a trust signal — "reviewed by Anthropic" carries weight for a membership audience that isn't technical.
- It's a small amount of marketing surface: a public listing page members (or prospective members) can find.

**The case against, or against doing it *first*:**
- **PorchLyte's connector is private-by-nature** — it's only useful to paying PorchLyte members, authenticated against PorchLyte's own membership database. It gets zero value from public discovery the way a general-purpose tool (Slack, Notion, Figma) does. Nobody browses the directory looking for it; every member arrives via a link from Tracy.
- Submission requires a **Team or Enterprise Claude.ai organization** with admin/directory-management access (see below) — a real account-level prerequisite, not just a form to fill out.
- Review criteria are strict enough (separate read/write tools, no vague error messages, full tool-by-tool testing) that submitting early, before the connector is stable, risks a rejection that costs review-queue time without benefit.
- **Distribution to members never depends on directory approval.** The custom-connector-by-URL path works identically whether or not the directory listing is live.

**Recommendation:** build and ship the connector to members via direct URL first (this is already the plan — see Component 2 of the implementation plan). Treat directory submission as an optional phase 5+ item, done once the connector has real usage and is stable, purely for the trust-signal/marketing value. Don't let it block or complicate the core build.

---

## What submission actually requires

Sourced directly from Anthropic's current developer docs (`claude.com/docs/connectors/building/submission` and `.../review-criteria`), July 2026.

### Account prerequisite

- Submission happens through the **submission portal** inside Claude.ai admin settings: `claude.ai/admin-settings/directory/submissions/new`.
- Requires a **Team or Enterprise organization** — not available on individual/Pro plans. By default only organization **Owners/Primary owners** can submit; Enterprise can delegate via a custom role with **Directory management** or **Libraries** permission.
- **Action needed:** confirm whether Tracy's or PorchLyte's Claude usage is already on a Team/Enterprise plan, or whether one needs to be stood up specifically to submit. This is a real prerequisite, not paperwork.

### The five submission requirements

1. **Security** — meets Anthropic's security standards (general).
2. **Tool annotations** — every tool needs a `title` and the applicable `readOnlyHint: true` or `destructiveHint: true`.
3. **Authentication** — OAuth 2.0 for authenticated services. (PorchLyte's connector already plans OAuth 2.1 + PKCE per the implementation plan — exceeds this requirement.)
4. **Privacy policy** — required for local connectors specifically (README section + `manifest.json` entry + HTTPS URL). PorchLyte's is a **remote** MCP server, so this specific local-connector clause may not apply directly, but a public privacy policy is still required as general documentation (see below) — treat it as required either way given member PII is involved.
5. **Documentation** — clear setup/usage instructions, publicly reachable by publish date (a help-center article or blog post is sufficient; can be shared privately with Anthropic during review before that).

### The hard technical rule that affects our tool design now

> **A single tool that accepts both safe methods (GET) and unsafe methods (POST/PUT/DELETE) is automatically rejected.** Split into a read-only tool and one or more write tools, ideally split further by action type (create/update/delete).

**This changes nothing about the tool list already in the implementation plan** — `get_foundations`/`save_foundation`, `get_team_member`/`save_team_member`, etc. are already split by read vs. write. Worth calling out explicitly as a constraint to keep in mind as more tools get added (phase 4's `add_memory`/`search_memories`/`log_touch` already follow the same pattern). Just don't ever consolidate into a generic `foundations_request(action, ...)`-style tool for convenience — that shape is an automatic rejection.

### Other pre-submission rules worth designing around now, even before submitting

These are Anthropic's stated common rejection reasons — cheap to satisfy by default, expensive to retrofit:

- **Tool names ≤ 64 characters.**
- **Every tool must return a real, actionable error** — no generic "Internal Server Error" with no detail. (Already implied by the implementation plan's "friendly error the skill can relay" design for expired memberships — keep that standard for every failure mode, not just that one.)
- **Responses must be right-sized** — don't return more than what was asked for. (Already a stated design rule in the implementation plan.)
- **Never read Claude's memory, chat history, or conversation summaries from within a tool.** PorchLyte's tools only ever touch PorchLyte's own database — already compliant by design.
- **The MCP server's domain must match the service it calls** (no proxying unrelated third-party APIs). PorchLyte's server only calls its own API — compliant by design.

### Review process and timeline

- Two review tiers: every submitted server is auto-scanned and listed by default as a **"community connector."** Anthropic may separately escalate a listing to **"verified"** review (higher-touch, a human runs every tool) if it's flagged as highly useful — this escalation is automatic, not something to request.
- **No published SLA.** Anthropic states review times "vary with queue volume." (Third-party sources report anywhere from two weeks to several months in practice — not an official figure, treat as rough intuition only, not a plannable date.)
- Track status and reviewer feedback in the **submissions dashboard** (`claude.ai/admin-settings/directory/submissions`). Escalation contact: `mcp-review@anthropic.com`.
- Run `claude plugin validate` and exercise every tool via the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) and as a real custom connector in Claude **before** submitting — this is Anthropic's own stated pre-submission checklist, not optional prep.

### What the submission portal actually walks through

For reference when the time comes — nine steps, autosaved per browser session: Introduction → Connection (server URL, transport) → Tools (auto-synced from the live server; anything missing a title/annotation is flagged here) → Listing (name, tagline, description, category, docs/privacy URLs, icon) → Use cases → Company → Authentication → Data handling → Test & launch (test account credentials good enough for a reviewer to fully exercise the server) → Compliance (seven required policy acknowledgments) → final Review.

---

## Recommendation for the phased rollout

Add as an explicit, later phase in the implementation plan rather than bundling into phase 1–4:

**Phase 6 — Directory submission (optional, post-launch)**
- Prerequisite: confirm/stand up a Team or Enterprise Claude.ai org with directory-management access.
- Prepare: public docs page, privacy policy page, a fully-populated test account for reviewers, icon/branding assets.
- Run `claude plugin validate` + MCP Inspector pass on every tool.
- Submit via the portal; budget for an unpredictable review window (weeks to months) with no other work blocked on it.

Nothing else in the build should wait on this.

---

## Open questions

1. **Do we want this at all**, given the connector is private/members-only and gets little value from public discovery? (Leaning: yes eventually, for the trust signal, but genuinely low priority.)
2. **Team/Enterprise org status** — does one already exist for PorchLyte, or does this add a recurring Claude.ai cost on top of the hosting stack?
3. Confirm whether PorchLyte's **privacy policy** (needed either way, given member PII) should be a standalone page or a section of an existing porchlyte.com policy page.
