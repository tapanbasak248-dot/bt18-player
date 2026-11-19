-- BT18 deployment hardening
-- Applied to Supabase project cnocicryyhkacuwddmal on 2026-11-19.
-- Preserve the existing virtual-coin game rules and balances.

create or replace function private.play_teen_patti(p_stake bigint)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  prof public.profiles%rowtype;
  want_win boolean;
  h int[];
  sc int[] := array[0,0,0,0,0];
  attempt int := 0;
  ok boolean := false;
  botmax int;
  bi int;
  j int;
  k int;
  tmp int;
  delta bigint;
  newpts bigint;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.games where slug = 'teen-patti' and enabled) then
    raise exception 'game disabled';
  end if;
  select * into prof from public.profiles where id = uid for update;
  if not found or prof.role <> 'player' then raise exception 'players only'; end if;
  if p_stake is null or p_stake < 1 then raise exception 'invalid stake'; end if;
  if p_stake > prof.points then raise exception 'not enough coins'; end if;
  want_win := (random() * 100) < prof.win_chance;
  while attempt < 100 and not ok loop
    attempt := attempt + 1;
    h := (array(select g from generate_series(0, 51) g order by random()))[1:15];
    for j in 0..4 loop
      sc[j + 1] := public._tp_score(h[j*3 + 1], h[j*3 + 2], h[j*3 + 3]);
    end loop;
    botmax := greatest(sc[2], sc[3], sc[4], sc[5]);
    bi := 1;
    for j in 1..4 loop
      if sc[j + 1] = botmax then bi := j; exit; end if;
    end loop;
    if want_win then
      if sc[1] <= botmax then
        for k in 1..3 loop
          tmp := h[k]; h[k] := h[bi*3 + k]; h[bi*3 + k] := tmp;
        end loop;
        tmp := sc[1]; sc[1] := sc[bi + 1]; sc[bi + 1] := tmp;
      end if;
      botmax := greatest(sc[2], sc[3], sc[4], sc[5]);
      ok := sc[1] > botmax;
    else
      if sc[1] > botmax then
        bi := 1 + floor(random() * 4)::int;
        for k in 1..3 loop
          tmp := h[k]; h[k] := h[bi*3 + k]; h[bi*3 + k] := tmp;
        end loop;
        tmp := sc[1]; sc[1] := sc[bi + 1]; sc[bi + 1] := tmp;
      end if;
      botmax := greatest(sc[2], sc[3], sc[4], sc[5]);
      ok := not (sc[1] > botmax);
    end if;
  end loop;
  if not ok then raise exception 'deal failed, try again'; end if;
  delta := case when want_win then p_stake * 4 else -p_stake end;
  update public.profiles set points = points + delta where id = uid returning points into newpts;
  insert into public.demo_rounds (user_id, game_slug, result)
  values (uid, 'teen-patti', case when want_win then 'win' else 'lose' end);
  return jsonb_build_object(
    'hands', jsonb_build_array(
      jsonb_build_array(h[1], h[2], h[3]),
      jsonb_build_array(h[4], h[5], h[6]),
      jsonb_build_array(h[7], h[8], h[9]),
      jsonb_build_array(h[10], h[11], h[12]),
      jsonb_build_array(h[13], h[14], h[15])),
    'win', want_win, 'delta', delta, 'points', newpts,
    'stake', p_stake, 'win_chance', prof.win_chance);
end
$function$;

create or replace function public.play_teen_patti(p_stake bigint)
returns jsonb
language sql
set search_path to ''
as $function$
  select private.play_teen_patti(p_stake);
$function$;

revoke all on function public.play_teen_patti(bigint) from public, anon;
grant execute on function public.play_teen_patti(bigint) to authenticated, service_role;
revoke all on function private.play_teen_patti(bigint) from public, anon;
grant execute on function private.play_teen_patti(bigint) to authenticated, service_role;

create or replace function private.touch_account_presence(p_login boolean, p_user_agent text, p_logout boolean)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not exists (
    select 1 from public.profiles
    where id = v_uid and role in ('player','admin')
  ) then
    raise exception 'Account not found';
  end if;
  insert into public.account_presence(user_id,last_login_at,last_seen_at,user_agent,is_online)
  values(v_uid,case when p_login then clock_timestamp() else null end,
         clock_timestamp(),left(coalesce(p_user_agent,''),300),not p_logout)
  on conflict(user_id) do update set
    last_login_at=case when p_login then clock_timestamp() else public.account_presence.last_login_at end,
    last_seen_at=clock_timestamp(),
    user_agent=left(coalesce(p_user_agent,public.account_presence.user_agent,''),300),
    is_online=not p_logout;
end
$function$;

create or replace function public.touch_account_presence(
  p_login boolean default false,
  p_user_agent text default null,
  p_logout boolean default false
)
returns void
language sql
set search_path to ''
as $function$
  select private.touch_account_presence(p_login,p_user_agent,p_logout);
$function$;

revoke all on function public.touch_account_presence(boolean,text,boolean) from public, anon;
grant execute on function public.touch_account_presence(boolean,text,boolean) to authenticated, service_role;
revoke all on function private.touch_account_presence(boolean,text,boolean) from public, anon;
grant execute on function private.touch_account_presence(boolean,text,boolean) to authenticated, service_role;

drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Players read own profile" on public.profiles;
create policy "Profiles readable by owner or admin"
on public.profiles for select to authenticated
using ((id = (select auth.uid())) or (select public.is_admin()));

drop policy if exists "Admins can view all games" on public.games;
drop policy if exists "Players read enabled games" on public.games;
create policy "Games readable when enabled or by admin"
on public.games for select to authenticated
using (enabled = true or (select public.is_admin()));

drop policy if exists "Players read own history" on public.demo_rounds;
create policy "Players read own history"
on public.demo_rounds for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Players add own demo history" on public.demo_rounds;
create policy "Players add own demo history"
on public.demo_rounds for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Admin can read own record" on public.admin_users;
create policy "Admin can read own record"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));
