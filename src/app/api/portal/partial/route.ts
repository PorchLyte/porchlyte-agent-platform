import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { savePartial } from "@/lib/porchlyte/operations";
import { isFoundationKind, isTeamAgent } from "@/lib/porchlyte/constants";

export async function POST(request: Request) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  try {
    const body = await request.json();
    const hasKind = typeof body.kind === "string" && isFoundationKind(body.kind);
    const hasAgent = typeof body.agent === "string" && isTeamAgent(body.agent);
    if ((!hasKind && !hasAgent) || body.answers === undefined) {
      return Response.json(
        { error: "Expected { kind or agent, answers, next_question? }" },
        { status: 400 }
      );
    }
    const input = hasKind
      ? { kind: body.kind, answers: body.answers, next_question: body.next_question }
      : { agent: body.agent, answers: body.answers, next_question: body.next_question };
    return Response.json(
      await savePartial(ctx.db, ctx.memberId, input, "portal_wizard")
    );
  } catch (error) {
    return errorResponse(error);
  }
}
