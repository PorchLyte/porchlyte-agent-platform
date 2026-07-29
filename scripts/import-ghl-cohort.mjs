/**
 * Import GHL Claude Foundations / Claude Insiders buyers into Supabase.
 *
 * Creates/updates Auth users + members rows only. Does NOT send email.
 * Members sign in themselves at the hub via magic link (signInWithOtp).
 *
 * Usage:
 *   node --env-file=.env.local scripts/import-ghl-cohort.mjs
 *   node --env-file=.env.local scripts/import-ghl-cohort.mjs --apply
 *   node --env-file=.env.local scripts/import-ghl-cohort.mjs --apply --active-only
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const APPLY = process.argv.includes("--apply");
const ACTIVE_ONLY = process.argv.includes("--active-only");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const secret =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !secret || secret.includes("your-")) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY in env.");
  process.exit(1);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));
  });
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

const csvPath = resolve("docs/exports/ghl-claude-cohort.csv");
const rows = parseCsv(readFileSync(csvPath, "utf8"));

const cohort = ACTIVE_ONLY
  ? rows.filter((r) => r.status === "active")
  : rows;

const db = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(
  `${APPLY ? "APPLY" : "DRY-RUN"} — ${cohort.length} members` +
    `${ACTIVE_ONLY ? " (active only)" : ""}` +
    " (no emails)"
);

let created = 0;
let updated = 0;
let skipped = 0;
let errors = 0;

for (const row of cohort) {
  const email = row.email?.trim().toLowerCase();
  const name = row.name?.trim() || null;
  const plan = row.plan;
  const status = row.status;
  const ghlContactId = row.ghl_contact_id || null;

  if (!email || !plan || !status) {
    console.warn("skip malformed row", row);
    skipped++;
    continue;
  }

  const label = `${email} → plan=${plan} status=${status}`;

  if (!APPLY) {
    console.log(`  would upsert  ${label}`);
    continue;
  }

  try {
    const { data: existingMember, error: findErr } = await db
      .from("members")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();
    if (findErr) throw findErr;

    let userId = existingMember?.id ?? null;

    if (userId) {
      const { error: updAuthErr } = await db.auth.admin.updateUserById(userId, {
        user_metadata: { name, ghl_contact_id: ghlContactId },
      });
      if (updAuthErr) throw updAuthErr;
      updated++;
    } else {
      // email_confirm: true marks them verified without sending a confirm email.
      const { data: createdUser, error: createErr } =
        await db.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { name, ghl_contact_id: ghlContactId },
        });
      if (createErr) throw createErr;
      userId = createdUser.user.id;
      created++;
    }

    // handle_new_user trigger creates members row; set plan/status/name.
    const { error: memErr } = await db
      .from("members")
      .update({ plan, status, name })
      .eq("id", userId);
    if (memErr) throw memErr;

    console.log(`  ok  ${label}  id=${userId}`);
  } catch (err) {
    errors++;
    console.error(`  FAIL  ${label}:`, err.message ?? err);
  }
}

console.log(
  `\nDone. created=${created} updated=${updated} skipped=${skipped} errors=${errors}`
);
if (!APPLY) {
  console.log("Re-run with --apply to write. No emails are ever sent by this script.");
}
