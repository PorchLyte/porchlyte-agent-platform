# Migration Playbook — old chats → platform

**Status:** Draft v1 · July 21, 2026

There is only **one** migration to run, ever: existing members' Foundations and
hired-agent profiles, which today live in **Claude chat/project memory**, get
recovered and pushed up into the PorchLyte platform through the connector.

Why only one: the July 2026 local-file update (`~/porchlyte/` + `/rescue`) was
built and pushed to GitHub but **never reached members** (the Cowork marketplace
cache bug held the rollout). So members are still on the original,
chat-memory-only version — there are no clean local `voice.md`/`brand.md` files
to copy. The migration is a **recovery-and-extract** operation, not a file copy.

This reuses the `/rescue` signature-phrase logic (the recovery already designed
for exactly this), but saves through the MCP tools `save_foundation` /
`save_team_member` instead of writing local files.

## Prerequisites

1. Member has installed the consolidated PorchLyte plugin and connected Claude
   (the connector is authorized).
2. The member runs the recovery prompt **inside the Claude project/chat where
   their history lives** — that's where the memory to recover actually is.

## Signature phrases the recovery looks for

Ported from the foundation and team skills' profile formats:

| Concern | Opening phrase in stored profile |
|---|---|
| Voice | `You write like …` |
| Brand | `Your brand is …` |
| Local | `Your market is …` |
| Team hire | `<Name> is …` (e.g. `Darla is …`, `Chloe is …`) |

Even where a clean profile paragraph doesn't exist, the member's answers are
often recoverable from the conversation (their differentiator, their phrases,
their neighborhoods, their VIP list, etc.).

---

## The recovery prompt (paste into the member's existing Claude project)

> **PorchLyte migration — recover my setup and save it to my account.**
>
> You have the PorchLyte connector available. I've been using the older
> PorchLyte AI Agent Team in this project/chat, and my Foundations and any hired
> agents currently live only in this conversation's memory. Move them into my
> PorchLyte account.
>
> Do this carefully and in order:
>
> 1. **Check what's already saved.** Call `get_setup_status`. Anything already
>    `complete`/`hired` on the platform — leave it alone unless I tell you it's
>    out of date.
>
> 2. **Recover my Foundations from this conversation.** Look through everything
>    you know about me here for my **Voice** (how I write — my phrases, my
>    differentiator, the agent-speak I hate), my **Brand** (colors, fonts,
>    aesthetic, references), and my **Local** market (city, neighborhoods,
>    quirks, teams/schools). Reconstruct each profile in the exact PorchLyte
>    format — plain prose, no bullets, no headers, opening with "You write
>    like…", "Your brand is…", and "Your market is…" respectively. **Use only
>    what I actually told you. Do not invent or generalize.** For each one you
>    can reconstruct, show it to me and ask me to confirm or correct it before
>    saving. On my confirmation, call `save_foundation` for that foundation.
>
> 3. **Recover my hired agents.** For any AI Agent Team member I clearly set up
>    or used in this project (Darla, Chloe, Ella, Poppy, Treena, Lia, Sloane,
>    Rhonda, Olivia), reconstruct their profile the same way — plain prose,
>    opening with "<Name> is…", using only what I told you — show it to me, and
>    on my confirmation call `save_team_member`.
>
> 4. **If you can't confidently recover something, say so** and offer to run the
>    short interview for it instead of guessing. Never fabricate a profile.
>
> 5. **When done, call `get_setup_status` again** and give me a plain summary of
>    what's now saved to my PorchLyte account and what still needs setup — with
>    a reminder that I can finish anything on porchlyte.com.

---

## Notes for the person running the rollout

- **Confirmation-gated on purpose.** The prompt makes Claude show each
  reconstructed profile before saving, so a bad recovery never silently
  overwrites good data. `save_foundation`/`save_team_member` are idempotent
  upserts, so re-running is safe.
- **Plan gating still applies.** `save_team_member` refuses agents the member's
  plan doesn't include — expected, and the member sees a friendly upgrade note.
- **Old marketplaces:** add README pointers to the new single plugin once the
  consolidated plugin ships (Phase 3).
- **Do the connector spike first.** Don't build member-facing onboarding copy
  around "one install" until the bundled-connector OAuth flow is confirmed on a
  clean Cowork account.
