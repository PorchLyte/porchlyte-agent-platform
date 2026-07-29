# Reply-To: support@porchlyte.com

The HTML templates (`body.html`) **cannot** set Reply-To. That header is not part of Supabase’s email template editor.

## What you can do today (hosted Supabase)

### Option A — Sender = support (simplest)

**Authentication → [SMTP Settings](https://supabase.com/dashboard/project/ipuvzdcjyswxvpviroma/auth/smtp)**

Enable custom SMTP and set:

| Field | Value |
| --- | --- |
| Sender email | `support@porchlyte.com` |
| Sender name | `PorchLyte AI Agent Hub` |

Replies go to support because that’s the From address. Verify `support@porchlyte.com` (or the whole domain) with your SMTP provider first.

Custom SMTP is required for production anyway — built-in Supabase mail is capped and won’t reach the cohort.

### Option B — From = noreply, Reply-To = support (cleaner)

Use this when you want bounces/noise off the support inbox:

1. **Sender email:** e.g. `noreply@porchlyte.com` (verified on the provider)
2. **Reply-To:** `support@porchlyte.com`

Hosted Auth SMTP settings expose From / sender name, but **not** a dedicated Reply-To field. To get a real `Reply-To` header you need one of:

- Your email provider’s default Reply-To (if it supports that for SMTP)
- A [Send Email Auth Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook) that sends via the provider API and sets `reply_to: support@porchlyte.com` (e.g. Resend)

GoTrue supports extra headers via `GOTRUE_SMTP_HEADERS` (JSON `{"Reply-To":["support@porchlyte.com"]}`), but that is not reliably configurable from the Supabase dashboard / public Management API on hosted projects.

## Recommendation for PorchLyte

Until a Send Email hook is wired up: use **Option A** — custom SMTP with sender `support@porchlyte.com`.
