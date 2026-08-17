import {
  errorResponse,
  getPortalContext,
  unauthorized,
} from "@/lib/porchlyte/portal-auth";
import { addBrandAsset, deleteBrandAsset } from "@/lib/porchlyte/operations";
import { MAX_UPLOAD_BYTES, isBrandAssetKind } from "@/lib/porchlyte/brand-kit";

/** Upload one logo/headshot. multipart/form-data: { kind, file }. */
export async function POST(request: Request) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  try {
    const form = await request.formData();
    const kind = form.get("kind");
    const file = form.get("file");

    if (typeof kind !== "string" || !isBrandAssetKind(kind)) {
      return Response.json({ error: "Unknown asset slot." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return Response.json({ error: "No file was attached." }, { status: 400 });
    }
    // Cheap rejection before buffering; addBrandAsset re-checks the real size.
    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json(
        { error: `Images need to be under ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    const result = await addBrandAsset(ctx.db, ctx.memberId, {
      kind,
      fileName: file.name || "upload",
      mimeType: file.type,
      bytes: await file.arrayBuffer(),
    });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Which asset?" }, { status: 400 });
    }
    return Response.json(await deleteBrandAsset(ctx.db, ctx.memberId, id));
  } catch (error) {
    return errorResponse(error);
  }
}
