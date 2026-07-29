---
description: Recover Foundations and team profiles from conversation memory into the PorchLyte account.
---

# Rescue / recover

Same goal as `/migrate`: pull what you can from this chat into the PorchLyte connector.

1. Call `get_setup_status`.
2. Reconstruct Voice / Brand / Local and any hired agents from conversation only — show each profile, confirm, then `save_foundation` / `save_team_member`.
3. If unsure, say so and offer the interview instead of guessing.
4. Finish with `get_setup_status` and a plain summary.

Do not write local `~/porchlyte` files. The account is the source of truth.
