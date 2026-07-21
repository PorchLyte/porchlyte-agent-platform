import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { getFoundations, saveFoundation } from "@/lib/porchlyte/operations";
import { isFoundationKind } from "@/lib/porchlyte/constants";

export async function GET() {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  try {
    return Response.json(await getFoundations(ctx.db, ctx.memberId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  try {
    const body = await request.json();
    if (!isFoundationKind(body.kind) || typeof body.content !== "string") {
      return Response.json(
        { error: "Expected { kind: voice|brand|local, content: string }" },
        { status: 400 }
      );
    }
    const result = await saveFoundation(
      ctx.db,
      ctx.memberId,
      {
        kind: body.kind,
        content: body.content,
        interview_answers: body.interview_answers,
      },
      "portal_wizard"
    );
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
