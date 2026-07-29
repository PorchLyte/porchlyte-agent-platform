import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { getScheduledTasks } from "@/lib/porchlyte/operations";
import { isScheduledAgent } from "@/lib/porchlyte/constants";

/** List every named scheduled task the member has for this agent. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agent: string }> }
) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  const { agent } = await params;
  if (!isScheduledAgent(agent)) {
    return Response.json(
      { error: `${agent} is not a scheduled agent` },
      { status: 404 }
    );
  }
  try {
    return Response.json(await getScheduledTasks(ctx.db, ctx.memberId, agent));
  } catch (error) {
    return errorResponse(error);
  }
}
