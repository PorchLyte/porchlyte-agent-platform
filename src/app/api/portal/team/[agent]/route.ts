import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { getTeamMember, saveTeamMember } from "@/lib/porchlyte/operations";
import { isTeamAgent } from "@/lib/porchlyte/constants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agent: string }> }
) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  const { agent } = await params;
  if (!isTeamAgent(agent)) {
    return Response.json({ error: `Unknown agent: ${agent}` }, { status: 404 });
  }
  try {
    return Response.json(await getTeamMember(ctx.db, ctx.memberId, agent));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ agent: string }> }
) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  const { agent } = await params;
  if (!isTeamAgent(agent)) {
    return Response.json({ error: `Unknown agent: ${agent}` }, { status: 404 });
  }
  try {
    const body = await request.json();
    if (typeof body.content !== "string") {
      return Response.json(
        { error: "Expected { content: string }" },
        { status: 400 }
      );
    }
    const result = await saveTeamMember(
      ctx.db,
      ctx.memberId,
      { agent, content: body.content, interview_answers: body.interview_answers },
      "portal_wizard"
    );
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
