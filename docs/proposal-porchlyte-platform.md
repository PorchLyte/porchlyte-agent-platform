# PorchLyte Member Platform — Proposal

> **SUPERSEDED — do not send.** The active offer is [build-outline-client.md](./build-outline-client.md) ($5,000 build; ongoing work billed hourly per the existing arrangement). This document is kept for its scope framing, assumptions/exclusions language, and phase structure only. Pricing below is obsolete.

**Prepared for:** Tracy · PorchLyte + Agent Social Haus
**Prepared by:** Tie · MadeByTie
**Date:** July 15, 2026 · Valid 30 days

---

## The one-paragraph version

We build PorchLyte its own member platform: one login where your members manage their AI team, take your courses, and hang out in your community — replacing GoHighLevel for community and courses, and giving the AI Agent system a permanent, professional home. Their AI team's memory moves off their laptops and into PorchLyte's own infrastructure, so it works on their phone, their browser, and their desktop, and it stays theirs only while they're a member. You get an admin view of every member's setup, which turns "my AI sounds generic" support tickets into ten-second fixes.

---

## What's broken today (and what this fixes)

**The AI team's memory lives on each member's computer.** It only works in the desktop app, it dies with a laptop, you can't see it or help with it, and it keeps working after someone cancels. This month's plugin-update headaches showed how fragile the current pipeline is — we worked around it, but workarounds aren't a foundation for a growing paid program.

**Community and courses live in GoHighLevel.** Separate login, separate look, monthly cost, and none of it talks to the AI system that's the heart of the program.

**After this project:** members log into **one PorchLyte hub** for their courses, their community, and their AI team. Their Claude connects to PorchLyte once, and from then on their team remembers them on every device. When their membership ends, so does the access. That's your product, on your infrastructure, under your control.

---

## What your members get

- **Their AI team works everywhere.** Phone, web browser, desktop. Today the answer to "can I use my team on my phone?" is no. After this, it's yes.
- **One login for everything.** Courses, community, and their AI team settings in one branded PorchLyte hub.
- **Their setup is safe.** New laptop, deleted chat, reinstalled app — nothing is ever lost. Their Voice, Brand, Local, and team profiles live in their PorchLyte account.
- **They can see and edit their own profiles** in plain English on a simple settings page, no tech skills needed.

## What you get

- **A dashboard of every member's setup** — who finished their Foundations, who stalled halfway, who hasn't hired anyone. Support becomes "I can see exactly what's missing" instead of guessing.
- **Membership control.** Active members get the AI memory and the hub. Canceled members don't. Your program's stickiest feature is now literally tied to staying subscribed.
- **Off GoHighLevel** for community + courses (keep GHL for anything else you use it for, or drop it and pocket the subscription).
- **A platform you own** that we can keep building on: new courses, new AI team members, member analytics, future features.

---

## What we're building

### 1. The PorchLyte Hub (member web app)
Login at porchlyte.com. Inside:
- **My AI Team** — setup status at a glance, view/edit each profile, connect-your-Claude button.
- **Courses** — your course content, organized in modules and lessons (video + text), with member progress tracking. Content migrated over from GHL.
- **Community** — a clean, simple space: posts, comments, reactions, a few topic areas, pinned posts for announcements. Deliberately simple on purpose — the goal is "our people in our house," not rebuilding Facebook.
- **Account** — membership status, connected devices, data export.

### 2. The PorchLyte Connector (the invisible engine)
The hosted service that stores every member's AI team memory and serves it to their Claude apps securely. Members connect it once with a normal "log in with PorchLyte" screen. This is the piece that makes the AI team work across all their devices and makes memory membership-controlled.

### 3. Updated AI Agent plugins
Your existing Foundations and AI Agent Team plugins, revised so every skill reads from and saves to the member's PorchLyte account first (with their current local setup as automatic backup). Includes a one-command migration so existing members' saved profiles move up to their account in about a minute.

### 4. Admin tools for you
Member list with setup status, the ability to view and fix a member's profiles when they ask for help, and course/community management.

---

## Timeline and phases

Each phase ships something usable on its own. Roughly **10–12 weeks** end to end at a steady pace.

| Phase | What ships | Duration |
|---|---|---|
| **1. The Connector** | Hosted memory service live; tested with your account and mine | 2–3 weeks |
| **2. Plugin update** | Skills read/write PorchLyte accounts; member migration command; beta with a few friendly members | 1 week |
| **3. The Hub — AI Team** | Member login, AI team dashboard and profile editors, your admin view | 2–3 weeks |
| **4. Courses** | Course platform built, GHL content migrated, progress tracking | 2 weeks |
| **5. Community** | Community space live; members invited over from GHL | 2 weeks |
| **6. Launch** | Member rollout: instructions page, launch-week support, GHL wind-down | 1 week |

---

## Investment

### Option A — Project fee

| Phase | Price |
|---|---|
| 1. The Connector (hosted memory service) | $4,500 |
| 2. Plugin update + member migration | $1,500 |
| 3. The Hub: AI team pages + admin | $4,500 |
| 4. Courses + GHL migration | $3,500 |
| 5. Community | $3,500 |
| 6. Launch support | $1,500 |
| **Total** | **$19,000** |
| **Bundle price (all six phases committed up front)** | **$16,900** |

Billed per phase as each begins. Each phase has a clear acceptance test (e.g., Phase 1 = your own Claude account connected and remembering you).

**Plus a care plan: $500/month** once Phase 1 goes live. This covers what a hosted platform genuinely needs: monitoring, backups, security updates, keeping pace with Anthropic's frequent changes (this month was a live demonstration), and small fixes. New features are scoped separately.

### Option B — Partner pricing

**$11,500 build** (phases 1–6) **+ $2 per active member per month** (replaces the care plan, $500/month minimum). Your costs scale with your membership, and I'm invested in the program growing. At 400 members this costs more than Option A over time — that's the point; choose this if you'd rather keep cash up front and share the upside.

### Running costs (yours, direct)

Hosting runs on accounts in your name (Supabase, Vercel — already set up): roughly **$50–100/month** at current membership size. For context, that's likely less than the GHL subscription this replaces.

---

## Assumptions and what's not included

- Course **content** moves over as-is; new content creation, video editing, and copywriting are separate work.
- Community is the "basic" scope described above. DMs, live streams, gamification, and mobile push notifications are future phases if you want them.
- Member payments/billing stay wherever they are today; the platform syncs membership status from it. (If you want billing moved too, we scope that separately.)
- Launch-week member support is included; ongoing member-by-member tech support beyond that is covered by the care plan for platform issues, not for general Claude coaching.
- Anything Anthropic changes upstream that requires rework beyond routine upkeep gets scoped honestly when it happens — this month taught us both that lesson.

---

## Why this and why now

The AI Agent program is the most differentiated thing PorchLyte sells, and right now its most valuable data — every member's personalized setup — lives in places you can't see, on machines you don't control, working on exactly one app surface. Moving it onto PorchLyte's own platform makes the program more reliable for members, more supportable for you, more sticky for the business, and it consolidates the community and courses into the same front door while we're at it.

**Next step:** pick Option A or B, and phase 1 starts within a week.

— Tie
