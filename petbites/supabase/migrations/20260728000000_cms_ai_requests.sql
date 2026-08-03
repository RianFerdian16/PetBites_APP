-- PetBites CMS + private admin + optional AI assistant + public bird requests
-- Safe to run on top of the existing PetBites schema.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'editor' check (role in ('owner', 'editor', 'reviewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('insert', 'update', 'delete', 'ai_generate')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.bird_requests (
  id uuid primary key default gen_random_uuid(),
  bird_name text not null check (char_length(bird_name) between 2 and 120),
  local_name text check (local_name is null or char_length(local_name) <= 120),
  scientific_name text check (scientific_name is null or char_length(scientific_name) <= 160),
  reason text not null check (char_length(reason) between 10 and 1200),
  contact text check (contact is null or char_length(contact) <= 180),
  status text not null default 'pending'
    check (status in ('pending', 'reviewing', 'approved', 'rejected', 'duplicate')),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 3000),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bird_requests_status_created_idx
  on public.bird_requests(status, created_at desc);
create index if not exists bird_requests_name_idx
  on public.bird_requests(lower(bird_name));

create or replace function public.is_petbites_admin(
  required_roles text[] default array['owner','editor','reviewer']
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role = any(required_roles)
  );
$$;

revoke all on function public.is_petbites_admin(text[]) from public;
grant execute on function public.is_petbites_admin(text[]) to authenticated;

-- Existing content becomes CMS-managed without hiding current published data.
alter table public.birds
  add column if not exists content_status text not null default 'published'
    check (content_status in ('draft','review','published','archived')),
  add column if not exists ai_generated boolean not null default false,
  add column if not exists ai_model text,
  add column if not exists ai_generated_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

alter table public.bird_foods
  add column if not exists content_status text not null default 'published'
    check (content_status in ('draft','review','published','archived')),
  add column if not exists ai_generated boolean not null default false,
  add column if not exists ai_model text,
  add column if not exists ai_generated_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

alter table public.toxic_entries
  add column if not exists content_status text not null default 'published'
    check (content_status in ('draft','review','published','archived')),
  add column if not exists ai_generated boolean not null default false,
  add column if not exists ai_model text,
  add column if not exists ai_generated_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

alter table public.portion_rules
  add column if not exists content_status text not null default 'published'
    check (content_status in ('draft','review','published','archived')),
  add column if not exists ai_generated boolean not null default false,
  add column if not exists ai_model text,
  add column if not exists ai_generated_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

alter table public.recipes
  add column if not exists content_status text not null default 'published'
    check (content_status in ('draft','review','published','archived')),
  add column if not exists ai_generated boolean not null default false,
  add column if not exists ai_model text,
  add column if not exists ai_generated_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

update public.birds set content_status = 'published' where content_status is null;
update public.bird_foods set content_status = 'published' where content_status is null;
update public.toxic_entries set content_status = 'published' where content_status is null;
update public.portion_rules set content_status = 'published' where content_status is null;
update public.recipes set content_status = 'published' where content_status is null;

-- Timestamps and review metadata.
drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists bird_requests_set_updated_at on public.bird_requests;
create trigger bird_requests_set_updated_at
before update on public.bird_requests
for each row execute function public.set_updated_at();

create or replace function public.set_bird_request_review_meta()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status is distinct from old.status and new.status <> 'pending' then
    new.reviewed_by = auth.uid();
    new.reviewed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists bird_requests_review_meta on public.bird_requests;
create trigger bird_requests_review_meta
before update on public.bird_requests
for each row execute function public.set_bird_request_review_meta();

-- Public submission uses a narrow RPC. Visitors never receive table read access.
create or replace function public.submit_bird_request(
  p_bird_name text,
  p_local_name text default null,
  p_scientific_name text default null,
  p_reason text default '',
  p_contact text default null,
  p_website text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clean_name text := trim(regexp_replace(coalesce(p_bird_name, ''), '\s+', ' ', 'g'));
  clean_local text := nullif(trim(regexp_replace(coalesce(p_local_name, ''), '\s+', ' ', 'g')), '');
  clean_scientific text := nullif(trim(regexp_replace(coalesce(p_scientific_name, ''), '\s+', ' ', 'g')), '');
  clean_reason text := trim(coalesce(p_reason, ''));
  clean_contact text := nullif(trim(coalesce(p_contact, '')), '');
  request_id uuid;
begin
  -- Honeypot: bots receive a harmless success response without creating a row.
  if nullif(trim(coalesce(p_website, '')), '') is not null then
    return gen_random_uuid();
  end if;

  if char_length(clean_name) < 2 or char_length(clean_name) > 120 then
    raise exception 'Nama burung harus 2 sampai 120 karakter.';
  end if;
  if char_length(clean_reason) < 10 or char_length(clean_reason) > 1200 then
    raise exception 'Alasan harus 10 sampai 1200 karakter.';
  end if;
  if clean_local is not null and char_length(clean_local) > 120 then
    raise exception 'Nama lokal terlalu panjang.';
  end if;
  if clean_scientific is not null and char_length(clean_scientific) > 160 then
    raise exception 'Nama ilmiah terlalu panjang.';
  end if;
  if clean_contact is not null and char_length(clean_contact) > 180 then
    raise exception 'Kontak terlalu panjang.';
  end if;

  if exists (
    select 1
    from public.bird_requests
    where lower(bird_name) = lower(clean_name)
      and status in ('pending', 'reviewing')
      and created_at > now() - interval '12 hours'
  ) then
    raise exception 'Request burung serupa sudah masuk dan sedang ditinjau.';
  end if;

  insert into public.bird_requests (
    bird_name,
    local_name,
    scientific_name,
    reason,
    contact,
    status
  ) values (
    clean_name,
    clean_local,
    clean_scientific,
    clean_reason,
    clean_contact,
    'pending'
  )
  returning id into request_id;

  return request_id;
end;
$$;

revoke all on function public.submit_bird_request(text, text, text, text, text, text) from public;
grant execute on function public.submit_bird_request(text, text, text, text, text, text)
  to anon, authenticated;

-- Enable RLS.
alter table public.admin_users enable row level security;
alter table public.content_audit_log enable row level security;
alter table public.bird_requests enable row level security;

-- Admin profile access.
drop policy if exists "Admins can read admin profiles" on public.admin_users;
create policy "Admins can read admin profiles"
on public.admin_users for select
to authenticated
using (user_id = auth.uid() or public.is_petbites_admin(array['owner']));

drop policy if exists "Owners manage admin profiles" on public.admin_users;
create policy "Owners manage admin profiles"
on public.admin_users for all
to authenticated
using (public.is_petbites_admin(array['owner']))
with check (public.is_petbites_admin(array['owner']));

drop policy if exists "Admins can read audit log" on public.content_audit_log;
create policy "Admins can read audit log"
on public.content_audit_log for select
to authenticated
using (public.is_petbites_admin());

drop policy if exists "Admins can write audit log" on public.content_audit_log;
create policy "Admins can write audit log"
on public.content_audit_log for insert
to authenticated
with check (actor_id = auth.uid() and public.is_petbites_admin());

-- Bird requests are private after submission.
drop policy if exists "Admins read bird requests" on public.bird_requests;
create policy "Admins read bird requests"
on public.bird_requests for select
to authenticated
using (public.is_petbites_admin());

drop policy if exists "Editors manage bird requests" on public.bird_requests;
create policy "Editors manage bird requests"
on public.bird_requests for all
to authenticated
using (public.is_petbites_admin(array['owner','editor']))
with check (public.is_petbites_admin(array['owner','editor']));

-- Public visitors see only active + published content.
drop policy if exists "Public can read active birds" on public.birds;
drop policy if exists "Public can read active published birds" on public.birds;
create policy "Public can read active published birds"
on public.birds for select
to anon, authenticated
using (is_active = true and content_status = 'published');

drop policy if exists "Public can read foods for active birds" on public.bird_foods;
drop policy if exists "Public can read published foods" on public.bird_foods;
create policy "Public can read published foods"
on public.bird_foods for select
to anon, authenticated
using (
  content_status = 'published'
  and exists (
    select 1 from public.birds
    where birds.id = bird_foods.bird_id
      and birds.is_active = true
      and birds.content_status = 'published'
  )
);

drop policy if exists "Public can read toxic checker data" on public.toxic_entries;
drop policy if exists "Public can read published toxic data" on public.toxic_entries;
create policy "Public can read published toxic data"
on public.toxic_entries for select
to anon, authenticated
using (
  content_status = 'published'
  and (
    bird_id is null
    or exists (
      select 1 from public.birds
      where birds.id = toxic_entries.bird_id
        and birds.is_active = true
        and birds.content_status = 'published'
    )
  )
);

drop policy if exists "Public can read portions for active birds" on public.portion_rules;
drop policy if exists "Public can read published portions" on public.portion_rules;
create policy "Public can read published portions"
on public.portion_rules for select
to anon, authenticated
using (
  content_status = 'published'
  and exists (
    select 1 from public.birds
    where birds.id = portion_rules.bird_id
      and birds.is_active = true
      and birds.content_status = 'published'
  )
);

drop policy if exists "Public can read recipes for active birds" on public.recipes;
drop policy if exists "Public can read published recipes" on public.recipes;
create policy "Public can read published recipes"
on public.recipes for select
to anon, authenticated
using (
  content_status = 'published'
  and exists (
    select 1 from public.birds
    where birds.id = recipes.bird_id
      and birds.is_active = true
      and birds.content_status = 'published'
  )
);

drop policy if exists "Public can read recipe ingredients" on public.recipe_ingredients;
drop policy if exists "Public can read published recipe ingredients" on public.recipe_ingredients;
create policy "Public can read published recipe ingredients"
on public.recipe_ingredients for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    join public.birds on birds.id = recipes.bird_id
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.content_status = 'published'
      and birds.is_active = true
      and birds.content_status = 'published'
  )
);

drop policy if exists "Public can read recipe steps" on public.recipe_steps;
drop policy if exists "Public can read published recipe steps" on public.recipe_steps;
create policy "Public can read published recipe steps"
on public.recipe_steps for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    join public.birds on birds.id = recipes.bird_id
    where recipes.id = recipe_steps.recipe_id
      and recipes.content_status = 'published'
      and birds.is_active = true
      and birds.content_status = 'published'
  )
);

-- Private CMS read/write rules.
do $$
declare
  target_table text;
begin
  foreach target_table in array array['birds','bird_foods','toxic_entries','portion_rules','recipes']
  loop
    execute format('drop policy if exists "Admins read all %s" on public.%I', target_table, target_table);
    execute format(
      'create policy "Admins read all %s" on public.%I for select to authenticated using (public.is_petbites_admin())',
      target_table,
      target_table
    );
    execute format('drop policy if exists "Editors write %s" on public.%I', target_table, target_table);
    execute format(
      'create policy "Editors write %s" on public.%I for all to authenticated using (public.is_petbites_admin(array[''owner'',''editor''])) with check (public.is_petbites_admin(array[''owner'',''editor'']))',
      target_table,
      target_table
    );
  end loop;
end $$;

drop policy if exists "Admins read all recipe ingredients" on public.recipe_ingredients;
create policy "Admins read all recipe ingredients"
on public.recipe_ingredients for select to authenticated
using (public.is_petbites_admin());

drop policy if exists "Editors write recipe ingredients" on public.recipe_ingredients;
create policy "Editors write recipe ingredients"
on public.recipe_ingredients for all to authenticated
using (public.is_petbites_admin(array['owner','editor']))
with check (public.is_petbites_admin(array['owner','editor']));

drop policy if exists "Admins read all recipe steps" on public.recipe_steps;
create policy "Admins read all recipe steps"
on public.recipe_steps for select to authenticated
using (public.is_petbites_admin());

drop policy if exists "Editors write recipe steps" on public.recipe_steps;
create policy "Editors write recipe steps"
on public.recipe_steps for all to authenticated
using (public.is_petbites_admin(array['owner','editor']))
with check (public.is_petbites_admin(array['owner','editor']));

-- Grants are broad enough for the API; RLS decides which rows each role may access.
grant usage on schema public to anon, authenticated;
grant execute on function public.submit_bird_request(text, text, text, text, text, text)
  to anon, authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;
grant select, insert on public.content_audit_log to authenticated;
grant select, insert, update, delete on public.birds to authenticated;
grant select, insert, update, delete on public.bird_foods to authenticated;
grant select, insert, update, delete on public.toxic_entries to authenticated;
grant select, insert, update, delete on public.portion_rules to authenticated;
grant select, insert, update, delete on public.recipes to authenticated;
grant select, insert, update, delete on public.recipe_ingredients to authenticated;
grant select, insert, update, delete on public.recipe_steps to authenticated;
grant select, insert, update, delete on public.bird_requests to authenticated;

-- Public media bucket for CMS uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bird-media',
  'bird-media',
  true,
  6291456,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view bird media" on storage.objects;
create policy "Public can view bird media"
on storage.objects for select
to public
using (bucket_id = 'bird-media');

drop policy if exists "Admins upload bird media" on storage.objects;
create policy "Admins upload bird media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'bird-media' and public.is_petbites_admin(array['owner','editor']));

drop policy if exists "Admins update bird media" on storage.objects;
create policy "Admins update bird media"
on storage.objects for update
to authenticated
using (bucket_id = 'bird-media' and public.is_petbites_admin(array['owner','editor']))
with check (bucket_id = 'bird-media' and public.is_petbites_admin(array['owner','editor']));

drop policy if exists "Admins delete bird media" on storage.objects;
create policy "Admins delete bird media"
on storage.objects for delete
to authenticated
using (bucket_id = 'bird-media' and public.is_petbites_admin(array['owner','editor']));

commit;

-- AFTER creating an admin user in Authentication > Users, run this separately:
-- insert into public.admin_users (user_id, email, role)
-- select id, email, 'owner'
-- from auth.users
-- where email = 'EMAIL_ADMIN_KAMU'
-- on conflict (user_id) do update
-- set email = excluded.email, role = excluded.role;
