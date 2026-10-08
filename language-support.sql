-- OPRAVA JAZYKU A PRIHLASENI PRES KOD
-- Spustte cely blok v Supabase -> SQL Editor.

alter table public.invitations
add column if not exists language text not null default 'cs';

update public.invitations
set language='cs'
where language is null or language not in ('cs','en');

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
language sql
stable
security definer
set search_path = public
as $$
  select
    i.salutation,
    i.subject,
    i.rsvp_status,
    i.note,
    i.admin_reply,
    i.active,
    i.language
  from public.invitations i
  where i.code = p_code
    and i.active = true
    and p_code ~ '^[0-9]{4}$'
  limit 1;
$$;

grant execute on function public.get_invitation(text) to anon, authenticated;

drop function if exists public.submit_rsvp(text, text, text);

create function public.submit_rsvp(
  p_code text,
  p_status text,
  p_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_code is null
     or p_code !~ '^[0-9]{4}$'
     or p_status not in ('Přijdu', 'Nepřijdu') then
    return false;
  end if;

  update public.invitations
  set
    rsvp_status = p_status,
    note = nullif(left(trim(coalesce(p_note, '')), 1000), ''),
    responded_at = now(),
    admin_reply = null,
    admin_replied_at = null
  where code = p_code
    and active = true;

  return found;
end;
$$;

grant execute on function public.submit_rsvp(text,text,text) to anon, authenticated;

notify pgrst, 'reload schema';
