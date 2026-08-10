import { getAdminContext, unauthorized, errorResponse } from "@/lib/porchlyte/portal-auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin-only: set (or replace) a member's email/password so they can sign in
 * when OTP/magic-link delivery fails.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const ctx = await getAdminContext();
    if (!ctx) return unauthorized();

    const { memberId } = await params;
    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim() ?? "";

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (password.length > 72) {
      return Response.json(
        { error: "Password is too long." },
        { status: 400 }
      );
    }

    const { data: member } = await ctx.db
      .from("members")
      .select("id, email, status")
      .eq("id", memberId)
      .maybeSingle();

    if (!member) {
      return Response.json({ error: "Member not found." }, { status: 404 });
    }
    if (member.status !== "active") {
      return Response.json(
        { error: "Member is not active — reactivate before setting a password." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(memberId, {
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("admin set password failed:", error.message);
      return Response.json(
        { error: "Couldn't set password. Check Auth settings allow email passwords." },
        { status: 500 }
      );
    }

    await ctx.db.from("audit_log").insert({
      member_id: memberId,
      actor: `admin:${ctx.memberId}`,
      action: "set_password",
      entity: "auth_user",
    });

    return Response.json({
      ok: true,
      email: member.email,
      message: "Password set. Share it with the member out of band.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
