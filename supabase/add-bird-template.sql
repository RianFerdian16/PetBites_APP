-- Template penambahan burung baru.
-- Ganti semua nilai contoh sebelum dijalankan di Supabase SQL Editor.

begin;

insert into public.birds (
  id, name, emoji, image_url, scientific_name, description,
  sort_order, is_active, review_status, source_urls
) values (
  'cucak-ijo',
  'Cucak Ijo',
  '🐦',
  null,
  'Chloropsis sonnerati',
  'Isi deskripsi singkat yang sudah diverifikasi.',
  5,
  true,
  'needs_review',
  array[]::text[]
)
on conflict (id) do update set
  name = excluded.name,
  emoji = excluded.emoji,
  image_url = excluded.image_url,
  scientific_name = excluded.scientific_name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  review_status = excluded.review_status,
  source_urls = excluded.source_urls;

insert into public.bird_foods (
  id, bird_id, name, category, benefits, note,
  sort_order, review_status, source_urls
) values
  (
    'cucak-ijo-voer-premium', 'cucak-ijo', 'Voer Premium', 'main',
    array['Protein', 'Vitamin']::text[],
    'Isi catatan porsi atau frekuensi.',
    1, 'needs_review', array[]::text[]
  ),
  (
    'cucak-ijo-pisang-kepok', 'cucak-ijo', 'Pisang Kepok', 'extra',
    array['Kalium', 'Karbohidrat']::text[],
    'Isi catatan persiapan dan batas pemberian.',
    2, 'needs_review', array[]::text[]
  )
on conflict (id) do update set
  bird_id = excluded.bird_id,
  name = excluded.name,
  category = excluded.category,
  benefits = excluded.benefits,
  note = excluded.note,
  sort_order = excluded.sort_order,
  review_status = excluded.review_status,
  source_urls = excluded.source_urls;

-- Toxic Checker memakai data umum dengan bird_id = null.
-- Tambahkan baris khusus hanya apabila status atau penjelasannya berbeda untuk burung ini.
insert into public.toxic_entries (
  id, bird_id, name, status, explanation,
  sort_order, review_status, source_urls
) values (
  'cucak-ijo-contoh-bahan',
  'cucak-ijo',
  'Contoh Bahan',
  'caution',
  'Isi penjelasan yang sudah diverifikasi.',
  100,
  'needs_review',
  array[]::text[]
)
on conflict (id) do update set
  bird_id = excluded.bird_id,
  name = excluded.name,
  status = excluded.status,
  explanation = excluded.explanation,
  sort_order = excluded.sort_order,
  review_status = excluded.review_status,
  source_urls = excluded.source_urls;

insert into public.portion_rules (
  id, bird_id, size, condition, grams, teaspoon,
  morning, evening, sort_order, review_status, source_urls
) values
  ('cucak-ijo-kecil-harian', 'cucak-ijo', 'Kecil', 'Harian', 10, '2 sdt', '07:00 - 5 gram', '17:00 - 5 gram', 11, 'needs_review', array[]::text[]),
  ('cucak-ijo-standar-harian', 'cucak-ijo', 'Standar', 'Harian', 12, '2.5 sdt', '07:00 - 6 gram', '17:00 - 6 gram', 12, 'needs_review', array[]::text[]),
  ('cucak-ijo-besar-harian', 'cucak-ijo', 'Besar', 'Harian', 14, '3 sdt', '07:00 - 7 gram', '17:00 - 7 gram', 13, 'needs_review', array[]::text[])
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

insert into public.recipes (
  id, bird_id, title, purpose, sort_order, review_status, source_urls
) values (
  'cucak-ijo-resep-contoh',
  'cucak-ijo',
  'Resep Contoh Cucak Ijo',
  'Isi tujuan resep.',
  1,
  'needs_review',
  array[]::text[]
)
on conflict (id) do update set
  bird_id = excluded.bird_id,
  title = excluded.title,
  purpose = excluded.purpose,
  sort_order = excluded.sort_order,
  review_status = excluded.review_status,
  source_urls = excluded.source_urls;

insert into public.recipe_ingredients (recipe_id, sort_order, ingredient) values
  ('cucak-ijo-resep-contoh', 1, 'Bahan pertama'),
  ('cucak-ijo-resep-contoh', 2, 'Bahan kedua')
on conflict (recipe_id, sort_order) do update set ingredient = excluded.ingredient;

insert into public.recipe_steps (recipe_id, sort_order, instruction) values
  ('cucak-ijo-resep-contoh', 1, 'Langkah pertama.'),
  ('cucak-ijo-resep-contoh', 2, 'Langkah kedua.')
on conflict (recipe_id, sort_order) do update set instruction = excluded.instruction;

commit;
