# PorchLyte Supabase email templates

Each folder is **one** Supabase Auth email template — ready to copy and paste.

Paste into: [Authentication → Email Templates](https://supabase.com/dashboard/project/ipuvzdcjyswxvpviroma/auth/templates)

## How to paste (every template)

1. Open the matching template in the Supabase dashboard
2. Copy `subject.txt` → **Subject** field
3. Copy entire `body.html` → **Message body** field
4. Save

## Templates

| Folder | Supabase template name | Subject |
|---|---|---|
| `01-magic-link/` | Magic Link | `Your PorchLyte sign-in code: {{ .Token }}` |
| `02-confirm-signup/` | Confirm sign up | `Confirm your PorchLyte email` |
| `03-invite-user/` | Invite user | `You're invited to the PorchLyte AI Agent Hub` |
| `04-reset-password/` | Reset password | `Reset your PorchLyte password` |
| `05-change-email/` | Change email address | `Confirm your new PorchLyte email` |
| `06-reauthentication/` | Reauthentication | `{{ .Token }} is your PorchLyte verification code` |

**Start with `01-magic-link/`** — that’s what members get when they sign in at `/`.

## Also set

**Authentication → URL Configuration**

- Site URL: `https://aiagents.porchlyte.com`
- Redirect URLs: `https://aiagents.porchlyte.com/**`, `http://localhost:3000/**`

Magic-link buttons use `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=…` so the link works on any device (OTP code already did). Deploy the updated `/auth/callback` route before re-pasting templates.

**Reply-To → `support@porchlyte.com`**

Not set in these HTML files — configure under SMTP. See [REPLY-TO.md](./REPLY-TO.md).

## Brand notes

Warm cream / tan / ink palette. Logo in emails:

`https://aiagents.porchlyte.com/brand/porchlyte-logo.png`

Served from `public/brand/porchlyte-logo.png` once the subdomain is deployed.
