-- Evervale: run once in Supabase SQL Editor. Safe to rerun.
begin;
create table if not exists public.evervale_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.evervale_saves enable row level security;
revoke all on public.evervale_saves from anon;
grant select, insert, update on public.evervale_saves to authenticated;
drop policy if exists own_save_read on public.evervale_saves;
create policy own_save_read on public.evervale_saves for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists own_save_insert on public.evervale_saves;
create policy own_save_insert on public.evervale_saves for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists own_save_update on public.evervale_saves;
create policy own_save_update on public.evervale_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace function public.evervale_save_stamp() returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then new.revision := 1;
  else new.revision := old.revision + 1; end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists evervale_save_stamp on public.evervale_saves;
create trigger evervale_save_stamp before insert or update on public.evervale_saves for each row execute function public.evervale_save_stamp();
commit;
