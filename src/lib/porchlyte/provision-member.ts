import { createAdminClient } from "@/lib/supabase/admin";
import type { MemberPlan, MemberStatus } from "@/lib/porchlyte/constants";
import type { TablesUpdate } from "@/lib/supabase/types";

export type ProvisionInput = {
  email: string;
  name?: string | null;
  plan: MemberPlan;
  status?: MemberStatus;
  ghlContactId?: string | null;
  /** Audit actor — defaults to "ghl". Never triggers email. */
  actor?: string;
};

export type ProvisionResult = {
  memberId: string;
  email: string;
  plan: MemberPlan;
  created: boolean;
};

const PLAN_RANK: Record<MemberPlan, number> = {
  foundations: 1,
  team: 2,
  trifecta: 2,
  full: 3,
};

/**
 * Create or update a hub member from an external source (GHL webhook, import).
 * Never sends email — Auth user is created with email_confirm: true so they
 * can OTP/password login when they arrive via GHL's own welcome email.
 */
export async function provisionMember(
  input: ProvisionInput
): Promise<ProvisionResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required");
  }

  const status: MemberStatus = input.status ?? "active";
  const name = input.name?.trim() || null;
  const ghlContactId = input.ghlContactId?.trim() || null;
  const db = createAdminClient();

  const { data: existingMember, error: findErr } = await db
    .from("members")
    .select("id, email, plan")
    .eq("email", email)
    .maybeSingle();
  if (findErr) throw findErr;

  let memberId = existingMember?.id ?? null;
  let created = false;

  if (memberId) {
    const { error: updAuthErr } = await db.auth.admin.updateUserById(memberId, {
      user_metadata: {
        ...(name ? { name } : {}),
        ...(ghlContactId ? { ghl_contact_id: ghlContactId } : {}),
      },
    });
    if (updAuthErr) throw updAuthErr;
  } else {
    const { data: createdUser, error: createErr } =
      await db.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          ...(name ? { name } : {}),
          ...(ghlContactId ? { ghl_contact_id: ghlContactId } : {}),
        },
      });

    if (createErr) {
      // Race / auth row without members row — resolve by email.
      const existing = await findAuthUserByEmail(db, email);
      if (!existing) throw createErr;
      memberId = existing.id;
      const { error: updAuthErr } = await db.auth.admin.updateUserById(
        memberId,
        {
          user_metadata: {
            ...(name ? { name } : {}),
            ...(ghlContactId ? { ghl_contact_id: ghlContactId } : {}),
          },
        }
      );
      if (updAuthErr) throw updAuthErr;
    } else {
      memberId = createdUser.user.id;
      created = true;
    }
  }

  const currentPlan = (existingMember?.plan as MemberPlan | undefined) ?? null;
  const plan = preferPlan(currentPlan, input.plan);

  const update: TablesUpdate<"members"> = {
    plan,
    status,
  };
  if (name) update.name = name;

  const { data: updated, error: memErr } = await db
    .from("members")
    .update(update)
    .eq("id", memberId)
    .select("id")
    .maybeSingle();
  if (memErr) throw memErr;

  if (!updated) {
    // Trigger may have lagged; insert the member row ourselves.
    const { error: insertErr } = await db.from("members").insert({
      id: memberId,
      email,
      name,
      plan,
      status,
    });
    if (insertErr) throw insertErr;
  }

  await db.from("audit_log").insert({
    member_id: memberId,
    actor: input.actor ?? "ghl",
    action: created ? "member_provisioned" : "member_updated",
    entity: JSON.stringify({
      email,
      plan,
      status,
      ghl_contact_id: ghlContactId,
    }),
  });

  return { memberId, email, plan, created };
}

function preferPlan(
  current: MemberPlan | null,
  incoming: MemberPlan
): MemberPlan {
  if (!current) return incoming;
  return PLAN_RANK[incoming] >= PLAN_RANK[current] ? incoming : current;
}

async function findAuthUserByEmail(
  db: ReturnType<typeof createAdminClient>,
  email: string
) {
  // Paginate a short scan — Auth Admin has no get-by-email in all SDK versions.
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await db.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;
    if (data.users.length < 200) break;
  }
  return null;
}
