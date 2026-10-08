-- LANGUAGE SUPPORT — STUŽKOVACÍ VEČÍREK 8.A
-- Spusť jednou v Supabase -> SQL Editor.
-- Přidá jazyk pozvánky ke každému učiteli a zachová server-side rate limiting.

alter table public.invitations
add column if not exists language text not null default 'cs';

update public.invitations
set language='cs'
where language is null or language not in ('cs','en');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='invitations_language_check'
      and conrelid='public.invitations'::regclass
  ) then
    alter table public.invitations
    add constraint invitations_language_check check (language in ('cs','en'));
  end if;
end $$;

drop function if exists public.get_invitation(text);

create function public.get_invitation(p_code text)
returns table (
  salutation text,
  subject text,
  rsvp_status text,
  note text,
  admin_reply text,
  active boolean,
  language text
)
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.enforce_rate_limit('invitation_lookup', 30, interval '10 minutes');
  if p_code is null or p_code !~ '^[0-9]{4}$' then return; end if;
  return query
  select i.salutation,i.subject,i.rsvp_status,i.note,i.admin_reply,i.active,i.language
  from public.invitations i
  where i.code=p_code and i.active=true
  limit 1;
end;
$$;

revoke all on function public.get_invitation(text) from public;
grant execute on function public.get_invitation(text) to anon, authenticated;
