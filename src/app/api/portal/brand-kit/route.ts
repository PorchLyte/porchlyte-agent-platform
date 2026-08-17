import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { getBrandKit, saveBrandKit } from "@/lib/porchlyte/operations";

export async function GET() {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  try {
    return Response.json(await getBrandKit(ctx.db, ctx.memberId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  try {
    const body = await request.json();
    const result = await saveBrandKit(ctx.db, ctx.memberId, body, "portal_wizard");
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
