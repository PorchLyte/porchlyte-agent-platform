-- Scheduled tasks were one row per (member, agent) — a single shared on/off
-- switch for "Darla" as a whole. Members can have multiple named scheduled
-- tasks per agent in Cowork (a morning brief, a one-off test task, etc.), so
-- move to one row per named task.

alter table public.scheduled_tasks
  add column task_name text not null default 'Default';

alter table public.scheduled_tasks
  drop constraint scheduled_tasks_member_id_agent_key;

alter table public.scheduled_tasks
  add constraint scheduled_tasks_member_agent_task_key
  unique (member_id, agent, task_name);
