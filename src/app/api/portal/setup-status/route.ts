import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { getSetupStatus } from "@/lib/porchlyte/operations";

export async function GET() {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  try {
    return Response.json(await getSetupStatus(ctx.db, ctx.memberId));
  } catch (error) {
    return errorResponse(error);
  }
}
