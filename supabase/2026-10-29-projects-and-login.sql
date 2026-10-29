-- Run once in Supabase → SQL Editor (project: NorthboundWeb's Project).
-- Adds "Start a project" requests (no call time) and client log in.

-- 1. "Start a project": requests without a call time, answered by WhatsApp or email.
alter table nb_booking.bookings alter column day drop not null;
alter table nb_booking.bookings alter column slot drop not null;
alter table nb_booking.bookings add column if not exists kind text not null default 'call';
alter table nb_booking.bookings add column if not exists reply_via text not null default '';
alter table nb_booking.bookings drop constraint if exists bookings_kind_check;
alter table nb_booking.bookings add constraint bookings_kind_check check (kind in ('call','project'));

-- 2. Client log in: reference + email issues fresh tokens for that email's requests.
alter table nb_booking.bookings add column if not exists extra_token_hashes text[] not null default '{}';
create table if not exists nb_booking.login_attempts (email text not null, at timestamptz not null default now());
create index if not exists login_attempts_email_at on nb_booking.login_attempts (email, at);
alter table nb_booking.login_attempts enable row level security;

create or replace function nb_booking.token_ok(b nb_booking.bookings, p_token text) returns boolean
language sql stable set search_path = '' as $$
  select coalesce(p_token, '') <> '' and (
    b.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    or encode(extensions.digest(p_token, 'sha256'), 'hex') = any (b.extra_token_hashes))
$$;

create or replace function public.nb_booking_create(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_kind text := coalesce(nullif(p->>'kind', ''), 'call');
  v_day date;
  v_slot text := nullif(coalesce(p->>'slot',''), '');
  v_name text := btrim(coalesce(p->>'name',''));
  v_email text := lower(btrim(coalesce(p->>'email','')));
  v_phone text := left(btrim(coalesce(p->>'phone','')), 40);
  v_reply text := coalesce(p->>'replyVia', '');
  v_help text[];
  v_ref text;
  v_token text;
  v_today date := nb_booking.today();
begin
  if v_kind not in ('call','project') then
    return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'kind');
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

  if v_kind = 'call' then
    begin
      v_day := (p->>'day')::date;
    exception when others then
      return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'day');
    end;
    if v_day is null or v_day <= v_today or v_day > v_today + 21 or extract(isodow from v_day) > 5 then
      return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'day');
    end if;
    if v_slot is null or not (v_slot = any (nb_booking.slots())) then
      return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'slot');
    end if;
  else
    v_day := null;
    v_slot := null;
    if v_reply not in ('whatsapp','email') then
      return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'replyVia');
    end if;
    if v_reply = 'whatsapp' and length(regexp_replace(v_phone, '\D', '', 'g')) < 10 then
      return jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'phone');
    end if;
  end if;

  -- No more than three open requests per email.
  if (select count(*) from nb_booking.bookings
       where lower(email) = v_email and status in ('requested','confirmed')
         and (day is null or day >= v_today)
         and created_at > now() - interval '30 days') >= 3 then
    return jsonb_build_object('ok', false, 'error', 'limited');
  end if;

  if v_kind = 'call' then
    perform pg_advisory_xact_lock(hashtext('nb_booking:' || v_day::text || v_slot));
    if exists (select 1 from nb_booking.blocks where day = v_day and slot = v_slot) then
      return jsonb_build_object('ok', false, 'error', 'taken');
    end if;
  end if;

  v_token := encode(extensions.gen_random_bytes(24), 'hex');
  loop
    v_ref := 'NB-' || upper(encode(extensions.gen_random_bytes(3), 'hex'));
    exit when not exists (select 1 from nb_booking.bookings where ref = v_ref);
  end loop;

  begin
    insert into nb_booking.bookings (ref, token_hash, kind, reply_via, day, slot, help, other, budget, plan, timeline, name, business, email, phone, site)
    values (v_ref, encode(extensions.digest(v_token, 'sha256'), 'hex'), v_kind, case when v_kind = 'project' then v_reply else '' end,
      v_day, v_slot, v_help,
      left(coalesce(p->>'other',''), 1500), left(coalesce(p->>'budget',''), 60), left(coalesce(p->>'plan',''), 60),
      left(coalesce(p->>'timeline',''), 60), v_name, left(btrim(coalesce(p->>'business','')), 120), v_email,
      v_phone, left(btrim(coalesce(p->>'site','')), 200));
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'taken');
  end;

  return jsonb_build_object('ok', true, 'ref', v_ref, 'token', v_token);
end $$;

create or replace function public.nb_booking_login(p_ref text, p_email text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_ref text := upper(btrim(coalesce(p_ref, '')));
  v_items jsonb := '[]';
  r record;
  v_token text;
begin
  if length(v_email) > 200 or length(v_ref) > 20 then
    return jsonb_build_object('ok', false);
  end if;
  if (select count(*) from nb_booking.login_attempts where email = v_email and at > now() - interval '1 hour') >= 10 then
    return jsonb_build_object('ok', false, 'error', 'limited');
  end if;
  insert into nb_booking.login_attempts (email) values (v_email);
  delete from nb_booking.login_attempts where at < now() - interval '1 day';
  if not exists (select 1 from nb_booking.bookings where ref = v_ref and lower(email) = v_email) then
    return jsonb_build_object('ok', false);
  end if;
  for r in select id, ref from nb_booking.bookings where lower(email) = v_email order by created_at desc limit 10 loop
    v_token := encode(extensions.gen_random_bytes(24), 'hex');
    update nb_booking.bookings
       set extra_token_hashes = (array_append(extra_token_hashes, encode(extensions.digest(v_token, 'sha256'), 'hex')))[greatest(1, cardinality(extra_token_hashes) - 8):]
     where id = r.id;
    v_items := v_items || jsonb_build_object('ref', r.ref, 'token', v_token);
  end loop;
  return jsonb_build_object('ok', true, 'items', v_items);
end $$;

create or replace function public.nb_booking_mine(p_items jsonb)
returns setof jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('ref', b.ref, 'kind', b.kind, 'replyVia', b.reply_via, 'day', b.day, 'slot', b.slot, 'status', b.status,
           'help', b.help, 'budget', b.budget, 'timeline', b.timeline, 'name', b.name, 'email', b.email,
           'createdAt', b.created_at)
    from nb_booking.bookings b
    join (select x->>'ref' ref, x->>'token' token
            from jsonb_array_elements(case when jsonb_typeof(p_items) = 'array' then p_items else '[]' end) x
           limit 20) q
      on q.ref = b.ref and nb_booking.token_ok(b, q.token)
   order by b.created_at desc
$$;

create or replace function public.nb_booking_cancel(p_ref text, p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  update nb_booking.bookings b set status = 'cancelled', cancelled_by = 'visitor', updated_at = now()
   where b.ref = p_ref and nb_booking.token_ok(b, p_token) and b.status <> 'cancelled';
  return jsonb_build_object('ok', found);
end $$;

create or replace function public.nb_booking_admin_list(p_secret text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not nb_booking.is_admin(p_secret) then return jsonb_build_object('ok', false); end if;
  return jsonb_build_object('ok', true,
    'bookings', coalesce((select jsonb_agg(jsonb_build_object('ref', ref, 'kind', kind, 'replyVia', reply_via, 'status', status, 'day', day, 'slot', slot,
        'help', help, 'other', other, 'budget', budget, 'plan', plan, 'timeline', timeline, 'name', name,
        'business', business, 'email', email, 'phone', phone, 'site', site, 'cancelledBy', cancelled_by,
        'createdAt', created_at) order by created_at desc)
      from nb_booking.bookings where coalesce(day, created_at::date) >= nb_booking.today() - 60), '[]'),
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'slot', slot))
      from nb_booking.blocks where day >= nb_booking.today()), '[]'));
end $$;

revoke all on function public.nb_booking_login(text, text) from public;
grant execute on function public.nb_booking_login(text, text) to anon, authenticated;
revoke all on function nb_booking.token_ok(nb_booking.bookings, text) from public;
