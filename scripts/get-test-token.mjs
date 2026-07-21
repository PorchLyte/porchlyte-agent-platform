// Signs in the seeded test member and prints an access token, for exercising
// the MCP door by hand. Run from the repo root: node scripts/get-test-token.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const anon = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await anon.auth.signInWithPassword({
  email: "tie+porchlyte-mcp-test@madebytie.com",
  password: "porchlyte-test-9f3kD72m",
});
if (error) throw error;
console.log("user id:", data.user.id);
console.log("TOKEN=" + data.session.access_token);
