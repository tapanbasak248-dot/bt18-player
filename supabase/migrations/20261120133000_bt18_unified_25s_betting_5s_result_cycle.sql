-- All BT18 virtual-coin games use one synchronized 30-second cycle:
-- 25 seconds for bets, followed by a 5-second result phase.
-- The wrappers remain SECURITY INVOKER and delegate privileged work to private SECURITY DEFINER functions.

create or replace function public.play_demo_round(
  p_game_slug text, p_choice text, p_stake bigint, p_round_seconds integer
) returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_remaining integer;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  if p_round_seconds <> 30 then raise exception 'All BT18 rounds are fixed at 30 seconds'; end if;
  v_remaining := 30 - mod(floor(extract(epoch from clock_timestamp()))::bigint, 30)::integer;
  if v_remaining <= 5 then raise exception 'Betting is closed. The 5-second result phase has started'; end if;
  return private.play_demo_round(p_game_slug, p_choice, p_stake);
end;
$function$;

create or replace function public.play_demo_round(
  p_game_slug text, p_choice text, p_stake bigint
) returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_remaining integer;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  v_remaining := 30 - mod(floor(extract(epoch from clock_timestamp()))::bigint, 30)::integer;
  if v_remaining <= 5 then raise exception 'Betting is closed. The 5-second result phase has started'; end if;
  return private.play_demo_round(p_game_slug, p_choice, p_stake);
end;
$function$;

create or replace function public.play_extra_demo_round(
  p_game_slug text, p_choice text, p_stake bigint
) returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_remaining integer;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  v_remaining := 30 - mod(floor(extract(epoch from clock_timestamp()))::bigint, 30)::integer;
  if v_remaining <= 5 then raise exception 'Betting is closed. The 5-second result phase has started'; end if;
  return private.play_extra_demo_round(p_game_slug, p_choice, p_stake);
end;
$function$;

create or replace function public.play_teen_patti(p_stake bigint)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_remaining integer;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  v_remaining := 30 - mod(floor(extract(epoch from clock_timestamp()))::bigint, 30)::integer;
  if v_remaining <= 5 then raise exception 'Betting is closed. The 5-second result phase has started'; end if;
  return private.play_teen_patti(p_stake);
end;
$function$;
