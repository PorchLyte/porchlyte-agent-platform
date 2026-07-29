import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { getTaskState, setTaskState } from "@/lib/porchlyte/operations";
import { isScheduledAgent } from "@/lib/porchlyte/constants";

/** Hub schedule panel: pause/resume + relabel one specific named task. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ agent: string; taskName: string }> }
) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  const { agent, taskName } = await params;
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
    if (body.state === undefined && body.schedule_label === undefined) {
      return Response.json(
        { error: "Provide state and/or schedule_label" },
        { status: 400 }
      );
    }
    await setTaskState(ctx.db, ctx.memberId, agent, taskName, {
      state: body.state,
      schedule_label: body.schedule_label,
    });
    return Response.json(await getTaskState(ctx.db, ctx.memberId, agent, taskName));
  } catch (error) {
    return errorResponse(error);
  }
}
