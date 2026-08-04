begin;

-- Normalize every decimal embedded in portion text to at most two digits.
-- This fixes legacy values such as 5.5000000000000000 and also protects
-- future writes made through the admin dashboard or direct database clients.
create or replace function public.petbites_normalize_decimal_text(input_value text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  remaining text := input_value;
  output_value text := '';
  matched text[];
  raw_number text;
  match_position integer;
  rounded_number text;
begin
  if input_value is null then
    return null;
  end if;

  loop
    matched := regexp_match(remaining, '[0-9]+[.,][0-9]+');
    exit when matched is null;

    raw_number := matched[1];
    match_position := strpos(remaining, raw_number);

    rounded_number := round(replace(raw_number, ',', '.')::numeric, 2)::text;
    rounded_number := regexp_replace(rounded_number, '(\.[0-9]*?)0+$', '\1');
    rounded_number := regexp_replace(rounded_number, '\.$', '');

    output_value := output_value
      || left(remaining, match_position - 1)
      || rounded_number;

    remaining := substr(
      remaining,
      match_position + char_length(raw_number)
    );
  end loop;

  return output_value || remaining;
end;
$$;

update public.portion_rules
set
  teaspoon = public.petbites_normalize_decimal_text(teaspoon),
  teaspoon_en = public.petbites_normalize_decimal_text(teaspoon_en),
  morning = public.petbites_normalize_decimal_text(morning),
  morning_en = public.petbites_normalize_decimal_text(morning_en),
  evening = public.petbites_normalize_decimal_text(evening),
  evening_en = public.petbites_normalize_decimal_text(evening_en)
where
  (
    content_status <> 'published'
    or (
      nullif(btrim(teaspoon_en), '') is not null
      and nullif(btrim(morning_en), '') is not null
      and nullif(btrim(evening_en), '') is not null
    )
  )
  and (
    teaspoon is distinct from public.petbites_normalize_decimal_text(teaspoon)
    or teaspoon_en is distinct from public.petbites_normalize_decimal_text(teaspoon_en)
    or morning is distinct from public.petbites_normalize_decimal_text(morning)
    or morning_en is distinct from public.petbites_normalize_decimal_text(morning_en)
    or evening is distinct from public.petbites_normalize_decimal_text(evening)
    or evening_en is distinct from public.petbites_normalize_decimal_text(evening_en)
  );

create or replace function public.petbites_normalize_portion_decimals()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.teaspoon := public.petbites_normalize_decimal_text(new.teaspoon);
  new.teaspoon_en := public.petbites_normalize_decimal_text(new.teaspoon_en);
  new.morning := public.petbites_normalize_decimal_text(new.morning);
  new.morning_en := public.petbites_normalize_decimal_text(new.morning_en);
  new.evening := public.petbites_normalize_decimal_text(new.evening);
  new.evening_en := public.petbites_normalize_decimal_text(new.evening_en);
  return new;
end;
$$;

drop trigger if exists portion_rules_normalize_decimals on public.portion_rules;
create trigger portion_rules_normalize_decimals
before insert or update of teaspoon, teaspoon_en, morning, morning_en, evening, evening_en
on public.portion_rules
for each row
execute function public.petbites_normalize_portion_decimals();

commit;
