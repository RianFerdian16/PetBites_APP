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
begin;

insert into public.app_features
  (id, label, short_label, description, icon_key, sort_order, is_active)
values
  ('food', 'Food Finder', 'Food Finder', 'Direktori makanan utama dan extra fooding.', 'search', 1, true),
  ('toxic', 'Toxic Checker', 'Toxic Check', 'Pencarian keamanan bahan makanan untuk burung.', 'alert-triangle', 2, true),
  ('portion', 'Portion Calculator', 'Porsi', 'Rekomendasi porsi berdasarkan ukuran dan kondisi burung.', 'scale', 3, true),
  ('recipe', 'DIY Recipes', 'Resep', 'Racikan dan panduan pembuatan pakan rumahan.', 'chef-hat', 4, true)
on conflict (id) do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.birds
  (id, name, emoji, image_url, scientific_name, description, sort_order, is_active, review_status, source_urls)
values
  ('lovebird', 'Lovebird', '🦜', null, 'Agapornis spp.', 'Burung sosial berukuran kecil yang dikenal dengan ikatan pasangan yang kuat dan warna bulu cerah.', 1, true, 'needs_review', array[]::text[]),
  ('kenari', 'Burung Kenari', '🐤', null, 'Serinus canaria', 'Burung penyanyi legendaris dengan suara merdu, populer untuk lomba kicau dan peliharaan rumahan.', 2, true, 'needs_review', array[]::text[]),
  ('murai', 'Murai Batu', '🕊️', null, 'Copsychus malabaricus', 'Burung kicau pemakan serangga dengan ekor panjang & suara variatif, primadona kontes kicau.', 3, true, 'needs_review', array[]::text[]),
  ('pleci', 'Pleci', '🐦', null, 'Zosterops spp.', 'Burung kacamata mungil pemakan buah & serangga, terkenal dengan buka paruh (ngalas) yang khas.', 4, true, 'needs_review', array[]::text[])
on conflict (id) do update set
  name = excluded.name,
  emoji = excluded.emoji,
  scientific_name = excluded.scientific_name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  review_status = excluded.review_status,
  source_urls = excluded.source_urls;

insert into public.bird_foods
  (id, bird_id, name, category, benefits, note, sort_order, review_status, source_urls)
values
  ('lovebird-milet-putih', 'lovebird', 'Milet Putih', 'main', array['Karbohidrat', 'Energi']::text[], 'Pakan utama harian, sekitar 60% dari total pakan.', 1, 'needs_review', array[]::text[]),
  ('lovebird-milet-merah', 'lovebird', 'Milet Merah', 'main', array['Serat', 'Mineral']::text[], 'Campurkan dengan milet putih untuk variasi.', 2, 'needs_review', array[]::text[]),
  ('lovebird-canary-seed', 'lovebird', 'Canary Seed', 'main', array['Protein', 'Lemak Sehat']::text[], null, 3, 'needs_review', array[]::text[]),
  ('lovebird-biji-kenari', 'lovebird', 'Biji Kenari', 'main', array['Omega-3', 'Protein']::text[], null, 4, 'needs_review', array[]::text[]),
  ('lovebird-kangkung', 'lovebird', 'Kangkung', 'extra', array['Vitamin A', 'Serat']::text[], 'Baik untuk birahi & warna bulu.', 5, 'needs_review', array[]::text[]),
  ('lovebird-jagung-muda', 'lovebird', 'Jagung Muda', 'extra', array['Karbohidrat', 'Vitamin B']::text[], null, 6, 'needs_review', array[]::text[]),
  ('lovebird-apel-tanpa-biji', 'lovebird', 'Apel (tanpa biji)', 'extra', array['Vitamin C', 'Antioksidan']::text[], null, 7, 'needs_review', array[]::text[]),
  ('lovebird-kwaci', 'lovebird', 'Kwaci', 'extra', array['Vitamin E', 'Lemak Sehat']::text[], 'Batasi 5-10 biji per hari.', 8, 'needs_review', array[]::text[]),
  ('kenari-canary-seed', 'kenari', 'Canary Seed', 'main', array['Protein', 'Karbohidrat']::text[], 'Pakan pokok kenari, 70% dari total ransum.', 1, 'needs_review', array[]::text[]),
  ('kenari-milet-putih', 'kenari', 'Milet Putih', 'main', array['Energi', 'Serat']::text[], null, 2, 'needs_review', array[]::text[]),
  ('kenari-niger-seed', 'kenari', 'Niger Seed', 'main', array['Omega-3', 'Vitamin E']::text[], null, 3, 'needs_review', array[]::text[]),
  ('kenari-biji-sawi', 'kenari', 'Biji Sawi', 'main', array['Mineral', 'Protein']::text[], null, 4, 'needs_review', array[]::text[]),
  ('kenari-sawi-putih', 'kenari', 'Sawi Putih', 'extra', array['Vitamin K', 'Serat']::text[], 'Doping alami untuk suara ngerol.', 5, 'needs_review', array[]::text[]),
  ('kenari-timun', 'kenari', 'Timun', 'extra', array['Hidrasi', 'Vitamin']::text[], null, 6, 'needs_review', array[]::text[]),
  ('kenari-telur-puyuh', 'kenari', 'Telur Puyuh', 'extra', array['Protein Tinggi']::text[], '2-3x seminggu untuk stamina.', 7, 'needs_review', array[]::text[]),
  ('kenari-buah-pir', 'kenari', 'Buah Pir', 'extra', array['Vitamin C', 'Serat']::text[], null, 8, 'needs_review', array[]::text[]),
  ('murai-voer-halus-premium', 'murai', 'Voer Halus Premium', 'main', array['Protein', 'Vitamin Kompleks']::text[], 'Pilih voer khusus murai batu, protein min 18%.', 1, 'needs_review', array[]::text[]),
  ('murai-voer-kasar', 'murai', 'Voer Kasar', 'main', array['Serat', 'Mineral']::text[], null, 2, 'needs_review', array[]::text[]),
  ('murai-jangkrik', 'murai', 'Jangkrik', 'extra', array['Protein Tinggi', 'Kitin']::text[], 'Buang kepala & kaki. 5-10 ekor/hari.', 3, 'needs_review', array[]::text[]),
  ('murai-kroto', 'murai', 'Kroto', 'extra', array['Protein', 'Asam Amino']::text[], '1 sendok teh 2-3x seminggu.', 4, 'needs_review', array[]::text[]),
  ('murai-ulat-hongkong', 'murai', 'Ulat Hongkong', 'extra', array['Lemak', 'Energi']::text[], 'Batasi max 5 ekor/hari, panas.', 5, 'needs_review', array[]::text[]),
  ('murai-ulat-kandang', 'murai', 'Ulat Kandang', 'extra', array['Protein Sedang']::text[], 'Lebih aman dari UH, boleh harian.', 6, 'needs_review', array[]::text[]),
  ('murai-cacing-tanah', 'murai', 'Cacing Tanah', 'extra', array['Protein', 'Mineral']::text[], 'Doping suara, cuci bersih.', 7, 'needs_review', array[]::text[]),
  ('murai-belalang-hijau', 'murai', 'Belalang Hijau', 'extra', array['Protein', 'Kalsium']::text[], null, 8, 'needs_review', array[]::text[]),
  ('pleci-voer-pleci-halus', 'pleci', 'Voer Pleci Halus', 'main', array['Protein', 'Vitamin']::text[], 'Pilih voer khusus dengan protein 16-18%.', 1, 'needs_review', array[]::text[]),
  ('pleci-pisang-kepok', 'pleci', 'Pisang Kepok', 'main', array['Kalium', 'Karbohidrat']::text[], 'Buah pokok pleci, ganti tiap hari.', 2, 'needs_review', array[]::text[]),
  ('pleci-pepaya', 'pleci', 'Pepaya', 'extra', array['Vitamin C', 'Enzim Papain']::text[], null, 3, 'needs_review', array[]::text[]),
  ('pleci-apel-merah', 'pleci', 'Apel Merah', 'extra', array['Antioksidan', 'Serat']::text[], 'Buang biji, iris tipis.', 4, 'needs_review', array[]::text[]),
  ('pleci-kroto', 'pleci', 'Kroto', 'extra', array['Protein', 'Doping Suara']::text[], '1 sdt sehari sudah cukup.', 5, 'needs_review', array[]::text[]),
  ('pleci-ulat-kandang', 'pleci', 'Ulat Kandang', 'extra', array['Protein Ringan']::text[], null, 6, 'needs_review', array[]::text[]),
  ('pleci-nektar-madu', 'pleci', 'Nektar Madu', 'extra', array['Energi', 'Antibakteri']::text[], '1 tetes madu di air minum 2x seminggu.', 7, 'needs_review', array[]::text[]),
  ('pleci-jeruk-manis', 'pleci', 'Jeruk Manis', 'extra', array['Vitamin C']::text[], 'Peras sedikit di potongan pisang.', 8, 'needs_review', array[]::text[])
on conflict (id) do update set
  bird_id = excluded.bird_id,
  name = excluded.name,
  category = excluded.category,
  benefits = excluded.benefits,
  note = excluded.note,
  sort_order = excluded.sort_order,
  review_status = excluded.review_status,
  source_urls = excluded.source_urls;

insert into public.toxic_entries
  (id, bird_id, name, status, explanation, sort_order, review_status, source_urls)
values
  ('common-alpukat', null, 'Alpukat', 'toxic', 'Mengandung persin yang sangat mematikan untuk burung — dapat menyebabkan gagal jantung.', 1, 'needs_review', array[]::text[]),
  ('common-cokelat', null, 'Cokelat', 'toxic', 'Mengandung theobromine & caffeine yang beracun bagi sistem saraf burung.', 2, 'needs_review', array[]::text[]),
  ('common-bawang', null, 'Bawang', 'toxic', 'Bawang merah/putih merusak sel darah merah dan menyebabkan anemia.', 3, 'needs_review', array[]::text[]),
  ('common-kafein', null, 'Kafein', 'toxic', 'Kopi, teh, dan minuman berkafein memicu detak jantung tidak normal.', 4, 'needs_review', array[]::text[]),
  ('common-garam', null, 'Garam', 'toxic', 'Garam berlebih menyebabkan dehidrasi berat dan gagal ginjal.', 5, 'needs_review', array[]::text[]),
  ('common-apel', null, 'Apel', 'caution', 'Daging apel aman & kaya vitamin C. WAJIB buang biji karena mengandung sianida.', 6, 'needs_review', array[]::text[]),
  ('common-sawi', null, 'Sawi', 'safe', 'Sumber serat & vitamin K yang sangat baik. Cuci bersih sebelum diberikan.', 7, 'needs_review', array[]::text[]),
  ('common-wortel', null, 'Wortel', 'safe', 'Kaya beta-karoten untuk warna bulu cerah. Parut atau iris halus.', 8, 'needs_review', array[]::text[]),
  ('common-jagung-manis', null, 'Jagung Manis', 'safe', 'Sumber karbohidrat & energi. Berikan segar, hindari yang berpengawet.', 9, 'needs_review', array[]::text[]),
  ('common-pisang', null, 'Pisang', 'safe', 'Aman & kaya kalium. Berikan sedikit karena tinggi gula alami.', 10, 'needs_review', array[]::text[]),
  ('common-tomat', null, 'Tomat', 'caution', 'Buah tomat matang aman. Daun & batang beracun (mengandung solanine).', 11, 'needs_review', array[]::text[]),
  ('common-roti', null, 'Roti', 'caution', 'Boleh sesekali dalam jumlah kecil. Roti tawar tanpa garam & pengawet.', 12, 'needs_review', array[]::text[])
on conflict (id) do update set
  bird_id = excluded.bird_id,
  name = excluded.name,
  status = excluded.status,
  explanation = excluded.explanation,
  sort_order = excluded.sort_order,
  review_status = excluded.review_status,
  source_urls = excluded.source_urls;

insert into public.portion_rules
  (id, bird_id, size, condition, grams, teaspoon, morning, evening, sort_order, review_status, source_urls)
values
  ('lovebird-kecil-harian', 'lovebird', 'Kecil', 'Harian', 8, '1.5 sdt', '07:00 - 4 gram', '17:00 - 4 gram', 11, 'needs_review', array[]::text[]),
  ('lovebird-standar-harian', 'lovebird', 'Standar', 'Harian', 10, '2 sdt', '07:00 - 5 gram', '17:00 - 5 gram', 12, 'needs_review', array[]::text[]),
  ('lovebird-besar-harian', 'lovebird', 'Besar', 'Harian', 12, '2.5 sdt', '07:00 - 6 gram', '17:00 - 6 gram', 13, 'needs_review', array[]::text[]),
  ('lovebird-kecil-mabung', 'lovebird', 'Kecil', 'Mabung', 12, '2.5 sdt', '07:00 - 6 gram + kwaci', '17:00 - 6 gram + kangkung', 21, 'needs_review', array[]::text[]),
  ('lovebird-standar-mabung', 'lovebird', 'Standar', 'Mabung', 14, '3 sdt', '07:00 - 7 gram + kwaci', '17:00 - 7 gram + kangkung', 22, 'needs_review', array[]::text[]),
  ('lovebird-besar-mabung', 'lovebird', 'Besar', 'Mabung', 16, '3.5 sdt', '07:00 - 8 gram + kwaci', '17:00 - 8 gram + kangkung', 23, 'needs_review', array[]::text[]),
  ('lovebird-kecil-ternak', 'lovebird', 'Kecil', 'Ternak', 14, '3 sdt', '07:00 - 7 gram + telur', '17:00 - 7 gram + jagung', 31, 'needs_review', array[]::text[]),
  ('lovebird-standar-ternak', 'lovebird', 'Standar', 'Ternak', 16, '3.5 sdt', '07:00 - 8 gram + telur', '17:00 - 8 gram + jagung', 32, 'needs_review', array[]::text[]),
  ('lovebird-besar-ternak', 'lovebird', 'Besar', 'Ternak', 18, '4 sdt', '07:00 - 9 gram + telur', '17:00 - 9 gram + jagung', 33, 'needs_review', array[]::text[]),
  ('kenari-kecil-harian', 'kenari', 'Kecil', 'Harian', 5, '1 sdt', '07:00 - 2.5 gram', '17:00 - 2.5 gram', 11, 'needs_review', array[]::text[]),
  ('kenari-standar-harian', 'kenari', 'Standar', 'Harian', 6, '1.2 sdt', '07:00 - 3 gram', '17:00 - 3 gram', 12, 'needs_review', array[]::text[]),
  ('kenari-besar-harian', 'kenari', 'Besar', 'Harian', 8, '1.5 sdt', '07:00 - 4 gram', '17:00 - 4 gram', 13, 'needs_review', array[]::text[]),
  ('kenari-kecil-mabung', 'kenari', 'Kecil', 'Mabung', 7, '1.5 sdt', '07:00 - 3.5 gram + niger', '17:00 - 3.5 gram + sawi', 21, 'needs_review', array[]::text[]),
  ('kenari-standar-mabung', 'kenari', 'Standar', 'Mabung', 9, '2 sdt', '07:00 - 4.5 gram + niger', '17:00 - 4.5 gram + sawi', 22, 'needs_review', array[]::text[]),
  ('kenari-besar-mabung', 'kenari', 'Besar', 'Mabung', 11, '2.2 sdt', '07:00 - 5.5 gram + niger', '17:00 - 5.5 gram + sawi', 23, 'needs_review', array[]::text[]),
  ('kenari-kecil-ternak', 'kenari', 'Kecil', 'Ternak', 9, '2 sdt', '07:00 - 4.5 gram + telur', '17:00 - 4.5 gram + sawi', 31, 'needs_review', array[]::text[]),
  ('kenari-standar-ternak', 'kenari', 'Standar', 'Ternak', 11, '2.2 sdt', '07:00 - 5.5 gram + telur', '17:00 - 5.5 gram + sawi', 32, 'needs_review', array[]::text[]),
  ('kenari-besar-ternak', 'kenari', 'Besar', 'Ternak', 13, '2.6 sdt', '07:00 - 6.5 gram + telur', '17:00 - 6.5 gram + sawi', 33, 'needs_review', array[]::text[]),
  ('murai-kecil-harian', 'murai', 'Kecil', 'Harian', 15, '3 sdt voer', '07:00 - Voer + 3 jangkrik', '17:00 - Voer + 3 jangkrik', 11, 'needs_review', array[]::text[]),
  ('murai-standar-harian', 'murai', 'Standar', 'Harian', 18, '3.5 sdt voer', '07:00 - Voer + 5 jangkrik', '17:00 - Voer + 5 jangkrik', 12, 'needs_review', array[]::text[]),
  ('murai-besar-harian', 'murai', 'Besar', 'Harian', 22, '4 sdt voer', '07:00 - Voer + 7 jangkrik', '17:00 - Voer + 7 jangkrik', 13, 'needs_review', array[]::text[]),
  ('murai-kecil-mabung', 'murai', 'Kecil', 'Mabung', 18, '3.5 sdt voer', '07:00 - Voer + kroto 1sdt', '17:00 - Voer + ulat kandang', 21, 'needs_review', array[]::text[]),
  ('murai-standar-mabung', 'murai', 'Standar', 'Mabung', 22, '4 sdt voer', '07:00 - Voer + kroto 1sdt', '17:00 - Voer + ulat kandang', 22, 'needs_review', array[]::text[]),
  ('murai-besar-mabung', 'murai', 'Besar', 'Mabung', 26, '5 sdt voer', '07:00 - Voer + kroto 1.5sdt', '17:00 - Voer + ulat kandang', 23, 'needs_review', array[]::text[]),
  ('murai-kecil-ternak', 'murai', 'Kecil', 'Ternak', 22, '4 sdt voer', '07:00 - Voer + 10 jangkrik + kroto', '17:00 - Voer + cacing', 31, 'needs_review', array[]::text[]),
  ('murai-standar-ternak', 'murai', 'Standar', 'Ternak', 26, '5 sdt voer', '07:00 - Voer + 12 jangkrik + kroto', '17:00 - Voer + cacing', 32, 'needs_review', array[]::text[]),
  ('murai-besar-ternak', 'murai', 'Besar', 'Ternak', 30, '6 sdt voer', '07:00 - Voer + 15 jangkrik + kroto', '17:00 - Voer + cacing', 33, 'needs_review', array[]::text[]),
  ('pleci-kecil-harian', 'pleci', 'Kecil', 'Harian', 4, '0.8 sdt', '07:00 - Voer + pisang', '17:00 - Voer + pepaya', 11, 'needs_review', array[]::text[]),
  ('pleci-standar-harian', 'pleci', 'Standar', 'Harian', 5, '1 sdt', '07:00 - Voer + pisang', '17:00 - Voer + apel', 12, 'needs_review', array[]::text[]),
  ('pleci-besar-harian', 'pleci', 'Besar', 'Harian', 6, '1.2 sdt', '07:00 - Voer + pisang', '17:00 - Voer + pepaya', 13, 'needs_review', array[]::text[]),
  ('pleci-kecil-mabung', 'pleci', 'Kecil', 'Mabung', 5, '1 sdt', '07:00 - Kroto 1sdt + pisang', '17:00 - Voer + apel', 21, 'needs_review', array[]::text[]),
  ('pleci-standar-mabung', 'pleci', 'Standar', 'Mabung', 6, '1.2 sdt', '07:00 - Kroto 1sdt + pisang', '17:00 - Voer + pepaya', 22, 'needs_review', array[]::text[]),
  ('pleci-besar-mabung', 'pleci', 'Besar', 'Mabung', 7, '1.4 sdt', '07:00 - Kroto 1.5sdt + pisang', '17:00 - Voer + pepaya', 23, 'needs_review', array[]::text[]),
  ('pleci-kecil-ternak', 'pleci', 'Kecil', 'Ternak', 6, '1.2 sdt', '07:00 - Kroto + pisang + telur', '17:00 - Voer + apel + ulat', 31, 'needs_review', array[]::text[]),
  ('pleci-standar-ternak', 'pleci', 'Standar', 'Ternak', 7, '1.4 sdt', '07:00 - Kroto + pisang + telur', '17:00 - Voer + apel + ulat', 32, 'needs_review', array[]::text[]),
  ('pleci-besar-ternak', 'pleci', 'Besar', 'Ternak', 8, '1.6 sdt', '07:00 - Kroto + pisang + telur', '17:00 - Voer + apel + ulat', 33, 'needs_review', array[]::text[])
on conflict (id) do update set
  bird_id = excluded.bird_id,
  size = excluded.size,
  condition = excluded.condition,
  grams = excluded.grams,
  teaspoon = excluded.teaspoon,
  morning = excluded.morning,
  evening = excluded.evening,
  sort_order = excluded.sort_order,
  review_status = excluded.review_status,
  source_urls = excluded.source_urls;

insert into public.recipes
  (id, bird_id, title, purpose, sort_order, review_status, source_urls)
values
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 'lovebird', 'Racikan Milet & Telur Penambah Gacor', 'Meningkatkan stamina & birahi untuk lovebird gacor', 1, 'needs_review', array[]::text[]),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 'lovebird', 'Extra Fooding Pemulih Bulu Mabuk', 'Mempercepat pertumbuhan bulu baru saat mabung', 2, 'needs_review', array[]::text[]),
  ('kenari-racikan-ngerol-kenari-juara', 'kenari', 'Racikan Ngerol Kenari Juara', 'Meningkatkan durasi & variasi suara ngerol', 1, 'needs_review', array[]::text[]),
  ('kenari-ef-booster-masa-mabung', 'kenari', 'EF Booster Masa Mabung', 'Nutrisi lengkap untuk pertumbuhan bulu', 2, 'needs_review', array[]::text[]),
  ('murai-racikan-doping-suara-murai-juara', 'murai', 'Racikan Doping Suara Murai Juara', 'Meningkatkan volume & variasi tembakan', 1, 'needs_review', array[]::text[]),
  ('murai-ef-pemulih-pasca-mabung', 'murai', 'EF Pemulih Pasca Mabung', 'Restorasi stamina & kilau bulu', 2, 'needs_review', array[]::text[]),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 'pleci', 'Racikan Buka Paruh Pleci Ngalas', 'Merangsang pleci rajin buka paruh & ngalas', 1, 'needs_review', array[]::text[]),
  ('pleci-salad-buah-pleci-sehat', 'pleci', 'Salad Buah Pleci Sehat', 'Menjaga imun & warna bulu', 2, 'needs_review', array[]::text[])
on conflict (id) do update set
  bird_id = excluded.bird_id,
  title = excluded.title,
  purpose = excluded.purpose,
  sort_order = excluded.sort_order,
  review_status = excluded.review_status,
  source_urls = excluded.source_urls;

insert into public.recipe_ingredients
  (recipe_id, sort_order, ingredient)
values
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 1, '50 gr milet putih'),
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 2, '20 gr milet merah'),
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 3, '1 butir telur puyuh rebus'),
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 4, '1 sdt kwaci kupas'),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 1, 'Kangkung segar 5 lembar'),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 2, 'Jagung muda 1 potong'),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 3, 'Kwaci 10 biji'),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 4, 'Apel tanpa biji ¼ buah'),
  ('kenari-racikan-ngerol-kenari-juara', 1, '30 gr canary seed'),
  ('kenari-racikan-ngerol-kenari-juara', 2, '10 gr niger seed'),
  ('kenari-racikan-ngerol-kenari-juara', 3, '1 lembar sawi putih'),
  ('kenari-racikan-ngerol-kenari-juara', 4, '½ butir telur puyuh'),
  ('kenari-ef-booster-masa-mabung', 1, 'Niger seed 15 gr'),
  ('kenari-ef-booster-masa-mabung', 2, 'Telur puyuh 1 butir'),
  ('kenari-ef-booster-masa-mabung', 3, 'Timun ½ potong'),
  ('kenari-ef-booster-masa-mabung', 4, 'Buah pir kecil'),
  ('murai-racikan-doping-suara-murai-juara', 1, 'Kroto segar 1 sdm'),
  ('murai-racikan-doping-suara-murai-juara', 2, 'Jangkrik 5 ekor'),
  ('murai-racikan-doping-suara-murai-juara', 3, 'Cacing tanah 2 ekor'),
  ('murai-racikan-doping-suara-murai-juara', 4, 'Voer premium'),
  ('murai-ef-pemulih-pasca-mabung', 1, 'Ulat kandang 1 sdm'),
  ('murai-ef-pemulih-pasca-mabung', 2, 'Jangkrik 7 ekor'),
  ('murai-ef-pemulih-pasca-mabung', 3, 'Kroto 1 sdt'),
  ('murai-ef-pemulih-pasca-mabung', 4, 'Multivitamin burung'),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 1, 'Pisang kepok ½ buah'),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 2, 'Kroto 1 sdt'),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 3, '1 tetes madu'),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 4, 'Voer halus'),
  ('pleci-salad-buah-pleci-sehat', 1, 'Pepaya matang ¼ potong'),
  ('pleci-salad-buah-pleci-sehat', 2, 'Apel merah ¼ potong'),
  ('pleci-salad-buah-pleci-sehat', 3, 'Perasan jeruk manis'),
  ('pleci-salad-buah-pleci-sehat', 4, 'Ulat kandang 5 ekor')
on conflict (recipe_id, sort_order) do update set
  ingredient = excluded.ingredient;

insert into public.recipe_steps
  (recipe_id, sort_order, instruction)
values
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 1, 'Rebus telur puyuh hingga matang, dinginkan, kupas.'),
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 2, 'Cincang halus putih & kuning telur.'),
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 3, 'Campurkan milet putih & merah dalam wadah.'),
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 4, 'Tambahkan telur cincang & kwaci, aduk rata.'),
  ('lovebird-racikan-milet-dan-telur-penambah-gacor', 5, 'Sajikan segar, ganti sisa pakan setiap hari.'),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 1, 'Cuci bersih semua sayur & buah.'),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 2, 'Iris jagung dan apel kecil-kecil.'),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 3, 'Susun kangkung di sangkar, gantung dengan jepitan.'),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 4, 'Berikan kwaci sebagai treat pagi hari.'),
  ('lovebird-extra-fooding-pemulih-bulu-mabuk', 5, 'Ganti sisa EF setiap sore.'),
  ('kenari-racikan-ngerol-kenari-juara', 1, 'Campurkan canary seed & niger seed.'),
  ('kenari-racikan-ngerol-kenari-juara', 2, 'Rebus telur puyuh, cincang halus.'),
  ('kenari-racikan-ngerol-kenari-juara', 3, 'Iris sawi putih tipis-tipis.'),
  ('kenari-racikan-ngerol-kenari-juara', 4, 'Sajikan seed di cepuk utama, EF di cepuk terpisah.'),
  ('kenari-racikan-ngerol-kenari-juara', 5, 'Beri air minum bersih tiap pagi.'),
  ('kenari-ef-booster-masa-mabung', 1, 'Rebus telur puyuh, dinginkan.'),
  ('kenari-ef-booster-masa-mabung', 2, 'Iris timun & pir kecil-kecil.'),
  ('kenari-ef-booster-masa-mabung', 3, 'Berikan niger seed sebagai boost harian.'),
  ('kenari-ef-booster-masa-mabung', 4, 'Sajikan telur di pagi hari 3x seminggu.'),
  ('kenari-ef-booster-masa-mabung', 5, 'Semprot bulu perlahan dengan air hangat.'),
  ('murai-racikan-doping-suara-murai-juara', 1, 'Cuci kroto dengan air bersih, tiriskan.'),
  ('murai-racikan-doping-suara-murai-juara', 2, 'Buang kepala & kaki jangkrik.'),
  ('murai-racikan-doping-suara-murai-juara', 3, 'Cuci cacing tanah, potong jadi 2.'),
  ('murai-racikan-doping-suara-murai-juara', 4, 'Berikan kroto pagi hari sebelum dijemur.'),
  ('murai-racikan-doping-suara-murai-juara', 5, 'Selingi jangkrik & cacing sepanjang hari.'),
  ('murai-ef-pemulih-pasca-mabung', 1, 'Siapkan voer segar di cepuk utama.'),
  ('murai-ef-pemulih-pasca-mabung', 2, 'Berikan ulat kandang sebagai EF utama.'),
  ('murai-ef-pemulih-pasca-mabung', 3, 'Selingi jangkrik pagi & sore.'),
  ('murai-ef-pemulih-pasca-mabung', 4, 'Tambahkan multivitamin di air minum 2x seminggu.'),
  ('murai-ef-pemulih-pasca-mabung', 5, 'Jemur 15-30 menit pagi hari.'),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 1, 'Belah pisang memanjang.'),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 2, 'Taburi kroto di atas belahan pisang.'),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 3, 'Tetesi madu murni di ujung pisang.'),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 4, 'Gantung di sangkar dekat tenggeran.'),
  ('pleci-racikan-buka-paruh-pleci-ngalas', 5, 'Berikan pagi hari sebelum dijemur.'),
  ('pleci-salad-buah-pleci-sehat', 1, 'Potong pepaya & apel dadu kecil.'),
  ('pleci-salad-buah-pleci-sehat', 2, 'Peras sedikit jeruk manis di atasnya.'),
  ('pleci-salad-buah-pleci-sehat', 3, 'Aduk pelan agar tercampur.'),
  ('pleci-salad-buah-pleci-sehat', 4, 'Sajikan di cepuk EF.'),
  ('pleci-salad-buah-pleci-sehat', 5, 'Tambahkan ulat kandang di samping.')
on conflict (recipe_id, sort_order) do update set
  instruction = excluded.instruction;


commit;
