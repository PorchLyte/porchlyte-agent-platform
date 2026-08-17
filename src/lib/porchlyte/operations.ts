/**
 * The platform operations — the single implementation behind both doors:
 * the MCP tools (Claude connector) and the portal REST API call these same
 * functions, so a save from a chat interview and one from the web wizard are
 * indistinguishable downstream.
 *
 * All functions run on the service-role client with explicit member scoping.
 * Callers are responsible for authenticating the member first (portal session
 * or MCP OAuth token); RLS remains as defense-in-depth for direct client reads.
 *
 * Cross-cutting rules (from docs/implementation-plan.md):
 * - Every call logs a usage_event server-side. No dedicated logging tool.
 * - Plan gating lives here: team writes require a team/full plan.
 * - Membership status gates every call: canceled members are blocked entirely;
 *   paused members can read but not write.
 * - All writes are idempotent upserts.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/supabase/types";
import {
  type FoundationKind,
  type ScheduledAgent,
  type TeamAgent,
  type UpdatedBy,
  planIncludesTeam,
} from "./constants";
import {
  ALLOWED_IMAGE_MIME,
  type BrandAssetKind,
  BrandKitInputError,
  MAX_UPLOAD_BYTES,
  extensionFor,
  parseBrandKit,
} from "./brand-kit";

type Db = SupabaseClient<Database>;

/** Error whose message is safe to relay to the member (in chat or the portal). */
export class PlatformError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "membership_canceled"
      | "membership_paused"
      | "plan_required"
      | "member_not_found"
      | "invalid_input"
  ) {
    super(message);
    this.name = "PlatformError";
  }
}

async function getMember(db: Db, memberId: string): Promise<Tables<"members">> {
  const { data, error } = await db
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new PlatformError(
      "We couldn't find your PorchLyte membership. Please contact support.",
      "member_not_found"
    );
  }
  return data;
}

async function requireMember(
  db: Db,
  memberId: string,
  access: "read" | "write"
): Promise<Tables<"members">> {
  const member = await getMember(db, memberId);
  if (member.status === "canceled") {
    throw new PlatformError(
      "Your PorchLyte membership isn't active right now. Visit porchlyte.com to reactivate, and your AI team will be right where you left them.",
      "membership_canceled"
    );
  }
  if (member.status === "paused" && access === "write") {
    throw new PlatformError(
      "Your membership is paused, so your profiles are read-only right now. Visit porchlyte.com to resume.",
      "membership_paused"
    );
  }
  return member;
}

function logUsage(
  db: Db,
  memberId: string,
  event: string,
  agent?: string | null,
  metadata?: Json
) {
  // Fire-and-forget: analytics must never fail or slow down the member's call.
  void db
    .from("usage_events")
    .insert({ member_id: memberId, event, agent: agent ?? null, metadata: metadata ?? null })
    .then(({ error }) => {
      if (error) console.error("usage_events insert failed:", error.message);
    });
}

// ---------------------------------------------------------------------------
// Foundations
// ---------------------------------------------------------------------------

export async function getFoundations(db: Db, memberId: string) {
  await requireMember(db, memberId, "read");
  const { data, error } = await db
    .from("profiles")
    .select("kind, content, status, interview_answers, updated_at, updated_by")
    .eq("member_id", memberId);
  if (error) throw error;

  logUsage(db, memberId, "profile_read", null, { scope: "foundations" });

  const byKind = new Map(data.map((row) => [row.kind, row]));
  const empty = {
    content: null,
    status: "empty",
    interview_answers: null,
    updated_at: null,
    updated_by: null,
  };
  return {
    voice: byKind.get("voice") ?? empty,
    brand: byKind.get("brand") ?? empty,
    local: byKind.get("local") ?? empty,
  };
}

export async function saveFoundation(
  db: Db,
  memberId: string,
  input: {
    kind: FoundationKind;
    content: string;
    interview_answers?: Json;
    status?: "complete" | "partial";
  },
  updatedBy: UpdatedBy
) {
  await requireMember(db, memberId, "write");
  const { error } = await db.from("profiles").upsert(
    {
      member_id: memberId,
      kind: input.kind,
      content: input.content,
      status: input.status ?? "complete",
      ...(input.interview_answers !== undefined
        ? { interview_answers: input.interview_answers }
        : {}),
      updated_by: updatedBy,
    },
    { onConflict: "member_id,kind" }
  );
  if (error) throw error;

  logUsage(db, memberId, "profile_saved", null, { kind: input.kind, updated_by: updatedBy });
  return { ok: true as const, kind: input.kind, status: input.status ?? "complete" };
}

// ---------------------------------------------------------------------------
// Brand kit — colors, fonts, and uploaded logo files
// ---------------------------------------------------------------------------

const BRAND_BUCKET = "brand-assets";

/** Portal pages re-render often; Claude may hold a URL for a whole session. */
const SIGNED_URL_TTL = { portal: 60 * 60, connector: 60 * 60 * 24 * 7 } as const;

export type BrandAssetView = {
  id: string;
  kind: BrandAssetKind;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  updated_at: string;
  /** Signed download URL, or null if signing failed for this object. */
  url: string | null;
};

export async function getBrandKit(
  db: Db,
  memberId: string,
  audience: keyof typeof SIGNED_URL_TTL = "portal"
) {
  await requireMember(db, memberId, "read");

  const [kitRow, assetRows] = await Promise.all([
    db.from("brand_kits").select("colors, fonts, notes, updated_at").eq("member_id", memberId).maybeSingle(),
    db
      .from("brand_assets")
      .select("id, kind, file_name, mime_type, size_bytes, storage_path, updated_at")
      .eq("member_id", memberId)
      .order("kind"),
  ]);
  if (kitRow.error) throw kitRow.error;
  if (assetRows.error) throw assetRows.error;

  logUsage(db, memberId, "profile_read", null, { scope: "brand_kit" });

  const assets: BrandAssetView[] = await Promise.all(
    assetRows.data.map(async (row) => {
      const { data } = await db.storage
        .from(BRAND_BUCKET)
        .createSignedUrl(row.storage_path, SIGNED_URL_TTL[audience]);
      return {
        id: row.id,
        kind: row.kind as BrandAssetKind,
        file_name: row.file_name,
        mime_type: row.mime_type,
        size_bytes: row.size_bytes,
        updated_at: row.updated_at,
        url: data?.signedUrl ?? null,
      };
    })
  );

  const kit = parseBrandKit(kitRow.data ?? {}, { lenient: true });
  return { ...kit, updated_at: kitRow.data?.updated_at ?? null, assets };
}

/**
 * Cheap status for the hub tile and sidebar dot — no signed URLs, which cost
 * a storage round trip per asset.
 */
export async function getBrandKitStatus(
  db: Db,
  memberId: string
): Promise<"empty" | "partial" | "complete"> {
  const [kitRow, assetCount] = await Promise.all([
    db.from("brand_kits").select("colors, fonts").eq("member_id", memberId).maybeSingle(),
    db
      .from("brand_assets")
      .select("id", { count: "exact", head: true })
      .eq("member_id", memberId),
  ]);

  const kit = parseBrandKit(kitRow.data ?? {}, { lenient: true });
  const hasArt = (assetCount.count ?? 0) > 0;
  const hasColors = kit.colors.length > 0;
  const hasFonts = kit.fonts.length > 0;

  if (hasArt && hasColors && hasFonts) return "complete";
  if (hasArt || hasColors || hasFonts) return "partial";
  return "empty";
}

export async function saveBrandKit(
  db: Db,
  memberId: string,
  input: unknown,
  updatedBy: UpdatedBy
) {
  await requireMember(db, memberId, "write");
  let kit;
  try {
    kit = parseBrandKit(input);
  } catch (error) {
    if (error instanceof BrandKitInputError) {
      throw new PlatformError(error.message, "invalid_input");
    }
    throw error;
  }

  const { error } = await db.from("brand_kits").upsert(
    {
      member_id: memberId,
      colors: kit.colors as unknown as Json,
      fonts: kit.fonts as unknown as Json,
      notes: kit.notes || null,
      updated_by: updatedBy,
    },
    { onConflict: "member_id" }
  );
  if (error) throw error;

  logUsage(db, memberId, "brand_kit_saved", null, {
    colors: kit.colors.length,
    fonts: kit.fonts.length,
    updated_by: updatedBy,
  });
  return { ok: true as const, ...kit };
}

/**
 * Upload one file and record it. The named slots hold a single file, so
 * replacing one deletes the object it displaced — otherwise the bucket would
 * fill with logos nobody can reach.
 */
export async function addBrandAsset(
  db: Db,
  memberId: string,
  input: {
    kind: BrandAssetKind;
    fileName: string;
    mimeType: string;
    bytes: ArrayBuffer;
  }
) {
  await requireMember(db, memberId, "write");

  const size = input.bytes.byteLength;
  if (size === 0) throw new PlatformError("That file is empty.", "invalid_input");
  if (size > MAX_UPLOAD_BYTES) {
    throw new PlatformError(
      `Images need to be under ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB. Try exporting it smaller.`,
      "invalid_input"
    );
  }
  if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(input.mimeType)) {
    throw new PlatformError(
      "Logos need to be a PNG, JPG, or WEBP. If yours is an SVG or PDF, export a PNG at around 2000px wide.",
      "invalid_input"
    );
  }

  const replacing =
    input.kind === "other"
      ? null
      : (
          await db
            .from("brand_assets")
            .select("id, storage_path")
            .eq("member_id", memberId)
            .eq("kind", input.kind)
            .maybeSingle()
        ).data;

  // Timestamped path: a replaced logo gets a new URL instead of serving a
  // stale cached copy of the old one.
  const path = `${memberId}/${input.kind}-${Date.now()}.${extensionFor(input.mimeType)}`;
  const { error: uploadError } = await db.storage
    .from(BRAND_BUCKET)
    .upload(path, input.bytes, { contentType: input.mimeType, upsert: false });
  if (uploadError) throw uploadError;

  const row = {
    member_id: memberId,
    kind: input.kind,
    storage_path: path,
    file_name: input.fileName.slice(0, 120),
    mime_type: input.mimeType,
    size_bytes: size,
  };

  const { data: saved, error: rowError } = replacing
    ? await db.from("brand_assets").update(row).eq("id", replacing.id).select("id").maybeSingle()
    : await db.from("brand_assets").insert(row).select("id").maybeSingle();

  if (rowError) {
    // Don't leave an orphan object behind if the row didn't land.
    await db.storage.from(BRAND_BUCKET).remove([path]);
    throw rowError;
  }
  if (replacing) await db.storage.from(BRAND_BUCKET).remove([replacing.storage_path]);

  logUsage(db, memberId, "brand_asset_uploaded", null, { kind: input.kind, size_bytes: size });
  return { ok: true as const, id: saved?.id ?? null, kind: input.kind };
}

export async function deleteBrandAsset(db: Db, memberId: string, assetId: string) {
  await requireMember(db, memberId, "write");

  const { data, error } = await db
    .from("brand_assets")
    .select("id, kind, storage_path")
    .eq("member_id", memberId)
    .eq("id", assetId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new PlatformError("That asset is already gone.", "member_not_found");

  const { error: deleteError } = await db.from("brand_assets").delete().eq("id", data.id);
  if (deleteError) throw deleteError;
  await db.storage.from(BRAND_BUCKET).remove([data.storage_path]);

  logUsage(db, memberId, "brand_asset_deleted", null, { kind: data.kind });
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export async function getTeamMember(db: Db, memberId: string, agent: TeamAgent) {
  await requireMember(db, memberId, "read");
  const { data, error } = await db
    .from("team_profiles")
    .select("agent, content, status, updated_at, updated_by")
    .eq("member_id", memberId)
    .eq("agent", agent)
    .maybeSingle();
  if (error) throw error;

  logUsage(db, memberId, "profile_read", agent);

  return (
    data ?? {
      agent,
      content: null,
      status: "not_hired" as const,
      updated_at: null,
      updated_by: null,
    }
  );
}

export async function saveTeamMember(
  db: Db,
  memberId: string,
  input: {
    agent: TeamAgent;
    content: string;
    interview_answers?: Json;
    status?: "hired" | "partial";
  },
  updatedBy: UpdatedBy
) {
  const member = await requireMember(db, memberId, "write");
  if (!planIncludesTeam(member.plan)) {
    throw new PlatformError(
      "Team hires aren't included in your current PorchLyte plan. Visit porchlyte.com to upgrade and unlock your full AI team.",
      "plan_required"
    );
  }
  const { error } = await db.from("team_profiles").upsert(
    {
      member_id: memberId,
      agent: input.agent,
      content: input.content,
      status: input.status ?? "hired",
      ...(input.interview_answers !== undefined
        ? { interview_answers: input.interview_answers }
        : {}),
      updated_by: updatedBy,
    },
    { onConflict: "member_id,agent" }
  );
  if (error) throw error;

  logUsage(db, memberId, "profile_saved", input.agent, { updated_by: updatedBy });
  return { ok: true as const, agent: input.agent, status: input.status ?? "hired" };
}

// ---------------------------------------------------------------------------
// Setup status + partial saves
// ---------------------------------------------------------------------------

export async function getSetupStatus(db: Db, memberId: string) {
  const member = await requireMember(db, memberId, "read");
  const [profiles, teamProfiles] = await Promise.all([
    db.from("profiles").select("kind, status, updated_at").eq("member_id", memberId),
    db.from("team_profiles").select("agent, status, updated_at").eq("member_id", memberId),
  ]);
  if (profiles.error) throw profiles.error;
  if (teamProfiles.error) throw teamProfiles.error;

  logUsage(db, memberId, "session_start");

  return {
    member: { name: member.name, plan: member.plan, status: member.status },
    foundations: profiles.data,
    team: teamProfiles.data,
  };
}

/**
 * Mid-interview save so a member can stop and resume later, in chat or on the
 * portal. Stores raw answers plus a pointer to the next question inside
 * interview_answers; leaves any previously saved prose content untouched.
 */
export async function savePartial(
  db: Db,
  memberId: string,
  input:
    | { kind: FoundationKind; answers: Json; next_question?: string }
    | { agent: TeamAgent; answers: Json; next_question?: string },
  updatedBy: UpdatedBy
) {
  await requireMember(db, memberId, "write");
  const answers: Json = {
    answers: input.answers,
    next_question: input.next_question ?? null,
  };

  if ("kind" in input) {
    const { error } = await db.from("profiles").upsert(
      {
        member_id: memberId,
        kind: input.kind,
        status: "partial",
        interview_answers: answers,
        updated_by: updatedBy,
      },
      { onConflict: "member_id,kind" }
    );
    if (error) throw error;
    logUsage(db, memberId, "profile_saved", null, { kind: input.kind, partial: true });
    return { ok: true as const, kind: input.kind, status: "partial" as const };
  }

  const { error } = await db.from("team_profiles").upsert(
    {
      member_id: memberId,
      agent: input.agent,
      status: "partial",
      interview_answers: answers,
      updated_by: updatedBy,
    },
    { onConflict: "member_id,agent" }
  );
  if (error) throw error;
  logUsage(db, memberId, "profile_saved", input.agent, { partial: true });
  return { ok: true as const, agent: input.agent, status: "partial" as const };
}

// ---------------------------------------------------------------------------
// Scheduled tasks (Darla's brief, Rhonda's scan)
// ---------------------------------------------------------------------------

/**
 * Members can have several named scheduled tasks per agent in Cowork (a
 * recurring morning brief, a one-off test run, etc.) — each is its own row,
 * keyed by (member, agent, task_name). task_name is whatever the member
 * named the task in Cowork; skills pass it back on every call so state and
 * run history stay scoped to that specific task, not the agent as a whole.
 */
export async function getTaskState(
  db: Db,
  memberId: string,
  agent: ScheduledAgent,
  taskName: string
) {
  await requireMember(db, memberId, "read");
  const { data, error } = await db
    .from("scheduled_tasks")
    .select("agent, task_name, state, schedule_label, last_run_at, last_run_summary")
    .eq("member_id", memberId)
    .eq("agent", agent)
    .eq("task_name", taskName)
    .maybeSingle();
  if (error) throw error;

  // No row yet = an unregistered task; scheduled skills treat this as active
  // rather than blocking a run over a bookkeeping gap.
  return (
    data ?? {
      agent,
      task_name: taskName,
      state: "active" as const,
      schedule_label: null,
      last_run_at: null,
      last_run_summary: null,
    }
  );
}

export async function logTaskRun(
  db: Db,
  memberId: string,
  agent: ScheduledAgent,
  taskName: string,
  summary: string
) {
  await requireMember(db, memberId, "write");
  const { error } = await db.from("scheduled_tasks").upsert(
    {
      member_id: memberId,
      agent,
      task_name: taskName,
      last_run_at: new Date().toISOString(),
      last_run_summary: summary,
    },
    { onConflict: "member_id,agent,task_name" }
  );
  if (error) throw error;

  logUsage(db, memberId, "task_run", agent, { summary, task_name: taskName });
  return { ok: true as const };
}

/**
 * Called once, right after the member sets up a new scheduled task in
 * Cowork. Idempotent: registering the same task_name again just returns its
 * current state rather than resetting it, so a skill can call this
 * defensively without risking un-pausing something the member turned off.
 */
export async function registerScheduledTask(
  db: Db,
  memberId: string,
  agent: ScheduledAgent,
  input: { task_name: string; schedule_label?: string }
) {
  await requireMember(db, memberId, "write");
  const { data: existing, error: findError } = await db
    .from("scheduled_tasks")
    .select("task_name, state, schedule_label")
    .eq("member_id", memberId)
    .eq("agent", agent)
    .eq("task_name", input.task_name)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) {
    return { ok: true as const, already_registered: true as const, ...existing };
  }

  const { error } = await db.from("scheduled_tasks").insert({
    member_id: memberId,
    agent,
    task_name: input.task_name,
    state: "active",
    ...(input.schedule_label ? { schedule_label: input.schedule_label } : {}),
  });
  if (error) throw error;

  logUsage(db, memberId, "task_registered", agent, { task_name: input.task_name });
  return {
    ok: true as const,
    already_registered: false as const,
    task_name: input.task_name,
    state: "active" as const,
    schedule_label: input.schedule_label ?? null,
  };
}

/** All named scheduled tasks for one agent — powers the hub's task list. */
export async function getScheduledTasks(db: Db, memberId: string, agent: ScheduledAgent) {
  await requireMember(db, memberId, "read");
  const { data, error } = await db
    .from("scheduled_tasks")
    .select("task_name, state, schedule_label, last_run_at, last_run_summary")
    .eq("member_id", memberId)
    .eq("agent", agent)
    .order("task_name");
  if (error) throw error;
  return data;
}

/** Hub panel toggle: pause/resume one named scheduled task, update its label. */
export async function setTaskState(
  db: Db,
  memberId: string,
  agent: ScheduledAgent,
  taskName: string,
  input: { state?: "active" | "paused"; schedule_label?: string }
) {
  await requireMember(db, memberId, "write");
  const { error, count } = await db
    .from("scheduled_tasks")
    .update(
      {
        ...(input.state ? { state: input.state } : {}),
        ...(input.schedule_label !== undefined
          ? { schedule_label: input.schedule_label }
          : {}),
      },
      { count: "exact" }
    )
    .eq("member_id", memberId)
    .eq("agent", agent)
    .eq("task_name", taskName);
  if (error) throw error;
  if (!count) {
    throw new PlatformError(`No scheduled task named "${taskName}" for ${agent}.`, "member_not_found");
  }
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Connector diagnostics
// ---------------------------------------------------------------------------

/**
 * Called by the MCP layer on every successful tool call. First call for a
 * member also stamps connector_linked_at; later calls leave it untouched.
 */
export async function touchConnectorSync(
  db: Db,
  memberId: string,
  pluginVersion?: string
) {
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("connector_status")
    .update({
      last_successful_sync_at: now,
      ...(pluginVersion ? { plugin_installed_version: pluginVersion } : {}),
    })
    .eq("member_id", memberId)
    .select("member_id");
  if (error) {
    console.error("connector_status update failed:", error.message);
    return;
  }
  if (data.length === 0) {
    const { error: insertError } = await db.from("connector_status").insert({
      member_id: memberId,
      connector_linked_at: now,
      last_successful_sync_at: now,
      ...(pluginVersion ? { plugin_installed_version: pluginVersion } : {}),
    });
    if (insertError)
      console.error("connector_status insert failed:", insertError.message);
  }
}
