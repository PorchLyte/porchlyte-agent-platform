import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { getTaskState, setTaskState } from "@/lib/porchlyte/operations";
import { isScheduledAgent } from "@/lib/porchlyte/constants";

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
    return Response.json(await getTaskState(ctx.db, ctx.memberId, agent));
  } catch (error) {
    return errorResponse(error);
  }
}

/** Hub schedule panel: pause/resume + schedule label. */
export async function PATCH(
  request: Request,
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
    const body = await request.json();
    if (body.state !== undefined && !["active", "paused"].includes(body.state)) {
      return Response.json(
        { error: "state must be 'active' or 'paused'" },
        { status: 400 }
      );
    }
    await setTaskState(ctx.db, ctx.memberId, agent, {
      state: body.state,
      schedule_label: body.schedule_label,
    });
    return Response.json(await getTaskState(ctx.db, ctx.memberId, agent));
  } catch (error) {
    return errorResponse(error);
  }
}
