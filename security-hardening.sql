-- SECURITY HARDENING — STUŽKOVACÍ VEČÍREK 8.A
-- Tento soubor spusť jednou v Supabase -> SQL Editor.
-- Přidá server-side rate limiting pro ověřování 4místných kódů a RSVP
-- a explicitně odebere anonymní přístup k tabulkám.
--
-- Rate-limit evidence (IP + čas) se drží jen krátce a automaticky se maže.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.request_limits (
  id bigint generated always as identity primary key,
  client_ip inet not null,
  action text not null,
  requested_at timestamptz not null default now()
);

create index if not exists request_limits_ip_action_time_idx
on private.request_limits (client_ip, action, requested_at desc);

-- Tabulka je soukromá a RLS je zapnuté také kvůli bezpečnostní kontrole Supabase.
-- Helper funkce běží jako SECURITY DEFINER, takže ji mohou bezpečně používat.
alter table private.request_limits enable row level security;

revoke all on table private.request_limits from public, anon, authenticated;

create or replace function private.client_ip()
returns inet
language plpgsql
stable
security definer
set search_path = private, public
as $$
declare
  headers jsonb;
  raw_ip text;
begin
  begin
    headers := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then
    return null;
  end;

  raw_ip := trim(split_part(coalesce(headers->>'x-forwarded-for',''), ',', 1));
  if raw_ip = '' then
    return null;
  end if;

  begin
    return raw_ip::inet;
  exception when others then
    return null;
  end;
end;
$$;

create or replace function private.enforce_rate_limit(
  p_action text,
  p_limit integer,
  p_window interval
)
returns void
language plpgsql
security definer
set search_path = private, public
as $$
declare
  ip inet;
  used integer;
begin
  ip := private.client_ip();
  if ip is null then
    return;
  end if;

  -- Krátká retence; starší evidence není potřeba.
  delete from private.request_limits
  where requested_at < now() - interval '1 hour';

  select count(*)
  into used
  from private.request_limits
  where client_ip = ip
    and action = p_action
    and requested_at >= now() - p_window;

  if used >= p_limit then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into private.request_limits(client_ip, action)
  values (ip, p_action);
end;
$$;

-- Žádný přímý anonymní přístup do tabulek.
revoke all on table public.invitations from anon;
revoke all on table public.admin_users from anon, authenticated;

-- Admin má tabulkové oprávnění, ale RLS dovolí řádky pouze e-mailům z admin_users.
grant select, insert, update, delete on table public.invitations to authenticated;
grant usage, select on sequence public.invitations_id_seq to authenticated;

-- Veřejné načtení pozvánky: max 30 pokusů / 10 minut / IP.
create or replace function public.get_invitation(p_code text)
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

  if p_code is null or p_code !~ '^[0-9]{4}$' then
    return;
  end if;

  return query
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
  limit 1;
end;
$$;

-- RSVP: max 15 zápisů / 10 minut / IP.
create or replace function public.submit_rsvp(
  p_code text,
  p_status text,
  p_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.enforce_rate_limit('rsvp_submit', 15, interval '10 minutes');

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

revoke all on function public.get_invitation(text) from public;
revoke all on function public.submit_rsvp(text,text,text) from public;

grant execute on function public.get_invitation(text) to anon, authenticated;
grant execute on function public.submit_rsvp(text,text,text) to anon, authenticated;

-- Soukromé helper funkce nejsou volatelné přes veřejné role.
revoke all on function private.client_ip() from public, anon, authenticated;
revoke all on function private.enforce_rate_limit(text,integer,interval) from public, anon, authenticated;
