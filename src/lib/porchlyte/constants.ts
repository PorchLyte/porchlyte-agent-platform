/**
 * Domain vocabulary shared by the MCP tools, the portal API, and (later) the
 * onboarding wizard. Mirrors the check constraints in the database schema —
 * change both together.
 */

export const FOUNDATION_KINDS = ["voice", "brand", "local"] as const;
export type FoundationKind = (typeof FOUNDATION_KINDS)[number];

export const TEAM_AGENTS = [
  "darla",
  "chloe",
  "ella",
  "poppy",
  "treena",
  "lia",
  "sloane",
  "rhonda",
  "olivia",
] as const;
export type TeamAgent = (typeof TEAM_AGENTS)[number];

export const SCHEDULED_AGENTS = ["darla", "rhonda"] as const;
export type ScheduledAgent = (typeof SCHEDULED_AGENTS)[number];

export type MemberPlan = "foundations" | "team" | "trifecta" | "full";
export type MemberStatus = "active" | "paused" | "canceled";
export type UpdatedBy = "portal_wizard" | "mcp_claude" | "admin";

/** Plans that unlock the nine team hires. */
export function planIncludesTeam(plan: string): boolean {
  return plan === "team" || plan === "full";
}

/** Plans that unlock the Trifecta workflows. */
export function planIncludesTrifecta(plan: string): boolean {
  return plan === "trifecta" || plan === "full";
}

export function isFoundationKind(value: string): value is FoundationKind {
  return (FOUNDATION_KINDS as readonly string[]).includes(value);
}

export function isTeamAgent(value: string): value is TeamAgent {
  return (TEAM_AGENTS as readonly string[]).includes(value);
}

export function isScheduledAgent(value: string): value is ScheduledAgent {
  return (SCHEDULED_AGENTS as readonly string[]).includes(value);
}
