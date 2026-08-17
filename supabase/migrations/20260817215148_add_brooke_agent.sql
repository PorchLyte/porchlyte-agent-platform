-- Brooke, the brand designer, joins the team as the tenth hire. The agent
-- vocabulary lives in three places that must move together: this constraint,
-- TEAM_AGENTS in src/lib/porchlyte/constants.ts, and the plugin skill folder.
--
-- The new list is a superset of the old one, so every existing row already
-- satisfies it and the revalidation is a scan of a small table.

alter table public.team_profiles
  drop constraint if exists team_profiles_agent_check;

alter table public.team_profiles
  add constraint team_profiles_agent_check check (agent in
    ('darla', 'chloe', 'ella', 'poppy', 'treena',
     'lia', 'sloane', 'rhonda', 'olivia', 'brooke'));
