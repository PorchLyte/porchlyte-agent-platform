"use client";

import { useRef, useState } from "react";
import {
  ASSET_HINTS,
  ASSET_LABELS,
  BRAND_COLOR_ROLES,
  BRAND_FONT_ROLES,
  type BrandAssetKind,
  type BrandColor,
  type BrandFont,
  MAX_COLORS,
  MAX_FONTS,
  SINGLE_SLOT_KINDS,
  formatBytes,
} from "@/lib/porchlyte/brand-kit";

export type BrandAssetView = {
  id: string;
  kind: BrandAssetKind;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  updated_at: string;
  url: string | null;
};

type Props = {
  initialColors: BrandColor[];
  initialFonts: BrandFont[];
  initialNotes: string;
  initialAssets: BrandAssetView[];
};

const HEX = /^#[0-9a-fA-F]{6}$/;

const STARTER_COLORS: BrandColor[] = [
  { name: "Primary", hex: "#282722", role: "primary" },
  { name: "Secondary", hex: "#CBAF97", role: "secondary" },
];

export function BrandKitEditor(props: Props) {
  const [colors, setColors] = useState<BrandColor[]>(props.initialColors);
  const [fonts, setFonts] = useState<BrandFont[]>(props.initialFonts);
  const [notes, setNotes] = useState(props.initialNotes);
  const [assets, setAssets] = useState<BrandAssetView[]>(props.initialAssets);

  const [onDark, setOnDark] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty =
    JSON.stringify({ colors, fonts, notes }) !==
    JSON.stringify({
      colors: props.initialColors,
      fonts: props.initialFonts,
      notes: props.initialNotes,
    });

  function touch() {
    setSaved(false);
    setError(null);
  }

  async function refreshAssets() {
    const res = await fetch("/api/portal/brand-kit");
    if (res.ok) {
      const data = await res.json();
      setAssets(data.assets ?? []);
    }
  }

  async function upload(kind: BrandAssetKind, file: File) {
    setBusy(`upload:${kind}`);
    setError(null);
    try {
      const form = new FormData();
      form.append("kind", kind);
      form.append("file", file);
      const res = await fetch("/api/portal/brand-kit/assets", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That upload didn't go through.");
      await refreshAssets();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  async function removeAsset(id: string) {
    setBusy(`delete:${id}`);
    setError(null);
    try {
      const res = await fetch(`/api/portal/brand-kit/assets?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Couldn't remove that.");
      await refreshAssets();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    const bad = colors.findIndex((c) => !HEX.test(c.hex));
    if (bad >= 0) {
      setError(`Color ${bad + 1} needs a six-digit hex code like #3B4A2F.`);
      return;
    }
    setBusy("save");
    setError(null);
    try {
      const res = await fetch("/api/portal/brand-kit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors, fonts, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save your brand kit.");
      setColors(data.colors);
      setFonts(data.fonts);
      setNotes(data.notes);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const otherAssets = assets.filter((a) => a.kind === "other");

  return (
    <>
      <div className="pl-page-head">
        <div className="pl-q-count">Brand foundation</div>
        <h1 className="pl-page-title">Brand kit</h1>
        <p className="pl-page-sub">
          Your Brand profile says how things should feel. This is the part your
          agents build with: the real logo files, the exact colors, and the
          fonts. Brooke reads it before she designs anything.
        </p>
      </div>

      {/* ---------- Logos and assets ---------- */}
      <div className="pl-section-label">Logos &amp; assets</div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="pl-bk-mini" onClick={() => setOnDark((v) => !v)}>
          {onDark ? "Preview on light" : "Preview on dark"}
        </button>
      </div>
      <div className="pl-bk-slots">
        {SINGLE_SLOT_KINDS.map((kind) => (
          <AssetSlot
            key={kind}
            kind={kind}
            asset={assets.find((a) => a.kind === kind) ?? null}
            onDark={onDark}
            busy={busy}
            onUpload={upload}
            onRemove={removeAsset}
          />
        ))}
      </div>

      <div className="pl-card" style={{ marginTop: 18 }}>
        <div className="pl-card-title">{ASSET_LABELS.other}</div>
        <p className="pl-card-body" style={{ fontSize: 13.5 }}>
          {ASSET_HINTS.other}
        </p>
        {otherAssets.length > 0 && (
          <div className="pl-bk-slots" style={{ marginTop: 14 }}>
            {otherAssets.map((asset) => (
              <div key={asset.id} className="pl-bk-slot">
                <div className={`pl-bk-preview${onDark ? " on-dark" : ""}`}>
                  {asset.url ? (
                    // Signed, short-lived Supabase URLs — next/image would need
                    // a static remote pattern and would cache a URL that expires.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.url} alt={asset.file_name} />
                  ) : (
                    <span className="pl-bk-empty">Preview unavailable</span>
                  )}
                </div>
                <div className="pl-bk-slot-meta">
                  {asset.file_name} · {formatBytes(asset.size_bytes)}
                </div>
                <div className="pl-bk-slot-actions">
                  <button
                    className="pl-bk-mini danger"
                    onClick={() => removeAsset(asset.id)}
                    disabled={busy === `delete:${asset.id}`}
                  >
                    {busy === `delete:${asset.id}` ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <UploadButton
            kind="other"
            label="Add an asset"
            busy={busy === "upload:other"}
            onUpload={upload}
          />
        </div>
      </div>

      {/* ---------- Colors ---------- */}
      <div className="pl-section-label">Color palette</div>
      <div className="pl-card">
        <div className="pl-bk-head">
          <span />
          <span>Name</span>
          <span>Hex</span>
          <span>Role</span>
          <span />
        </div>
        {colors.map((color, i) => (
          <div className="pl-bk-row" key={i}>
            <input
              type="color"
              className="pl-bk-swatch"
              aria-label={`${color.name || "Color"} swatch`}
              value={HEX.test(color.hex) ? color.hex : "#000000"}
              onChange={(e) => {
                touch();
                setColors(patch(colors, i, { hex: e.target.value.toUpperCase() }));
              }}
            />
            <input
              className="pl-input"
              placeholder="Deep Olive"
              value={color.name}
              onChange={(e) => {
                touch();
                setColors(patch(colors, i, { name: e.target.value }));
              }}
            />
            <input
              className="pl-input"
              placeholder="#3B4A2F"
              value={color.hex}
              onChange={(e) => {
                touch();
                setColors(patch(colors, i, { hex: e.target.value }));
              }}
              onBlur={(e) => {
                const v = e.target.value.trim();
                const withHash = v.startsWith("#") ? v : `#${v}`;
                if (HEX.test(withHash)) {
                  setColors(patch(colors, i, { hex: withHash.toUpperCase() }));
                }
              }}
            />
            <select
              className="pl-input"
              value={color.role}
              onChange={(e) => {
                touch();
                setColors(patch(colors, i, { role: e.target.value as BrandColor["role"] }));
              }}
            >
              {BRAND_COLOR_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              className="pl-bk-remove"
              aria-label="Remove color"
              onClick={() => {
                touch();
                setColors(colors.filter((_, j) => j !== i));
              }}
            >
              ×
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            className="pl-bk-mini"
            disabled={colors.length >= MAX_COLORS}
            onClick={() => {
              touch();
              setColors([...colors, { name: "", hex: "#CBAF97", role: "accent" }]);
            }}
          >
            Add a color
          </button>
          {colors.length === 0 && (
            <button
              className="pl-bk-mini"
              onClick={() => {
                touch();
                setColors(STARTER_COLORS);
              }}
            >
              Start me off
            </button>
          )}
        </div>
      </div>

      {/* ---------- Fonts ---------- */}
      <div className="pl-section-label">Fonts</div>
      <div className="pl-card">
        <div className="pl-bk-head fonts">
          <span>Role</span>
          <span>Font</span>
          <span>Notes</span>
          <span />
        </div>
        {fonts.map((font, i) => (
          <div className="pl-bk-font-row" key={i}>
            <select
              className="pl-input"
              value={font.role}
              onChange={(e) => {
                touch();
                setFonts(patch(fonts, i, { role: e.target.value as BrandFont["role"] }));
              }}
            >
              {BRAND_FONT_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <input
              className="pl-input"
              placeholder="Canela"
              value={font.name}
              onChange={(e) => {
                touch();
                setFonts(patch(fonts, i, { name: e.target.value }));
              }}
            />
            <input
              className="pl-input"
              placeholder="All caps, wide tracking"
              value={font.notes}
              onChange={(e) => {
                touch();
                setFonts(patch(fonts, i, { notes: e.target.value }));
              }}
            />
            <button
              className="pl-bk-remove"
              aria-label="Remove font"
              onClick={() => {
                touch();
                setFonts(fonts.filter((_, j) => j !== i));
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          className="pl-bk-mini"
          style={{ marginTop: 14 }}
          disabled={fonts.length >= MAX_FONTS}
          onClick={() => {
            touch();
            setFonts([...fonts, { role: "body", name: "", notes: "" }]);
          }}
        >
          Add a font
        </button>
      </div>

      {/* ---------- Notes ---------- */}
      <div className="pl-section-label">Usage notes</div>
      <div className="pl-card">
        <p className="pl-card-body" style={{ fontSize: 13.5, marginBottom: 10 }}>
          Logo rules, photography direction, anything a designer should know
          before they start. Plain sentences are fine.
        </p>
        <textarea
          className="pl-textarea"
          style={{ minHeight: 150 }}
          placeholder="Never put the logo on a busy photo. Photography is warm and natural light, no heavy filters. Leave a full logo-width of space around the mark."
          value={notes}
          onChange={(e) => {
            touch();
            setNotes(e.target.value);
          }}
        />
      </div>

      {/* ---------- Style guide preview ---------- */}
      {(colors.length > 0 || fonts.length > 0) && (
        <>
          <div className="pl-section-label">Your style guide</div>
          <div className="pl-card">
            {colors.length > 0 && (
              <div className="pl-bk-strip">
                {colors.map((color, i) => (
                  <div className="pl-bk-chip" key={i}>
                    <div
                      className="pl-bk-chip-fill"
                      style={{ background: HEX.test(color.hex) ? color.hex : "transparent" }}
                    />
                    <div className="pl-bk-chip-meta">
                      <div className="pl-bk-chip-name">{color.name || "Untitled"}</div>
                      <div className="pl-bk-chip-hex">
                        {color.hex} · {color.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {fonts
              .filter((f) => f.name.trim())
              .map((font, i) => (
                <div className="pl-bk-type-sample" key={i}>
                  <div className="pl-bk-type-role">{font.role}</div>
                  <div className="pl-bk-type-name">{font.name}</div>
                  {font.notes && <div className="pl-bk-type-notes">{font.notes}</div>}
                </div>
              ))}
          </div>
        </>
      )}

      {error && <p className="pl-error">{error}</p>}

      <div className="pl-bk-savebar">
        {saved && !dirty && <span className="pl-bk-saved">Saved.</span>}
        <button
          className="pl-btn pl-btn-primary"
          onClick={save}
          disabled={busy === "save" || !dirty}
        >
          {busy === "save" ? "Saving…" : "Save brand kit"}
        </button>
      </div>
    </>
  );
}

function AssetSlot({
  kind,
  asset,
  onDark,
  busy,
  onUpload,
  onRemove,
}: {
  kind: BrandAssetKind;
  asset: BrandAssetView | null;
  onDark: boolean;
  busy: string | null;
  onUpload: (kind: BrandAssetKind, file: File) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="pl-bk-slot">
      <div>
        <div className="pl-bk-slot-name">{ASSET_LABELS[kind]}</div>
        <div className="pl-bk-slot-hint">{ASSET_HINTS[kind]}</div>
      </div>
      <div className={`pl-bk-preview${onDark ? " on-dark" : ""}`}>
        {asset?.url ? (
          // Signed, short-lived Supabase URLs — see note above.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={ASSET_LABELS[kind]} />
        ) : (
          <span className="pl-bk-empty">
            {asset ? "Preview unavailable" : "Nothing here yet"}
          </span>
        )}
      </div>
      {asset && (
        <div className="pl-bk-slot-meta">
          {asset.file_name} · {formatBytes(asset.size_bytes)}
        </div>
      )}
      <div className="pl-bk-slot-actions">
        <UploadButton
          kind={kind}
          label={asset ? "Replace" : "Upload"}
          busy={busy === `upload:${kind}`}
          onUpload={onUpload}
        />
        {asset && (
          <button
            className="pl-bk-mini danger"
            onClick={() => onRemove(asset.id)}
            disabled={busy === `delete:${asset.id}`}
          >
            {busy === `delete:${asset.id}` ? "Removing…" : "Remove"}
          </button>
        )}
      </div>
    </div>
  );
}

function UploadButton({
  kind,
  label,
  busy,
  onUpload,
}: {
  kind: BrandAssetKind;
  label: string;
  busy: boolean;
  onUpload: (kind: BrandAssetKind, file: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button className="pl-bk-mini" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? "Uploading…" : label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Clear the input so re-picking the same file fires change again.
          e.target.value = "";
          if (file) onUpload(kind, file);
        }}
      />
    </>
  );
}

function patch<T>(list: T[], index: number, changes: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...changes } : item));
}
