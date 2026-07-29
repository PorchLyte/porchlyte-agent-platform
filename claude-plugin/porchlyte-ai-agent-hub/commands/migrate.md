---
description: Migrate Foundations and hired agents from old Claude chat memory into the PorchLyte account via the connector.
---

# Migrate my PorchLyte setup

Run this in the **old Claude project/chat** where the member's history lives — that's where the memory to recover actually is. The PorchLyte connector must already be authorized.

Do this carefully and in order:

1. **Check what's already saved.** Call `get_setup_status`. Anything already `complete`/`hired` on the platform — leave it alone unless they say it's out of date.

2. **Recover Foundations from this conversation.** Look through everything you know about them here for **Voice**, **Brand**, and **Local**. Reconstruct each profile in PorchLyte format — plain prose, no bullets, no headers, opening with "You write like…", "Your brand is…", and "Your market is…" respectively. **Use only what they actually told you. Do not invent.** For each one you can reconstruct, show it and ask them to confirm before saving. On confirmation, call `save_foundation`.

3. **Recover hired agents.** For any team member they clearly set up (Darla, Chloe, Ella, Poppy, Treena, Lia, Sloane, Rhonda, Olivia), reconstruct the same way — plain prose, opening with "<Name> is…" — show it, and on confirmation call `save_team_member`.

4. **If you can't confidently recover something, say so** and offer the short interview instead of guessing.

5. **When done, call `get_setup_status` again** and give a plain summary of what's saved and what still needs setup — with a reminder they can finish at https://aiagents.porchlyte.com.
