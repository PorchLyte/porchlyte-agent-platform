import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { saveFoundation } from "@/lib/porchlyte/operations";
import { isFoundationKind } from "@/lib/porchlyte/constants";
import { generateFoundationProse } from "@/lib/porchlyte/generate-profile";

/**
 * Wizard "finish" step: turn interview answers into profile prose server-side
 * (PorchLyte's Anthropic key), then save the completed foundation. One call so
 * the wizard's last step is atomic. Streaming isn't needed — the profile is
 * short and well under the SDK's non-streaming timeout ceiling.
 */
export async function POST(request: Request) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  try {
    const body = await request.json();
    if (!isFoundationKind(body.kind) || typeof body.answers !== "object") {
      return Response.json(
        { error: "Expected { kind, answers }" },
        { status: 400 }
      );
    }

    const { data: member } = await ctx.db
      .from("members")
      .select("name")
      .eq("id", ctx.memberId)
      .maybeSingle();

    const content = await generateFoundationProse(
      body.kind,
      body.answers,
      member?.name
    );

    await saveFoundation(
      ctx.db,
      ctx.memberId,
      { kind: body.kind, content, interview_answers: body.answers },
      "portal_wizard"
    );

    return Response.json({ ok: true, kind: body.kind, content });
  } catch (error) {
    return errorResponse(error);
  }
}
