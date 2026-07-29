-- Trigger/event-trigger functions must not be callable through the REST RPC
-- surface (flagged by the Supabase security advisor).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
