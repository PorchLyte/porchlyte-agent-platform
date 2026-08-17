import { redirect } from "next/navigation";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import { getBrandKit } from "@/lib/porchlyte/operations";
import { BrandKitEditor } from "@/components/BrandKitEditor";

export default async function BrandKitPage() {
  const ctx = await getPortalContext();
  if (!ctx) redirect("/");

  const kit = await getBrandKit(ctx.db, ctx.memberId);

  return (
    <BrandKitEditor
      initialColors={kit.colors}
      initialFonts={kit.fonts}
      initialNotes={kit.notes}
      initialAssets={kit.assets}
    />
  );
}
