import { provisionMember } from "@/lib/porchlyte/provision-member";
import type { MemberPlan } from "@/lib/porchlyte/constants";

export const runtime = "nodejs";

/**
 * Tags Tracy uses in GHL → hub plan.
 * Never sends email from this app — GHL owns the welcome / login link email.
 */
const TAG_PLAN: Record<string, MemberPlan> = {
  "claude insider member": "full",
  "claude foundations member": "foundations",
};

/**
 * GHL workflow webhook → silently provision a hub Auth user + members row.
 *
 * Auth: Authorization: Bearer <GHL_WEBHOOK_SECRET>
 *   or header x-ghl-webhook-secret: <GHL_WEBHOOK_SECRET>
 *
 * Suggested GHL Custom Webhook JSON body:
 * {
 *   "email": "{{contact.email}}",
 *   "firstName": "{{contact.first_name}}",
 *   "lastName": "{{contact.last_name}}",
 *   "contactId": "{{contact.id}}",
 *   "tag": "claude insider member"
 * }
 *
 * (Use the matching tag string for Foundations workflows.)
 */
export async function POST(request: Request) {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (!secret) {
    console.error("GHL_WEBHOOK_SECRET not configured");
    return Response.json({ error: "Not configured" }, { status: 500 });
  }
  if (!authorize(request, secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      body = Object.fromEntries(form.entries());
    } else {
      body = await request.json();
    }
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = parsePayload(body);
  if (!parsed.email) {
    return Response.json({ error: "email is required" }, { status: 400 });
  }
  if (!parsed.plan) {
    return Response.json(
      {
        error: "No provisionable tag",
        hint: `Expected one of: ${Object.keys(TAG_PLAN).join(", ")}`,
        tags: parsed.tagsSeen,
      },
      { status: 422 }
    );
  }

  try {
    const result = await provisionMember({
      email: parsed.email,
      name: parsed.name,
      plan: parsed.plan,
      status: "active",
      ghlContactId: parsed.contactId,
    });
    return Response.json({
      ok: true,
      created: result.created,
      memberId: result.memberId,
      email: result.email,
      plan: result.plan,
    });
  } catch (err) {
    console.error("GHL provision failed:", err);
    return Response.json({ error: "Provision failed" }, { status: 500 });
  }
}

function authorize(request: Request, secret: string): boolean {
  const bearer = request.headers.get("authorization");
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    if (timingSafeEqual(bearer.slice(7).trim(), secret)) return true;
  }
  const header = request.headers.get("x-ghl-webhook-secret");
  if (header && timingSafeEqual(header.trim(), secret)) return true;
  return false;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function parsePayload(body: unknown): {
  email: string | null;
  name: string | null;
  contactId: string | null;
  plan: MemberPlan | null;
  tagsSeen: string[];
} {
  const root = asRecord(body) ?? {};
  const contact = asRecord(root.contact) ?? asRecord(root.data) ?? root;

  const email = firstString(
    contact.email,
    contact.Email,
    root.email,
    root.Email
  );

  const firstName = firstString(
    contact.firstName,
    contact.first_name,
    root.firstName,
    root.first_name
  );
  const lastName = firstString(
    contact.lastName,
    contact.last_name,
    root.lastName,
    root.last_name
  );
  const fullName = firstString(contact.name, contact.Name, root.name, root.Name);
  const name =
    fullName ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    null;

  const contactId = firstString(
    contact.id,
    contact.contactId,
    contact.contact_id,
    root.contactId,
    root.contact_id,
    root.id
  );

  const tagsSeen = collectTags(root, contact);
  const plan = planFromTags(tagsSeen);

  return {
    email: email?.toLowerCase() ?? null,
    name,
    contactId,
    plan,
    tagsSeen,
  };
}

function collectTags(
  root: Record<string, unknown>,
  contact: Record<string, unknown>
): string[] {
  const bags = [
    root.tag,
    root.tags,
    root.Tag,
    root.Tags,
    contact.tag,
    contact.tags,
    contact.Tag,
    contact.Tags,
  ];
  const out: string[] = [];
  for (const bag of bags) {
    if (typeof bag === "string") {
      for (const part of bag.split(/[,|]/)) {
        const t = part.trim();
        if (t) out.push(t);
      }
    } else if (Array.isArray(bag)) {
      for (const item of bag) {
        if (typeof item === "string" && item.trim()) out.push(item.trim());
        else if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          const name = firstString(rec.name, rec.tag, rec.label);
          if (name) out.push(name);
        }
      }
    }
  }
  return out;
}

function planFromTags(tags: string[]): MemberPlan | null {
  let best: MemberPlan | null = null;
  const rank: Record<MemberPlan, number> = {
    foundations: 1,
    team: 2,
    trifecta: 2,
    full: 3,
  };
  for (const raw of tags) {
    const key = raw.trim().toLowerCase();
    const plan = TAG_PLAN[key];
    if (!plan) continue;
    if (!best || rank[plan] > rank[best]) best = plan;
  }
  return best;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}
