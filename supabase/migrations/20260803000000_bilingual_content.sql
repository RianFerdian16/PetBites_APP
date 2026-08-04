-- Database-backed bilingual content for PetBites.
-- Existing known content is backfilled; unknown content remains editable as draft/review.

begin;

alter table public.birds
  add column if not exists name_en text,
  add column if not exists description_en text;

alter table public.bird_foods
  add column if not exists name_en text,
  add column if not exists benefits_en text[],
  add column if not exists note_en text;

alter table public.toxic_entries
  add column if not exists name_en text,
  add column if not exists explanation_en text;

alter table public.portion_rules
  add column if not exists teaspoon_en text,
  add column if not exists morning_en text,
  add column if not exists evening_en text;

alter table public.recipes
  add column if not exists title_en text,
  add column if not exists purpose_en text;

alter table public.recipe_ingredients
  add column if not exists ingredient_en text;

alter table public.recipe_steps
  add column if not exists instruction_en text;

create or replace function public.petbites_known_english(source_text text)
returns text
language plpgsql
immutable
strict
as $$
declare
  cleaned text := btrim(source_text);
  matched text[];
begin
  case cleaned
    when 'Pakan formulasi untuk paruh bengkok kecil' then return 'Formulated food for small hookbills';
    when 'formulated food untuk paruh bengkok kecil' then return 'Formulated food for small hookbills';
    when 'Nutrisi lebih konsisten' then return 'More consistent nutrition';
    when 'Mengurangi pilih-pilih biji' then return 'Reduces selective seed eating';
    when 'Gunakan pellet atau crumble sesuai ukuran paruh. Lakukan transisi bertahap.' then return 'Use pellets or crumble sized appropriately for the bird''s beak. Transition gradually.';
    when 'Sayuran hijau yang dicuci bersih' then return 'Washed leafy greens';
    when 'leafy greens yang dicuci bersih' then return 'Washed leafy greens';
    when 'Potong kecil, berikan tanpa bumbu, dan buang sisa setelah maksimal 2 jam.' then return 'Chop into small pieces, serve without seasoning, and discard leftovers after no more than 2 hours.';
    when 'Cut kecil, Offer without seasoning, dan Discard leftovers setelah maksimal 2 jam.' then return 'Chop into small pieces, serve without seasoning, and discard leftovers after no more than 2 hours.';
    when 'Wortel, brokoli, atau labu' then return 'Carrot, broccoli, or pumpkin';
    when 'Sajikan tanpa garam, minyak, gula, dan bumbu.' then return 'Serve without salt, oil, sugar, or seasoning.';
    when 'Serve tanpa garam, minyak, gula, dan bumbu.' then return 'Serve without salt, oil, sugar, or seasoning.';
    when 'Buah rendah gula dalam porsi kecil' then return 'Low-sugar fruit in small portions';
    when 'Contoh pepaya, pir tanpa biji, atau melon. Bukan dasar diet.' then return 'For example, papaya, seedless pear, or melon. Do not use it as a dietary staple.';
    when 'Campuran biji berkualitas secara terbatas' then return 'A limited amount of a quality seed mix';
    when 'Pellet formulasi burung kecil' then return 'Formulated pellets for small birds';
    when 'Pellet atau crumble formulasi burung kecil' then return 'Formulated pellets or crumble for small birds';
    when 'Pellet formulasi pigeon/dove' then return 'Formulated pigeon or dove pellets';
    when 'Campuran biji bervariasi secara terbatas' then return 'A limited varied seed mix';
    when 'Campuran biji dan serealia seimbang' then return 'A balanced seed and grain mix';
    when 'Sayuran hijau segar' then return 'Fresh leafy greens';
    when 'Sayuran hijau cincang' then return 'Chopped leafy greens';
    when 'Brokoli atau wortel cincang halus' then return 'Finely chopped broccoli or carrot';
    when 'Kacang polong atau jagung matang tanpa bumbu' then return 'Plain cooked peas or corn';
    when 'Apel tanpa biji' then return 'Seedless apple';
    when 'Wortel' then return 'Carrot';
    when 'Sayuran hijau yang aman' then return 'Safe leafy greens';
    when 'Jagung matang tanpa bumbu' then return 'Plain cooked corn';
    when 'Alpukat' then return 'Avocado';
    when 'Cokelat dan kakao' then return 'Chocolate and cocoa';
    when 'Kopi, teh, dan minuman berkafein' then return 'Coffee, tea, and caffeinated drinks';
    when 'Alkohol' then return 'Alcohol';
    when 'Bawang merah, bawang putih, dan keluarga bawang' then return 'Onion, garlic, and related alliums';
    when 'Biji apel' then return 'Apple seeds';
    when 'Makanan sangat asin atau olahan' then return 'Very salty or processed foods';
    when 'Susu dan produk tinggi laktosa' then return 'Milk and high-lactose dairy products';
    when 'Nutrisi lebih seimbang' then return 'More balanced nutrition';
    when 'Membatasi seleksi biji' then return 'Reduces selective seed eating';
    when 'Variasi' then return 'Variety';
    when 'Serat' then return 'Fiber';
    when 'Mikronutrien' then return 'Micronutrients';
    when 'Beta-karoten' then return 'Beta-carotene';
    when 'Energi' then return 'Energy';
    when 'Vitamin dan mineral' then return 'Vitamins and minerals';
    when 'Protein nabati' then return 'Plant protein';
    when 'Karbohidrat' then return 'Carbohydrates';
    when 'Dasar diet yang lebih konsisten' then return 'A more consistent dietary base';
    when 'Menu Sayur Pendamping' then return 'Supplementary Vegetable Mix';
    when 'Menu Hijau Pendamping' then return 'Supplementary Greens Mix';
    when 'Menu Pendamping Merpati' then return 'Supplementary Pigeon Mix';
    when 'Menu Pendamping Puter' then return 'Supplementary Ringneck Dove Mix';
    when 'Menu Pendamping Perkutut' then return 'Supplementary Zebra Dove Mix';
    when 'Cuci bahan.' then return 'Wash the ingredients.';
    when 'Cuci semua bahan.' then return 'Wash all ingredients.';
    when 'Cuci sayuran.' then return 'Wash the vegetables.';
    when 'Cincang kecil.' then return 'Chop into small pieces.';
    when 'Cincang halus.' then return 'Chop finely.';
    when 'Cincang sangat halus.' then return 'Chop very finely.';
    when 'Sajikan sedikit.' then return 'Serve a small amount.';
    when 'Sajikan sedikit tanpa bumbu.' then return 'Serve a small amount without seasoning.';
    when 'Buang sisa setelah beberapa jam.' then return 'Discard leftovers after a few hours.';
    when 'Buang sisa yang lembap.' then return 'Discard damp leftovers.';
    when 'Tanpa bumbu, garam, gula, atau minyak.' then return 'Serve without seasoning, salt, sugar, or oil.';
    when 'Jangan menjadikan biji sebagai satu-satunya makanan.' then return 'Do not make seeds the bird''s only food.';
    when 'Pilih ukuran pellet yang sesuai; air bersih harus tersedia setiap saat.' then return 'Choose an appropriate pellet size and provide clean water at all times.';
    when 'Berikan secukupnya sebagai variasi, bukan pengganti pakan utama.' then return 'Offer a modest amount for variety, not as a replacement for the staple diet.';
    when 'Berikan sedikit sebagai pendamping dan buang sisa segar setelah beberapa jam.' then return 'Offer a small amount as a supplement and discard fresh leftovers after a few hours.';
    when 'Gunakan campuran berkualitas, simpan kering, dan hindari biji berjamur atau berbau tengik.' then return 'Use a quality mix, store it dry, and avoid moldy or rancid-smelling seeds.';
    when 'Cuci bersih dan sajikan parut atau potongan kecil tanpa bumbu.' then return 'Wash thoroughly and serve grated or in small, unseasoned pieces.';
    when 'Cuci bersih dan berikan sedikit sebagai pendamping pakan utama.' then return 'Wash thoroughly and offer a small amount alongside the staple diet.';
    when 'Dapat diberikan sedikit sebagai variasi; bukan pengganti diet utama.' then return 'May be offered in a small amount for variety; it is not a replacement for the main diet.';
    when 'Jangan diberikan dalam bentuk apa pun.' then return 'Do not offer it in any form.';
    when 'Jangan diberikan. Kafein dapat memengaruhi jantung dan sistem saraf burung.' then return 'Do not offer it. Caffeine can affect a bird''s heart and nervous system.';
    when 'Daging apel tanpa biji dapat diberikan sedikit, tetapi bijinya harus dibuang.' then return 'A small amount of seedless apple flesh may be offered, but all seeds must be removed.';
    when 'Burung tidak mencerna laktosa dengan baik. Jangan menjadikannya bagian rutin diet.' then return 'Birds do not digest lactose well. Do not make it a regular part of the diet.';
    when 'Timbang pakan kering; jangan konversi tsp' then return 'Weigh the dry food; do not convert from teaspoons.';
    when 'Milet Putih' then return 'White Millet';
    when 'Milet Merah' then return 'Red Millet';
    when 'Biji Kenari' then return 'Canary Seed';
    when 'Kangkung' then return 'Water Spinach';
    when 'Jagung Muda' then return 'Young Corn';
    when 'Apel (tanpa biji)' then return 'Apple (seeds removed)';
    when 'Kwaci' then return 'Sunflower Seeds';
    when 'Biji Sawi' then return 'Mustard Seeds';
    when 'Sawi Putih' then return 'Chinese Cabbage';
    when 'Timun' then return 'Cucumber';
    when 'Telur Puyuh' then return 'Quail Egg';
    when 'Buah Pir' then return 'Pear';
    when 'Voer Halus Premium' then return 'Premium Fine Softbill Food';
    when 'Voer Kasar' then return 'Coarse Softbill Food';
    when 'Jangkrik' then return 'Crickets';
    when 'Kroto' then return 'Weaver Ant Eggs';
    when 'Ulat Hongkong' then return 'Mealworms';
    when 'Ulat Kandang' then return 'Lesser Mealworms';
    when 'Cacing Tanah' then return 'Earthworms';
    when 'Belalang Hijau' then return 'Green Grasshoppers';
    when 'Voer Pleci Halus' then return 'Fine White-eye Food';
    when 'Pisang Kepok' then return 'Saba Banana';
    when 'Pepaya' then return 'Papaya';
    when 'Apel Merah' then return 'Red Apple';
    when 'Nektar Madu' then return 'Honey Nectar';
    when 'Jeruk Manis' then return 'Sweet Orange';
    when 'Mineral' then return 'Minerals';
    when 'Protein' then return 'Protein';
    when 'Lemak Sehat' then return 'Healthy Fats';
    when 'Vitamin A' then return 'Vitamin A';
    when 'Vitamin B' then return 'Vitamin B';
    when 'Vitamin C' then return 'Vitamin C';
    when 'Vitamin E' then return 'Vitamin E';
    when 'Vitamin K' then return 'Vitamin K';
    when 'Antioksidan' then return 'Antioxidants';
    when 'Omega-3' then return 'Omega-3';
    when 'Hidrasi' then return 'Hydration';
    when 'Vitamin' then return 'Vitamins';
    when 'Protein Tinggi' then return 'High Protein';
    when 'Vitamin Kompleks' then return 'Vitamin Complex';
    when 'Kitin' then return 'Chitin';
    when 'Asam Amino' then return 'Amino Acids';
    when 'Lemak' then return 'Fats';
    when 'Protein Sedang' then return 'Moderate Protein';
    when 'Kalsium' then return 'Calcium';
    when 'Kalium' then return 'Potassium';
    when 'Enzim Papain' then return 'Papain Enzyme';
    when 'Doping Suara' then return 'Voice Support';
    when 'Protein Ringan' then return 'Light Protein';
    when 'Antibakteri' then return 'Antibacterial Compounds';
    when 'Pakan utama harian, sekitar 60% dari total pakan.' then return 'Daily staple food, about 60% of the total diet.';
    when 'Campurkan dengan milet putih untuk variasi.' then return 'Mix with white millet for variety.';
    when 'Baik untuk birahi & warna bulu.' then return 'Supports breeding condition and feather color.';
    when 'Batasi 5-10 biji per hari.' then return 'Limit to 5–10 seeds per day.';
    when 'Pakan pokok kenari, 70% dari total ransum.' then return 'Canary staple food, about 70% of the total ration.';
    when 'Doping alami untuk suara ngerol.' then return 'A natural supplementary food often used to support sustained song.';
    when '2-3x seminggu untuk stamina.' then return 'Offer 2–3 times per week as a stamina-supporting supplement.';
    when 'Pilih voer khusus murai batu, protein min 18%.' then return 'Choose food formulated for white-rumped shamas with at least 18% protein.';
    when 'Buang kepala & kaki. 5-10 ekor/hari.' then return 'Remove the heads and legs. Offer 5–10 crickets per day.';
    when '1 sendok teh 2-3x seminggu.' then return 'Offer 1 teaspoon, 2–3 times per week.';
    when 'Batasi max 5 ekor/hari, panas.' then return 'Limit to no more than 5 mealworms per day because they are energy-dense.';
    when 'Lebih aman dari UH, boleh harian.' then return 'Generally less fatty than mealworms and may be offered in controlled daily portions.';
    when 'Doping suara, cuci bersih.' then return 'Used as a supplementary protein source; wash thoroughly.';
    when 'Pilih voer khusus dengan protein 16-18%.' then return 'Choose food formulated for white-eyes with 16–18% protein.';
    when 'Buah pokok pleci, ganti tiap hari.' then return 'A common fruit for white-eyes; replace it daily.';
    when 'Buang biji, iris tipis.' then return 'Remove the seeds and slice thinly.';
    when '1 sdt sehari sudah cukup.' then return 'One teaspoon per day is enough.';
    when '1 tetes madu di air minum 2x seminggu.' then return 'Use one drop of honey in the drinking water no more than twice per week.';
    when 'Peras sedikit di potongan pisang.' then return 'Squeeze a small amount over a piece of banana.';
    when 'Cokelat' then return 'Chocolate';
    when 'Bawang' then return 'Onion and Garlic';
    when 'Kafein' then return 'Caffeine';
    when 'Garam' then return 'Salt';
    when 'Apel' then return 'Apple';
    when 'Sawi' then return 'Leafy Mustard Greens';
    when 'Jagung Manis' then return 'Sweet Corn';
    when 'Pisang' then return 'Banana';
    when 'Tomat' then return 'Tomato';
    when 'Roti' then return 'Bread';
    when 'Mengandung persin yang sangat mematikan untuk burung — dapat menyebabkan gagal jantung.' then return 'Contains persin, which is highly toxic to birds and can cause heart failure.';
    when 'Mengandung theobromine & caffeine yang beracun bagi sistem saraf burung.' then return 'Contains theobromine and caffeine, which are toxic to a bird''s nervous system.';
    when 'Bawang merah/putih merusak sel darah merah dan menyebabkan anemia.' then return 'Onions and garlic can damage red blood cells and cause anemia.';
    when 'Kopi, teh, dan minuman berkafein memicu detak jantung tidak normal.' then return 'Coffee, tea, and other caffeinated drinks can trigger an abnormal heart rate.';
    when 'Garam berlebih menyebabkan dehidrasi berat dan gagal ginjal.' then return 'Excess salt can cause severe dehydration and kidney failure.';
    when 'Daging apel aman & kaya vitamin C. WAJIB buang biji karena mengandung sianida.' then return 'Apple flesh is safe in small amounts, but the seeds must be removed because they contain cyanogenic compounds.';
    when 'Sumber serat & vitamin K yang sangat baik. Cuci bersih sebelum diberikan.' then return 'A good source of fiber and vitamin K. Wash thoroughly before serving.';
    when 'Kaya beta-karoten untuk warna bulu cerah. Parut atau iris halus.' then return 'Rich in beta-carotene. Grate or slice it finely before serving.';
    when 'Sumber karbohidrat & energi. Berikan segar, hindari yang berpengawet.' then return 'A source of carbohydrates and energy. Serve fresh and avoid preserved products.';
    when 'Aman & kaya kalium. Berikan sedikit karena tinggi gula alami.' then return 'Safe in small amounts and rich in potassium, but naturally high in sugar.';
    when 'Buah tomat matang aman. Daun & batang beracun (mengandung solanine).' then return 'Ripe tomato flesh may be offered in small amounts. The leaves and stems are toxic and contain solanine.';
    when 'Boleh sesekali dalam jumlah kecil. Roti tawar tanpa garam & pengawet.' then return 'May be offered occasionally in a very small amount; choose plain bread without added salt or preservatives.';
    when 'Racikan Milet & Telur Penambah Gacor' then return 'Millet and Egg Supplement Mix';
    when 'Meningkatkan stamina & birahi untuk lovebird gacor' then return 'A supplementary mix intended to support energy during active periods.';
    when 'Extra Fooding Pemulih Bulu Mabuk' then return 'Molting Support Supplement';
    when 'Mempercepat pertumbuhan bulu baru saat mabung' then return 'Provides extra nutrients during feather regrowth.';
    when 'Racikan Ngerol Kenari Juara' then return 'Canary Song Support Mix';
    when 'Meningkatkan durasi & variasi suara ngerol' then return 'A supplementary mix intended to support energy for sustained song.';
    when 'EF Booster Masa Mabung' then return 'Molting Support Booster';
    when 'Nutrisi lengkap untuk pertumbuhan bulu' then return 'Additional nutrients to support feather growth.';
    when 'Racikan Doping Suara Murai Juara' then return 'Shama Song Support Mix';
    when 'Meningkatkan volume & variasi tembakan' then return 'A protein-rich supplement intended to support condition and vocal activity.';
    when 'EF Pemulih Pasca Mabung' then return 'Post-Molt Recovery Supplement';
    when 'Restorasi stamina & kilau bulu' then return 'Supports energy recovery and feather condition after molting.';
    when 'Racikan Buka Paruh Pleci Ngalas' then return 'White-eye Fruit and Protein Mix';
    when 'Merangsang pleci rajin buka paruh & ngalas' then return 'A supplementary mix intended to support activity and vocal condition.';
    when 'Salad Buah Pleci Sehat' then return 'Fresh Fruit Salad for White-eyes';
    when 'Menjaga imun & warna bulu' then return 'Provides fruit variety and nutrients that support general condition.';
    when '50 gr milet putih' then return '50 g white millet';
    when '20 gr milet merah' then return '20 g red millet';
    when '1 butir telur puyuh rebus' then return '1 boiled quail egg';
    when '1 sdt kwaci kupas' then return '1 tsp shelled sunflower seeds';
    when 'Kangkung segar 5 lembar' then return '5 fresh water-spinach leaves';
    when 'Jagung muda 1 potong' then return '1 small piece of young corn';
    when 'Kwaci 10 biji' then return '10 sunflower seeds';
    when 'Apel tanpa biji ¼ buah' then return '¼ seedless apple';
    when '30 gr canary seed' then return '30 g canary seed';
    when '10 gr niger seed' then return '10 g niger seed';
    when '1 lembar sawi putih' then return '1 Chinese-cabbage leaf';
    when '½ butir telur puyuh' then return '½ quail egg';
    when 'Niger seed 15 gr' then return '15 g niger seed';
    when 'Telur puyuh 1 butir' then return '1 quail egg';
    when 'Timun ½ potong' then return '½ cucumber';
    when 'Buah pir kecil' then return '1 small pear';
    when 'Kroto segar 1 sdm' then return '1 tbsp fresh weaver-ant eggs';
    when 'Jangkrik 5 ekor' then return '5 crickets';
    when 'Cacing tanah 2 ekor' then return '2 earthworms';
    when 'Voer premium' then return 'Premium softbill food';
    when 'Ulat kandang 1 sdm' then return '1 tbsp lesser mealworms';
    when 'Jangkrik 7 ekor' then return '7 crickets';
    when 'Kroto 1 sdt' then return '1 tsp weaver-ant eggs';
    when 'Multivitamin burung' then return 'Bird multivitamin';
    when 'Pisang kepok ½ buah' then return '½ saba banana';
    when '1 tetes madu' then return '1 drop of honey';
    when 'Voer halus' then return 'Fine softbill food';
    when 'Pepaya matang ¼ potong' then return '¼ piece ripe papaya';
    when 'Apel merah ¼ potong' then return '¼ red apple';
    when 'Perasan jeruk manis' then return 'Fresh sweet-orange juice';
    when 'Ulat kandang 5 ekor' then return '5 lesser mealworms';
    when 'Rebus telur puyuh hingga matang, dinginkan, kupas.' then return 'Boil the quail egg until cooked, let it cool, then peel it.';
    when 'Cincang halus putih & kuning telur.' then return 'Finely chop the egg white and yolk.';
    when 'Campurkan milet putih & merah dalam wadah.' then return 'Mix the white and red millet in a bowl.';
    when 'Tambahkan telur cincang & kwaci, aduk rata.' then return 'Add the chopped egg and sunflower seeds, then mix evenly.';
    when 'Sajikan segar, ganti sisa pakan setiap hari.' then return 'Serve fresh and replace leftovers every day.';
    when 'Cuci bersih semua sayur & buah.' then return 'Wash all fruit and vegetables thoroughly.';
    when 'Iris jagung dan apel kecil-kecil.' then return 'Cut the corn and apple into small pieces.';
    when 'Susun kangkung di sangkar, gantung dengan jepitan.' then return 'Place the water spinach in the cage and secure it with a food clip.';
    when 'Berikan kwaci sebagai treat pagi hari.' then return 'Offer the sunflower seeds as a morning treat.';
    when 'Ganti sisa EF setiap sore.' then return 'Replace any remaining supplementary food every evening.';
    when 'Campurkan canary seed & niger seed.' then return 'Mix the canary seed and niger seed.';
    when 'Rebus telur puyuh, cincang halus.' then return 'Boil the quail egg and chop it finely.';
    when 'Iris sawi putih tipis-tipis.' then return 'Slice the Chinese cabbage thinly.';
    when 'Sajikan seed di cepuk utama, EF di cepuk terpisah.' then return 'Serve the seed mix in the main dish and the supplementary food in a separate dish.';
    when 'Beri air minum bersih tiap pagi.' then return 'Provide fresh drinking water every morning.';
    when 'Rebus telur puyuh, dinginkan.' then return 'Boil the quail egg and let it cool.';
    when 'Iris timun & pir kecil-kecil.' then return 'Cut the cucumber and pear into small pieces.';
    when 'Berikan niger seed sebagai boost harian.' then return 'Offer a small measured amount of niger seed as the daily supplement.';
    when 'Sajikan telur di pagi hari 3x seminggu.' then return 'Serve the egg in the morning, three times per week.';
    when 'Semprot bulu perlahan dengan air hangat.' then return 'Mist the feathers gently with lukewarm water.';
    when 'Cuci kroto dengan air bersih, tiriskan.' then return 'Rinse the weaver-ant eggs with clean water and drain them.';
    when 'Buang kepala & kaki jangkrik.' then return 'Remove the crickets'' heads and legs.';
    when 'Cuci cacing tanah, potong jadi 2.' then return 'Wash the earthworms and cut them in half.';
    when 'Berikan kroto pagi hari sebelum dijemur.' then return 'Offer the weaver-ant eggs in the morning before sunning.';
    when 'Selingi jangkrik & cacing sepanjang hari.' then return 'Alternate measured portions of crickets and earthworms during the day.';
    when 'Siapkan voer segar di cepuk utama.' then return 'Place fresh softbill food in the main dish.';
    when 'Berikan ulat kandang sebagai EF utama.' then return 'Use lesser mealworms as the main supplementary food.';
    when 'Selingi jangkrik pagi & sore.' then return 'Alternate crickets between the morning and evening feedings.';
    when 'Tambahkan multivitamin di air minum 2x seminggu.' then return 'Add the multivitamin to drinking water twice per week, following the product directions.';
    when 'Jemur 15-30 menit pagi hari.' then return 'Provide 15–30 minutes of gentle morning sun.';
    when 'Belah pisang memanjang.' then return 'Split the banana lengthwise.';
    when 'Taburi kroto di atas belahan pisang.' then return 'Sprinkle the weaver-ant eggs over the banana.';
    when 'Tetesi madu murni di ujung pisang.' then return 'Place a small drop of honey on the tip of the banana.';
    when 'Gantung di sangkar dekat tenggeran.' then return 'Hang it in the cage near a perch.';
    when 'Berikan pagi hari sebelum dijemur.' then return 'Offer it in the morning before sunning.';
    when 'Potong pepaya & apel dadu kecil.' then return 'Dice the papaya and apple into small cubes.';
    when 'Peras sedikit jeruk manis di atasnya.' then return 'Squeeze a small amount of sweet orange over it.';
    when 'Aduk pelan agar tercampur.' then return 'Mix gently until combined.';
    when 'Sajikan di cepuk EF.' then return 'Serve it in the supplementary-food dish.';
    when 'Tambahkan ulat kandang di samping.' then return 'Place the lesser mealworms alongside it.';
    else null;
  end case;

  matched := regexp_match(cleaned, '^(Pagi|Sore):\s*sekitar\s*([0-9]+(?:[.,][0-9]+)?)\s*g\s*pakan formulasi;\s*sayuran diberikan terpisah\.?$', 'i');
  if matched is not null then
    return (case when lower(matched[1]) = 'pagi' then 'Morning' else 'Evening' end)
      || ': about ' || replace(matched[2], ',', '.')
      || ' g of formulated food; serve vegetables separately.';
  end if;

  matched := regexp_match(cleaned, '^(Pagi|Sore):\s*sekitar\s*([0-9]+(?:[.,][0-9]+)?)\s*g\s*pakan dasar\.\s*Gunakan pakan fase reproduksi dan pantau kondisi induk\.?$', 'i');
  if matched is not null then
    return (case when lower(matched[1]) = 'pagi' then 'Morning' else 'Evening' end)
      || ': about ' || replace(matched[2], ',', '.')
      || ' g of staple food. Use breeding-formula food and monitor the breeding pair''s condition.';
  end if;

  return null;
end;
$$;

update public.birds set name_en = 'Peach-faced Lovebird' where id = 'lovebird' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Domestic Canary' where id = 'kenari' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Budgerigar' where id = 'parkit' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Cockatiel' where id = 'cockatiel' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Zebra Finch' where id = 'zebra-finch' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Society / Bengalese Finch' where id = 'society-finch' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Domestic Pigeon' where id = 'merpati-domestik' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Ringneck Dove' where id = 'puter' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Zebra Dove' where id = 'perkutut' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'White-rumped Shama' where id = 'murai' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'White-eye' where id = 'pleci' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Oriental Magpie-Robin' where id = 'kacer' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Greater Green Leafbird' where id = 'cucak-ijo' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Long-tailed Shrike' where id = 'cendet' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Orange-headed Thrush' where id = 'anis-merah' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Asian Pied Starling' where id = 'jalak-suren' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Yellow-vented Bulbul' where id = 'trucukan' and nullif(btrim(name_en), '') is null;
update public.birds set name_en = 'Australasian Bushlark' where id = 'branjangan' and nullif(btrim(name_en), '') is null;
update public.birds set description_en = 'A small, social, and active parrot. Use captive-bred birds and make formulated food the foundation, with fresh vegetables and limited seeds.' where id = 'lovebird' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A popular domestic songbird for homes and competitions. A seed-only diet is incomplete; use formulated canary food with limited seeds and leafy greens.' where id = 'kenari' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A small, intelligent, and social bird commonly kept as a pet. Budgie pellets should form the base, supported by vegetables and limited seeds.' where id = 'parkit' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A friendly, active, medium-sized parrot. Cockatiel pellets should form the base, with fresh vegetables and seeds as a smaller part of the diet.' where id = 'cockatiel' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A small, active finch suited to pairs or groups. Prioritize formulated finch food, leafy greens, and limited seeds.' where id = 'zebra-finch' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A calm and social domestic finch. Formulated finch food, leafy greens, and limited seeds are safer than a seed-only diet.' where id = 'society-finch' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'Includes domestic, racing, homing, high-flying, and fancy pigeons as uses or breeds of the domestic pigeon.' where id = 'merpati-domestik' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A domestic dove known for its repetitive call and relatively simple care. Use balanced dove or pigeon food and a suitable seed mix.' where id = 'puter' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A small dove popular as a companion and song-competition bird. Its staple diet should be formulated dove or pigeon food or a balanced seed mix.' where id = 'perkutut' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'An insect-eating songbird that needs a varied, protein-rich diet and careful monitoring of body condition.' where id = 'murai' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A market name used for several white-eye species. Fruit, suitable softbill food, and controlled insect portions are commonly used.' where id = 'pleci' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'An active insect-eating songbird. Use quality softbill food as a base with controlled live-food portions.' where id = 'kacer' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A fruit- and insect-eating leafbird that benefits from fresh fruit, appropriate softbill food, and controlled insects.' where id = 'cucak-ijo' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'An insect-eating shrike with high protein needs. Keep portions controlled and vary suitable insects and formulated food.' where id = 'cendet' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A softbill songbird that eats fruit and insects. Fresh fruit, suitable softbill food, and varied protein sources are important.' where id = 'anis-merah' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'An omnivorous starling that needs balanced formulated food, fruit, vegetables, and controlled animal protein.' where id = 'jalak-suren' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A fruit- and insect-eating bulbul. Offer fresh fruit, suitable softbill food, and insects in measured portions.' where id = 'trucukan' and nullif(btrim(description_en), '') is null;
update public.birds set description_en = 'A ground-dwelling songbird that eats seeds and insects. Use a balanced mix with controlled protein and fresh water.' where id = 'branjangan' and nullif(btrim(description_en), '') is null;

update public.bird_foods
set name_en = public.petbites_known_english(name)
where nullif(btrim(name_en), '') is null
  and public.petbites_known_english(name) is not null;

update public.bird_foods
set note_en = public.petbites_known_english(note)
where note is not null
  and nullif(btrim(note_en), '') is null
  and public.petbites_known_english(note) is not null;

update public.bird_foods
set benefits_en = (
  select array_agg(public.petbites_known_english(item) order by ordinal)
  from unnest(benefits) with ordinality as source(item, ordinal)
)
where (benefits_en is null or cardinality(benefits_en) = 0)
  and not exists (
    select 1
    from unnest(benefits) as source(item)
    where public.petbites_known_english(item) is null
  );

update public.toxic_entries
set name_en = public.petbites_known_english(name)
where nullif(btrim(name_en), '') is null
  and public.petbites_known_english(name) is not null;

update public.toxic_entries
set explanation_en = public.petbites_known_english(explanation)
where nullif(btrim(explanation_en), '') is null
  and public.petbites_known_english(explanation) is not null;

update public.portion_rules
set teaspoon_en = public.petbites_known_english(teaspoon)
where nullif(btrim(teaspoon_en), '') is null
  and public.petbites_known_english(teaspoon) is not null;

update public.portion_rules
set morning_en = public.petbites_known_english(morning)
where nullif(btrim(morning_en), '') is null
  and public.petbites_known_english(morning) is not null;

update public.portion_rules
set evening_en = public.petbites_known_english(evening)
where nullif(btrim(evening_en), '') is null
  and public.petbites_known_english(evening) is not null;

update public.recipes
set title_en = public.petbites_known_english(title)
where nullif(btrim(title_en), '') is null
  and public.petbites_known_english(title) is not null;

update public.recipes
set purpose_en = public.petbites_known_english(purpose)
where nullif(btrim(purpose_en), '') is null
  and public.petbites_known_english(purpose) is not null;

update public.recipe_ingredients
set ingredient_en = public.petbites_known_english(ingredient)
where nullif(btrim(ingredient_en), '') is null
  and public.petbites_known_english(ingredient) is not null;

update public.recipe_steps
set instruction_en = public.petbites_known_english(instruction)
where nullif(btrim(instruction_en), '') is null
  and public.petbites_known_english(instruction) is not null;

drop function public.petbites_known_english(text);

-- NOT VALID keeps legacy rows deployable while enforcing the rule for every new or edited row.
alter table public.birds drop constraint if exists birds_published_english_complete;
alter table public.birds add constraint birds_published_english_complete check (
  content_status <> 'published'
  or (nullif(btrim(name_en), '') is not null and nullif(btrim(description_en), '') is not null)
) not valid;

alter table public.bird_foods drop constraint if exists bird_foods_published_english_complete;
alter table public.bird_foods add constraint bird_foods_published_english_complete check (
  content_status <> 'published'
  or (
    nullif(btrim(name_en), '') is not null
    and benefits_en is not null
    and cardinality(benefits_en) = cardinality(benefits)
    and array_position(benefits_en, '') is null
    and (nullif(btrim(note), '') is null or nullif(btrim(note_en), '') is not null)
  )
) not valid;

alter table public.toxic_entries drop constraint if exists toxic_entries_published_english_complete;
alter table public.toxic_entries add constraint toxic_entries_published_english_complete check (
  content_status <> 'published'
  or (nullif(btrim(name_en), '') is not null and nullif(btrim(explanation_en), '') is not null)
) not valid;

alter table public.portion_rules drop constraint if exists portion_rules_published_english_complete;
alter table public.portion_rules add constraint portion_rules_published_english_complete check (
  content_status <> 'published'
  or (
    nullif(btrim(teaspoon_en), '') is not null
    and nullif(btrim(morning_en), '') is not null
    and nullif(btrim(evening_en), '') is not null
  )
) not valid;

alter table public.recipes drop constraint if exists recipes_published_english_complete;
alter table public.recipes add constraint recipes_published_english_complete check (
  content_status <> 'published'
  or (nullif(btrim(title_en), '') is not null and nullif(btrim(purpose_en), '') is not null)
) not valid;

create or replace function public.enforce_published_recipe_english()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.content_status = 'published' then
    if nullif(btrim(new.title_en), '') is null or nullif(btrim(new.purpose_en), '') is null then
      raise exception 'English title and purpose are required for a published recipe.';
    end if;
    if not exists (
      select 1 from public.recipe_ingredients where recipe_id = new.id
    ) then
      raise exception 'A published recipe must contain at least one ingredient.';
    end if;
    if exists (
      select 1 from public.recipe_ingredients
      where recipe_id = new.id and nullif(btrim(ingredient_en), '') is null
    ) then
      raise exception 'Every ingredient needs English text before publishing.';
    end if;
    if not exists (
      select 1 from public.recipe_steps where recipe_id = new.id
    ) then
      raise exception 'A published recipe must contain at least one instruction step.';
    end if;
    if exists (
      select 1 from public.recipe_steps
      where recipe_id = new.id and nullif(btrim(instruction_en), '') is null
    ) then
      raise exception 'Every instruction needs English text before publishing.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists recipes_require_complete_english on public.recipes;
create trigger recipes_require_complete_english
before insert or update of content_status, title_en, purpose_en on public.recipes
for each row execute function public.enforce_published_recipe_english();

create or replace function public.enforce_published_recipe_line_english()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (
    select 1 from public.recipes
    where id = new.recipe_id and content_status = 'published'
  ) then
    if tg_table_name = 'recipe_ingredients' and nullif(btrim(new.ingredient_en), '') is null then
      raise exception 'English ingredient is required for a published recipe.';
    end if;
    if tg_table_name = 'recipe_steps' and nullif(btrim(new.instruction_en), '') is null then
      raise exception 'English instruction is required for a published recipe.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists recipe_ingredients_require_english on public.recipe_ingredients;
create trigger recipe_ingredients_require_english
before insert or update on public.recipe_ingredients
for each row execute function public.enforce_published_recipe_line_english();

drop trigger if exists recipe_steps_require_english on public.recipe_steps;
create trigger recipe_steps_require_english
before insert or update on public.recipe_steps
for each row execute function public.enforce_published_recipe_line_english();

-- Keep published recipes valid even when child rows are deleted or moved directly.
create or replace function public.recheck_published_recipe_after_line_change()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  affected_recipe_id text := old.recipe_id;
begin
  if exists (
    select 1 from public.recipes
    where id = affected_recipe_id and content_status = 'published'
  ) then
    if tg_table_name = 'recipe_ingredients' then
      if not exists (
        select 1 from public.recipe_ingredients where recipe_id = affected_recipe_id
      ) or exists (
        select 1 from public.recipe_ingredients
        where recipe_id = affected_recipe_id and nullif(btrim(ingredient_en), '') is null
      ) then
        raise exception 'Resep Published wajib memiliki semua bahan dalam bahasa Indonesia dan English.';
      end if;
    end if;

    if tg_table_name = 'recipe_steps' then
      if not exists (
        select 1 from public.recipe_steps where recipe_id = affected_recipe_id
      ) or exists (
        select 1 from public.recipe_steps
        where recipe_id = affected_recipe_id and nullif(btrim(instruction_en), '') is null
      ) then
        raise exception 'Resep Published wajib memiliki semua langkah dalam bahasa Indonesia dan English.';
      end if;
    end if;
  end if;

  return null;
end;
$$;

drop trigger if exists recipe_ingredients_recheck_after_change on public.recipe_ingredients;
create constraint trigger recipe_ingredients_recheck_after_change
after delete or update on public.recipe_ingredients
deferrable initially deferred
for each row execute function public.recheck_published_recipe_after_line_change();

drop trigger if exists recipe_steps_recheck_after_change on public.recipe_steps;
create constraint trigger recipe_steps_recheck_after_change
after delete or update on public.recipe_steps
deferrable initially deferred
for each row execute function public.recheck_published_recipe_after_line_change();

-- A bird may be published only when every public dashboard section is ready in both languages.
create or replace function public.enforce_bird_dashboard_ready()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.content_status <> 'published' then
    return new;
  end if;

  if nullif(btrim(new.name_en), '') is null or nullif(btrim(new.description_en), '') is null then
    raise exception 'Lengkapi nama dan deskripsi English sebelum burung dipublikasikan.';
  end if;

  if not exists (
    select 1
    from public.bird_foods
    where bird_id = new.id
      and content_status = 'published'
      and nullif(btrim(name_en), '') is not null
      and benefits_en is not null
      and cardinality(benefits_en) = cardinality(benefits)
      and (nullif(btrim(note), '') is null or nullif(btrim(note_en), '') is not null)
  ) then
    raise exception 'Tambahkan minimal satu pakan Published yang lengkap dalam Indonesia dan English.';
  end if;

  if exists (
    select 1
    from public.bird_foods
    where bird_id = new.id
      and content_status = 'published'
      and (
        nullif(btrim(name_en), '') is null
        or benefits_en is null
        or cardinality(benefits_en) <> cardinality(benefits)
        or exists (select 1 from unnest(benefits_en) item where nullif(btrim(item), '') is null)
        or (nullif(btrim(note), '') is not null and nullif(btrim(note_en), '') is null)
      )
  ) then
    raise exception 'Masih ada pakan Published yang versi English-nya belum lengkap.';
  end if;

  if not exists (
    select 1
    from public.portion_rules
    where bird_id = new.id
      and content_status = 'published'
      and nullif(btrim(teaspoon_en), '') is not null
      and nullif(btrim(morning_en), '') is not null
      and nullif(btrim(evening_en), '') is not null
  ) then
    raise exception 'Tambahkan minimal satu aturan porsi Published yang lengkap dalam English.';
  end if;

  if exists (
    select 1
    from public.portion_rules
    where bird_id = new.id
      and content_status = 'published'
      and (
        nullif(btrim(teaspoon_en), '') is null
        or nullif(btrim(morning_en), '') is null
        or nullif(btrim(evening_en), '') is null
      )
  ) then
    raise exception 'Masih ada aturan porsi Published yang versi English-nya belum lengkap.';
  end if;

  if not exists (
    select 1
    from public.toxic_entries
    where content_status = 'published'
      and (bird_id is null or bird_id = new.id)
      and nullif(btrim(name_en), '') is not null
      and nullif(btrim(explanation_en), '') is not null
  ) then
    raise exception 'Safety belum memiliki data Published yang lengkap dalam English.';
  end if;

  if exists (
    select 1
    from public.toxic_entries
    where content_status = 'published'
      and (bird_id is null or bird_id = new.id)
      and (nullif(btrim(name_en), '') is null or nullif(btrim(explanation_en), '') is null)
  ) then
    raise exception 'Masih ada data Safety Published yang versi English-nya belum lengkap.';
  end if;

  if not exists (
    select 1
    from public.recipes recipe
    where recipe.bird_id = new.id
      and recipe.content_status = 'published'
      and nullif(btrim(recipe.title_en), '') is not null
      and nullif(btrim(recipe.purpose_en), '') is not null
      and exists (
        select 1 from public.recipe_ingredients ingredient where ingredient.recipe_id = recipe.id
      )
      and not exists (
        select 1 from public.recipe_ingredients ingredient
        where ingredient.recipe_id = recipe.id and nullif(btrim(ingredient.ingredient_en), '') is null
      )
      and exists (
        select 1 from public.recipe_steps step where step.recipe_id = recipe.id
      )
      and not exists (
        select 1 from public.recipe_steps step
        where step.recipe_id = recipe.id and nullif(btrim(step.instruction_en), '') is null
      )
  ) then
    raise exception 'Tambahkan minimal satu resep Published yang lengkap dalam Indonesia dan English.';
  end if;

  return new;
end;
$$;

drop trigger if exists birds_require_complete_dashboard on public.birds;
create trigger birds_require_complete_dashboard
before insert or update of content_status, name_en, description_en on public.birds
for each row execute function public.enforce_bird_dashboard_ready();

commit;
