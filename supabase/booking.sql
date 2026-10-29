-- Northbound booking preview. Applied to Supabase as migration 20261029093202
-- (nb_booking_init). Kept here so the schema lives beside the code that calls it.
--
-- After applying, store the owner secret's hash (never the secret itself):
--   insert into nb_booking.config (id, admin_hash)
--   values (1, encode(extensions.digest('<NB_ADMIN_SECRET>', 'sha256'), 'hex'))
--   on conflict (id) do update set admin_hash = excluded.admin_hash;

create schema if not exists nb_booking;
revoke all on schema nb_booking from public, anon, authenticated;

create table nb_booking.config (
  id int primary key default 1 check (id = 1),
  admin_hash text not null
);

create table nb_booking.bookings (
  id uuid primary key default extensions.gen_random_uuid(),
  ref text not null unique,
  token_hash text not null,
  status text not null default 'requested' check (status in ('requested','confirmed','cancelled')),
  day date not null,
  slot text not null,
  help text[] not null default '{}',
  other text not null default '',
  budget text not null default '',
  plan text not null default '',
  timeline text not null default '',
  name text not null,
  business text not null default '',
  email text not null,
  phone text not null default '',
  site text not null default '',
  cancelled_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index bookings_active_slot on nb_booking.bookings (day, slot) where status in ('requested','confirmed');
create index bookings_email_recent on nb_booking.bookings (lower(email), created_at);

create table nb_booking.blocks (
  day date not null,
  slot text not null,
  created_at timestamptz not null default now(),
  primary key (day, slot)
);

alter table nb_booking.config enable row level security;
alter table nb_booking.bookings enable row level security;
alter table nb_booking.blocks enable row level security;

create or replace function nb_booking.slots() returns text[] language sql immutable set search_path = '' as
$$ select array['09:30','11:00','13:30','15:00','17:30','19:00'] $$;

create or replace function nb_booking.today() returns date language sql stable set search_path = '' as
$$ select (now() at time zone 'Europe/London')::date $$;

create or replace function nb_booking.is_admin(p_secret text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(length(p_secret) >= 24 and exists (
    select 1 from nb_booking.config
    where admin_hash = encode(extensions.digest(p_secret, 'sha256'), 'hex')), false)
$$;

-- Public: which slots are unavailable. No personal data.
create or replace function public.nb_booking_taken(p_from date, p_to date)
returns table (day date, slot text)
language sql stable security definer set search_path = '' as $$
  select b.day, b.slot from nb_booking.bookings b
   where b.status in ('requested','confirmed') and b.day between p_from and least(p_to, p_from + 31)
  union
  select k.day, k.slot from nb_booking.blocks k
   where k.day between p_from and least(p_to, p_from + 31)
$$;

-- Public: request a slot. Re-validates everything; first request for a slot wins.
create or replace function public.nb_booking_create(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_day date;
  v_slot text := coalesce(p->>'slot','');
  v_name text := btrim(coalesce(p->>'name',''));
  v_email text := lower(btrim(coalesce(p->>'email','')));
  v_help text[];
  v_ref text;
  v_token text;
  v_today date := nb_booking.today();
begin
  begin
    v_day := (p->>'day')::date;
  exception when others then
    return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'day');
  end;
  if v_day is null or v_day <= v_today or v_day > v_today + 21 or extract(isodow from v_day) > 5 then
    return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'day');
  end if;
  if not (v_slot = any (nb_booking.slots())) then
    return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'slot');
  end if;
  if length(v_name) < 1 or length(v_name) > 120 then
    return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'name');
  end if;
  if length(v_email) > 200 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'email');
  end if;
  select coalesce(array_agg(left(x, 60)), '{}') into v_help
    from (select jsonb_array_elements_text(coalesce(p->'help','[]'::jsonb)) x limit 8) s;
  if cardinality(v_help) = 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'help');
  end if;

  -- Same email: no more than 3 open requests at once.
  if (select count(*) from nb_booking.bookings
       where lower(email) = v_email and status in ('requested','confirmed') and day >= v_today) >= 3 then
    return jsonb_build_object('ok', false, 'error', 'limited');
  end if;

  -- Serialise on this slot so a block and a booking cannot both land.
  perform pg_advisory_xact_lock(hashtext('nb_booking:' || v_day::text || v_slot));
  if exists (select 1 from nb_booking.blocks where day = v_day and slot = v_slot) then
    return jsonb_build_object('ok', false, 'error', 'taken');
  end if;

  v_token := encode(extensions.gen_random_bytes(24), 'hex');
  loop
    v_ref := 'NB-' || upper(encode(extensions.gen_random_bytes(3), 'hex'));
    exit when not exists (select 1 from nb_booking.bookings where ref = v_ref);
  end loop;

  begin
    insert into nb_booking.bookings (ref, token_hash, day, slot, help, other, budget, plan, timeline, name, business, email, phone, site)
    values (v_ref, encode(extensions.digest(v_token, 'sha256'), 'hex'), v_day, v_slot, v_help,
      left(coalesce(p->>'other',''), 1500), left(coalesce(p->>'budget',''), 60), left(coalesce(p->>'plan',''), 60),
      left(coalesce(p->>'timeline',''), 60), v_name, left(btrim(coalesce(p->>'business','')), 120), v_email,
      left(btrim(coalesce(p->>'phone','')), 40), left(btrim(coalesce(p->>'site','')), 200));
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'taken');
  end;

  return jsonb_build_object('ok', true, 'ref', v_ref, 'token', v_token);
end $$;

-- Public: a visitor's own requests, by (ref, token) pairs they hold.
create or replace function public.nb_booking_mine(p_items jsonb)
returns setof jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('ref', b.ref, 'day', b.day, 'slot', b.slot, 'status', b.status,
           'help', b.help, 'budget', b.budget, 'timeline', b.timeline, 'name', b.name, 'email', b.email,
           'createdAt', b.created_at)
    from nb_booking.bookings b
    join (select x->>'ref' ref, x->>'token' token
            from jsonb_array_elements(case when jsonb_typeof(p_items) = 'array' then p_items else '[]' end) x
           limit 20) q
      on q.ref = b.ref and b.token_hash = encode(extensions.digest(coalesce(q.token,''), 'sha256'), 'hex')
   order by b.created_at desc
$$;

-- Public: cancel your own request.
create or replace function public.nb_booking_cancel(p_ref text, p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  update nb_booking.bookings set status = 'cancelled', cancelled_by = 'visitor', updated_at = now()
   where ref = p_ref and token_hash = encode(extensions.digest(coalesce(p_token,''), 'sha256'), 'hex')
     and status <> 'cancelled';
  return jsonb_build_object('ok', found);
end $$;

-- Owner: everything, gated on the diary secret.
create or replace function public.nb_booking_admin_list(p_secret text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not nb_booking.is_admin(p_secret) then return jsonb_build_object('ok', false); end if;
  return jsonb_build_object('ok', true,
    'bookings', coalesce((select jsonb_agg(jsonb_build_object('ref', ref, 'status', status, 'day', day, 'slot', slot,
        'help', help, 'other', other, 'budget', budget, 'plan', plan, 'timeline', timeline, 'name', name,
        'business', business, 'email', email, 'phone', phone, 'site', site, 'cancelledBy', cancelled_by,
        'createdAt', created_at) order by day, slot)
      from nb_booking.bookings where day >= nb_booking.today() - 30), '[]'),
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'slot', slot))
      from nb_booking.blocks where day >= nb_booking.today()), '[]'));
end $$;

create or replace function public.nb_booking_admin_set_status(p_secret text, p_ref text, p_status text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  if not nb_booking.is_admin(p_secret) then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if p_status not in ('confirmed','cancelled') then return jsonb_build_object('ok', false, 'error', 'invalid'); end if;
  update nb_booking.bookings set status = p_status, updated_at = now(),
         cancelled_by = case when p_status = 'cancelled' then 'owner' else null end
   where ref = p_ref and status <> 'cancelled';
  return jsonb_build_object('ok', found);
end $$;

create or replace function public.nb_booking_admin_block(p_secret text, p_day date, p_slot text, p_block boolean)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  if not nb_booking.is_admin(p_secret) then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if not (p_slot = any (nb_booking.slots())) then return jsonb_build_object('ok', false, 'error', 'invalid'); end if;
  perform pg_advisory_xact_lock(hashtext('nb_booking:' || p_day::text || p_slot));
  if p_block then
    if exists (select 1 from nb_booking.bookings where day = p_day and slot = p_slot and status in ('requested','confirmed')) then
      return jsonb_build_object('ok', false, 'error', 'booked');
    end if;
    insert into nb_booking.blocks (day, slot) values (p_day, p_slot) on conflict do nothing;
  else
    delete from nb_booking.blocks where day = p_day and slot = p_slot;
  end if;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.nb_booking_taken(date, date), public.nb_booking_create(jsonb), public.nb_booking_mine(jsonb),
  public.nb_booking_cancel(text, text), public.nb_booking_admin_list(text), public.nb_booking_admin_set_status(text, text, text),
  public.nb_booking_admin_block(text, date, text, boolean) from public;
grant execute on function public.nb_booking_taken(date, date), public.nb_booking_create(jsonb), public.nb_booking_mine(jsonb),
  public.nb_booking_cancel(text, text), public.nb_booking_admin_list(text), public.nb_booking_admin_set_status(text, text, text),
  public.nb_booking_admin_block(text, date, text, boolean) to anon, authenticated;
revoke all on function nb_booking.is_admin(text), nb_booking.slots(), nb_booking.today() from public;
