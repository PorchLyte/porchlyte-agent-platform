/**
 * Brand kit vocabulary and validation — the structured half of the Brand
 * foundation. Shared by the portal API, the MCP tools, and the editor UI so
 * the same rules apply whichever door a change comes through.
 *
 * Mirrors the check constraints in supabase/migrations/*_brand_kit.sql —
 * change both together.
 */

export const BRAND_ASSET_KINDS = [
  "primary_logo",
  "secondary_logo",
  "submark",
  "headshot",
  "other",
] as const;
export type BrandAssetKind = (typeof BRAND_ASSET_KINDS)[number];

/** The named slots hold exactly one file each; "other" is an open shelf. */
export const SINGLE_SLOT_KINDS = BRAND_ASSET_KINDS.filter((k) => k !== "other");

export const ASSET_LABELS: Record<BrandAssetKind, string> = {
  primary_logo: "Primary logo",
  secondary_logo: "Secondary logo",
  submark: "Submark / icon",
  headshot: "Headshot",
  other: "Other assets",
};

export const ASSET_HINTS: Record<BrandAssetKind, string> = {
  primary_logo: "The one you'd put on a flyer. Transparent PNG if you have it.",
  secondary_logo: "The horizontal or stacked alternate, for tight spaces.",
  submark: "The icon-only mark for profile pictures and stamps.",
  headshot: "Used on guides, presentations, and anything with your name on it.",
  other: "Patterns, textures, badges, award logos, anything else on-brand.",
};

export const BRAND_COLOR_ROLES = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "text",
] as const;
export type BrandColorRole = (typeof BRAND_COLOR_ROLES)[number];

export const BRAND_FONT_ROLES = ["heading", "body", "accent"] as const;
export type BrandFontRole = (typeof BRAND_FONT_ROLES)[number];

export type BrandColor = { name: string; hex: string; role: BrandColorRole };
export type BrandFont = { role: BrandFontRole; name: string; notes: string };

export type BrandKit = {
  colors: BrandColor[];
  fonts: BrandFont[];
  notes: string;
};

/** Uploads: raster only, and small enough to keep a page snappy. */
export const ALLOWED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const MAX_COLORS = 12;
export const MAX_FONTS = 4;
export const MAX_NOTES_CHARS = 4000;
const MAX_NAME_CHARS = 60;

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isBrandAssetKind(value: string): value is BrandAssetKind {
  return (BRAND_ASSET_KINDS as readonly string[]).includes(value);
}

export function extensionFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** Human-readable size for the UI ("420 KB"). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export class BrandKitInputError extends Error {}

/**
 * Coerce whatever arrived (portal JSON, an MCP tool call, an older row shape)
 * into a valid kit. Unknown fields are dropped rather than stored, so the
 * shape stays predictable for the skills reading it.
 *
 * Strict on the way in, so a member gets told their hex code is wrong instead
 * of silently losing a color. Lenient on the way out (`lenient: true`), so one
 * malformed stored row can't take down the page that would let them fix it.
 */
export function parseBrandKit(
  input: unknown,
  { lenient = false }: { lenient?: boolean } = {}
): BrandKit {
  const raw = (input ?? {}) as Record<string, unknown>;

  const colorsIn = Array.isArray(raw.colors) ? raw.colors : [];
  if (colorsIn.length > MAX_COLORS && !lenient) {
    throw new BrandKitInputError(`A palette can hold up to ${MAX_COLORS} colors.`);
  }
  const colors: BrandColor[] = colorsIn
    .slice(0, MAX_COLORS)
    .map((entry, i) => {
      const c = (entry ?? {}) as Record<string, unknown>;
      const hex = typeof c.hex === "string" ? c.hex.trim() : "";
      if (!HEX.test(hex)) {
        if (lenient) return null;
        throw new BrandKitInputError(
          `Color ${i + 1} needs a six-digit hex code like #3B4A2F.`
        );
      }
      const role = typeof c.role === "string" ? c.role : "";
      return {
        name: text(c.name, MAX_NAME_CHARS) || hex.toUpperCase(),
        hex: hex.toUpperCase(),
        role: (BRAND_COLOR_ROLES as readonly string[]).includes(role)
          ? (role as BrandColorRole)
          : "accent",
      };
    })
    .filter((c): c is BrandColor => c !== null);

  const fontsIn = Array.isArray(raw.fonts) ? raw.fonts : [];
  if (fontsIn.length > MAX_FONTS && !lenient) {
    throw new BrandKitInputError(`Up to ${MAX_FONTS} fonts, so the type stays consistent.`);
  }
  const fonts: BrandFont[] = fontsIn
    .slice(0, MAX_FONTS)
    .map((entry) => {
      const f = (entry ?? {}) as Record<string, unknown>;
      const role = typeof f.role === "string" ? f.role : "";
      return {
        role: (BRAND_FONT_ROLES as readonly string[]).includes(role)
          ? (role as BrandFontRole)
          : "body",
        name: text(f.name, MAX_NAME_CHARS),
        notes: text(f.notes, 240),
      };
    })
    .filter((f) => f.name.length > 0);

  const notes = text(raw.notes, MAX_NOTES_CHARS);
  return { colors, fonts, notes };
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** True when there's enough here for Brooke to design from. */
export function isBrandKitUsable(kit: BrandKit): boolean {
  return kit.colors.length > 0 || kit.fonts.length > 0;
}
