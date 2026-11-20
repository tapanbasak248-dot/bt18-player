-- Keep the per-player admin win setting server-side only.
-- The game engine still reads win_chance internally, but player-facing RPC
-- payloads and player-readable round history must not expose its numeric value.

do $bt18$
declare
  r record;
  v_def text;
  v_new text;
begin
  for r in
    select p.oid, n.nspname, p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='private'
      and ((p.proname='play_demo_round' and pg_get_function_identity_arguments(p.oid)='p_game_slug text, p_choice text, p_stake bigint')
        or (p.proname='play_extra_demo_round' and pg_get_function_identity_arguments(p.oid)='p_game_slug text, p_choice text, p_stake bigint')
        or (p.proname='play_teen_patti' and pg_get_function_identity_arguments(p.oid)='p_stake bigint'))
  loop
    v_def := pg_get_functiondef(r.oid);
    v_new := regexp_replace(
      v_def,
      ',[[:space:]]*''win_chance'',[[:space:]]*(v_chance|prof\.win_chance)',
      '',
      'g'
    );
    if v_new = v_def then
      raise exception 'Expected win_chance response field was not found in %.%', r.nspname, r.proname;
    end if;
    execute v_new;
  end loop;
end
$bt18$;

update public.demo_rounds
set result = ((result::jsonb) - 'win_chance')::text
where result like '%"win_chance"%';
