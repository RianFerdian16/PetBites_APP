begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.app_features (
  id text primary key,
  label text not null,
  short_label text not null,
  description text not null default '',
  icon_key text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.birds (
  id text primary key,
  name text not null,
  emoji text not null default '🐦',
  image_url text,
  scientific_name text not null,
  description text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  review_status text not null default 'needs_review'
    check (review_status in ('needs_review', 'reviewed', 'archived')),
  source_urls text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bird_foods (
  id text primary key,
  bird_id text not null references public.birds(id) on delete cascade,
  name text not null,
  category text not null check (category in ('main', 'extra')),
  benefits text[] not null default array[]::text[],
  note text,
  sort_order integer not null default 0,
  review_status text not null default 'needs_review'
    check (review_status in ('needs_review', 'reviewed', 'archived')),
  source_urls text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bird_id, name)
);

create table if not exists public.toxic_entries (
  id text primary key,
  bird_id text references public.birds(id) on delete cascade,
  name text not null,
  status text not null check (status in ('safe', 'caution', 'toxic')),
  explanation text not null,
  sort_order integer not null default 0,
  review_status text not null default 'needs_review'
    check (review_status in ('needs_review', 'reviewed', 'archived')),
  source_urls text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists toxic_entries_common_name_unique
  on public.toxic_entries (lower(name))
  where bird_id is null;

create unique index if not exists toxic_entries_bird_name_unique
  on public.toxic_entries (bird_id, lower(name))
  where bird_id is not null;

create table if not exists public.portion_rules (
  id text primary key,
  bird_id text not null references public.birds(id) on delete cascade,
  size text not null check (size in ('Kecil', 'Standar', 'Besar')),
  condition text not null check (condition in ('Harian', 'Mabung', 'Ternak')),
  grams numeric(8,2) not null check (grams > 0),
  teaspoon text not null,
  morning text not null,
  evening text not null,
  sort_order integer not null default 0,
  review_status text not null default 'needs_review'
    check (review_status in ('needs_review', 'reviewed', 'archived')),
  source_urls text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bird_id, size, condition)
);

create table if not exists public.recipes (
  id text primary key,
  bird_id text not null references public.birds(id) on delete cascade,
  title text not null,
  purpose text not null,
  sort_order integer not null default 0,
  review_status text not null default 'needs_review'
    check (review_status in ('needs_review', 'reviewed', 'archived')),
  source_urls text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bird_id, title)
);

create table if not exists public.recipe_ingredients (
  recipe_id text not null references public.recipes(id) on delete cascade,
  sort_order integer not null,
  ingredient text not null,
  primary key (recipe_id, sort_order)
);

create table if not exists public.recipe_steps (
  recipe_id text not null references public.recipes(id) on delete cascade,
  sort_order integer not null,
  instruction text not null,
  primary key (recipe_id, sort_order)
);

create index if not exists bird_foods_bird_id_idx on public.bird_foods(bird_id);
create index if not exists toxic_entries_bird_id_idx on public.toxic_entries(bird_id);
create index if not exists portion_rules_bird_id_idx on public.portion_rules(bird_id);
create index if not exists recipes_bird_id_idx on public.recipes(bird_id);

drop trigger if exists app_features_set_updated_at on public.app_features;
create trigger app_features_set_updated_at
before update on public.app_features
for each row execute function public.set_updated_at();

drop trigger if exists birds_set_updated_at on public.birds;
create trigger birds_set_updated_at
before update on public.birds
for each row execute function public.set_updated_at();

drop trigger if exists bird_foods_set_updated_at on public.bird_foods;
create trigger bird_foods_set_updated_at
before update on public.bird_foods
for each row execute function public.set_updated_at();

drop trigger if exists toxic_entries_set_updated_at on public.toxic_entries;
create trigger toxic_entries_set_updated_at
before update on public.toxic_entries
for each row execute function public.set_updated_at();

drop trigger if exists portion_rules_set_updated_at on public.portion_rules;
create trigger portion_rules_set_updated_at
before update on public.portion_rules
for each row execute function public.set_updated_at();

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

alter table public.app_features enable row level security;
alter table public.birds enable row level security;
alter table public.bird_foods enable row level security;
alter table public.toxic_entries enable row level security;
alter table public.portion_rules enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;

drop policy if exists "Public can read active features" on public.app_features;
create policy "Public can read active features"
on public.app_features for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active birds" on public.birds;
create policy "Public can read active birds"
on public.birds for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read foods for active birds" on public.bird_foods;
create policy "Public can read foods for active birds"
on public.bird_foods for select
to anon, authenticated
using (
  exists (
    select 1 from public.birds
    where birds.id = bird_foods.bird_id
      and birds.is_active = true
  )
);

drop policy if exists "Public can read toxic checker data" on public.toxic_entries;
create policy "Public can read toxic checker data"
on public.toxic_entries for select
to anon, authenticated
using (
  bird_id is null
  or exists (
    select 1 from public.birds
    where birds.id = toxic_entries.bird_id
      and birds.is_active = true
  )
);

drop policy if exists "Public can read portions for active birds" on public.portion_rules;
create policy "Public can read portions for active birds"
on public.portion_rules for select
to anon, authenticated
using (
  exists (
    select 1 from public.birds
    where birds.id = portion_rules.bird_id
      and birds.is_active = true
  )
);

drop policy if exists "Public can read recipes for active birds" on public.recipes;
create policy "Public can read recipes for active birds"
on public.recipes for select
to anon, authenticated
using (
  exists (
    select 1 from public.birds
    where birds.id = recipes.bird_id
      and birds.is_active = true
  )
);

drop policy if exists "Public can read recipe ingredients" on public.recipe_ingredients;
create policy "Public can read recipe ingredients"
on public.recipe_ingredients for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    join public.birds on birds.id = recipes.bird_id
    where recipes.id = recipe_ingredients.recipe_id
      and birds.is_active = true
  )
);

drop policy if exists "Public can read recipe steps" on public.recipe_steps;
create policy "Public can read recipe steps"
on public.recipe_steps for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    join public.birds on birds.id = recipes.bird_id
    where recipes.id = recipe_steps.recipe_id
      and birds.is_active = true
  )
);

grant usage on schema public to anon, authenticated;
grant select on public.app_features to anon, authenticated;
grant select on public.birds to anon, authenticated;
grant select on public.bird_foods to anon, authenticated;
grant select on public.toxic_entries to anon, authenticated;
grant select on public.portion_rules to anon, authenticated;
grant select on public.recipes to anon, authenticated;
grant select on public.recipe_ingredients to anon, authenticated;
grant select on public.recipe_steps to anon, authenticated;

commit;
