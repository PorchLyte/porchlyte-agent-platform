import { getPortalContext, unauthorized } from "@/lib/porchlyte/portal-auth";

/**
 * Export-all-data: a full JSON copy of everything the member owns — their
 * membership record, the three Foundations (prose + raw interview answers),
 * every team hire, and their schedule state. The trust story: your data is
 * yours, downloadable any time.
 */
export async function GET() {
  const ctx = await getPortalContext();
  if (!ctx) return unauthorized();

  const [member, profiles, team, tasks] = await Promise.all([
    ctx.db.from("members").select("email, name, plan, status, created_at").eq("id", ctx.memberId).maybeSingle(),
    ctx.db.from("profiles").select("kind, content, status, interview_answers, updated_at, updated_by").eq("member_id", ctx.memberId),
    ctx.db.from("team_profiles").select("agent, content, status, interview_answers, updated_at, updated_by").eq("member_id", ctx.memberId),
    ctx.db.from("scheduled_tasks").select("agent, state, schedule_label, last_run_at, last_run_summary").eq("member_id", ctx.memberId),
  ]);

  const bundle = {
    exported_at: new Date().toISOString(),
    member: member.data,
    foundations: profiles.data ?? [],
    team: team.data ?? [],
    scheduled_tasks: tasks.data ?? [],
  };

  return new Response(JSON.stringify(bundle, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="porchlyte-export.json"',
    },
  });
}
