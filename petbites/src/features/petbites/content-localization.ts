export type ContentLanguage = "id" | "en";

const exactContentTranslations: Record<string, string> = {
  "Pellet formulasi burung kecil": "Formulated pellets for small birds",
  "Pellet atau crumble formulasi burung kecil": "Formulated pellets or crumble for small birds",
  "Pellet formulasi pigeon/dove": "Formulated pigeon or dove pellets",
  "Campuran biji bervariasi secara terbatas": "A limited varied seed mix",
  "Campuran biji dan serealia seimbang": "A balanced seed and grain mix",
  "Sayuran hijau segar": "Fresh leafy greens",
  "Sayuran hijau cincang": "Chopped leafy greens",
  "Brokoli atau wortel cincang halus": "Finely chopped broccoli or carrot",
  "Kacang polong atau jagung matang tanpa bumbu": "Plain cooked peas or corn",
  "Apel tanpa biji": "Seedless apple",
  Wortel: "Carrot",
  "Sayuran hijau yang aman": "Safe leafy greens",
  "Jagung matang tanpa bumbu": "Plain cooked corn",
  Alpukat: "Avocado",
  "Cokelat dan kakao": "Chocolate and cocoa",
  "Kopi, teh, dan minuman berkafein": "Coffee, tea, and caffeinated drinks",
  Alkohol: "Alcohol",
  "Bawang merah, bawang putih, dan keluarga bawang": "Onion, garlic, and related alliums",
  "Biji apel": "Apple seeds",
  "Makanan sangat asin atau olahan": "Very salty or processed foods",
  "Susu dan produk tinggi laktosa": "Milk and high-lactose dairy products",
  "Nutrisi lebih seimbang": "More balanced nutrition",
  "Membatasi seleksi biji": "Reduces selective seed eating",
  Variasi: "Variety",
  Serat: "Fiber",
  Mikronutrien: "Micronutrients",
  "Beta-karoten": "Beta-carotene",
  Energi: "Energy",
  "Vitamin dan mineral": "Vitamins and minerals",
  "Protein nabati": "Plant protein",
  Karbohidrat: "Carbohydrates",
  "Dasar diet yang lebih konsisten": "A more consistent dietary base",
  "Menu Sayur Pendamping": "Supplementary Vegetable Mix",
  "Menu Hijau Pendamping": "Supplementary Greens Mix",
  "Menu Pendamping Merpati": "Supplementary Pigeon Mix",
  "Menu Pendamping Puter": "Supplementary Ringneck Dove Mix",
  "Menu Pendamping Perkutut": "Supplementary Zebra Dove Mix",
  "Cuci bahan.": "Wash the ingredients.",
  "Cuci semua bahan.": "Wash all ingredients.",
  "Cuci sayuran.": "Wash the vegetables.",
  "Cincang kecil.": "Chop into small pieces.",
  "Cincang halus.": "Chop finely.",
  "Cincang sangat halus.": "Chop very finely.",
  "Sajikan sedikit.": "Serve a small amount.",
  "Sajikan sedikit tanpa bumbu.": "Serve a small amount without seasoning.",
  "Buang sisa setelah beberapa jam.": "Discard leftovers after a few hours.",
  "Buang sisa yang lembap.": "Discard damp leftovers.",
  "Tanpa bumbu, garam, gula, atau minyak.": "Serve without seasoning, salt, sugar, or oil.",
  "Jangan menjadikan biji sebagai satu-satunya makanan.": "Do not make seeds the bird's only food.",
  "Pilih ukuran pellet yang sesuai; air bersih harus tersedia setiap saat.":
    "Choose an appropriate pellet size and provide clean water at all times.",
  "Berikan secukupnya sebagai variasi, bukan pengganti pakan utama.":
    "Offer a modest amount for variety, not as a replacement for the staple diet.",
  "Berikan sedikit sebagai pendamping dan buang sisa segar setelah beberapa jam.":
    "Offer a small amount as a supplement and discard fresh leftovers after a few hours.",
  "Gunakan campuran berkualitas, simpan kering, dan hindari biji berjamur atau berbau tengik.":
    "Use a quality mix, store it dry, and avoid moldy or rancid-smelling seeds.",
  "Cuci bersih dan sajikan parut atau potongan kecil tanpa bumbu.":
    "Wash thoroughly and serve grated or in small, unseasoned pieces.",
  "Cuci bersih dan berikan sedikit sebagai pendamping pakan utama.":
    "Wash thoroughly and offer a small amount alongside the staple diet.",
  "Dapat diberikan sedikit sebagai variasi; bukan pengganti diet utama.":
    "May be offered in a small amount for variety; it is not a replacement for the main diet.",
  "Jangan diberikan dalam bentuk apa pun.": "Do not offer it in any form.",
  "Jangan diberikan. Kafein dapat memengaruhi jantung dan sistem saraf burung.":
    "Do not offer it. Caffeine can affect a bird's heart and nervous system.",
  "Daging apel tanpa biji dapat diberikan sedikit, tetapi bijinya harus dibuang.":
    "A small amount of seedless apple flesh may be offered, but all seeds must be removed.",
  "Burung tidak mencerna laktosa dengan baik. Jangan menjadikannya bagian rutin diet.":
    "Birds do not digest lactose well. Do not make it a regular part of the diet.",
  "Timbang pakan kering; jangan konversi tsp": "Weigh the dry food; do not convert from teaspoons.",
  "Milet Putih": "White Millet",
  "Milet Merah": "Red Millet",
  "Biji Kenari": "Canary Seed",
  Kangkung: "Water Spinach",
  "Jagung Muda": "Young Corn",
  "Apel (tanpa biji)": "Apple (seeds removed)",
  Kwaci: "Sunflower Seeds",
  "Biji Sawi": "Mustard Seeds",
  "Sawi Putih": "Chinese Cabbage",
  Timun: "Cucumber",
  "Telur Puyuh": "Quail Egg",
  "Buah Pir": "Pear",
  "Voer Halus Premium": "Premium Fine Softbill Food",
  "Voer Kasar": "Coarse Softbill Food",
  Jangkrik: "Crickets",
  Kroto: "Weaver Ant Eggs",
  "Ulat Hongkong": "Mealworms",
  "Ulat Kandang": "Lesser Mealworms",
  "Cacing Tanah": "Earthworms",
  "Belalang Hijau": "Green Grasshoppers",
  "Voer Pleci Halus": "Fine White-eye Food",
  "Pisang Kepok": "Saba Banana",
  Pepaya: "Papaya",
  "Apel Merah": "Red Apple",
  "Nektar Madu": "Honey Nectar",
  "Jeruk Manis": "Sweet Orange",
  Mineral: "Minerals",
  Protein: "Protein",
  "Lemak Sehat": "Healthy Fats",
  "Vitamin A": "Vitamin A",
  "Vitamin B": "Vitamin B",
  "Vitamin C": "Vitamin C",
  "Vitamin E": "Vitamin E",
  "Vitamin K": "Vitamin K",
  Antioksidan: "Antioxidants",
  "Omega-3": "Omega-3",
  Hidrasi: "Hydration",
  Vitamin: "Vitamins",
  "Protein Tinggi": "High Protein",
  "Vitamin Kompleks": "Vitamin Complex",
  Kitin: "Chitin",
  "Asam Amino": "Amino Acids",
  Lemak: "Fats",
  "Protein Sedang": "Moderate Protein",
  Kalsium: "Calcium",
  Kalium: "Potassium",
  "Enzim Papain": "Papain Enzyme",
  "Doping Suara": "Voice Support",
  "Protein Ringan": "Light Protein",
  Antibakteri: "Antibacterial Compounds",
  "Pakan utama harian, sekitar 60% dari total pakan.":
    "Daily staple food, about 60% of the total diet.",
  "Campurkan dengan milet putih untuk variasi.": "Mix with white millet for variety.",
  "Baik untuk birahi & warna bulu.": "Supports breeding condition and feather color.",
  "Batasi 5-10 biji per hari.": "Limit to 5–10 seeds per day.",
  "Pakan pokok kenari, 70% dari total ransum.":
    "Canary staple food, about 70% of the total ration.",
  "Doping alami untuk suara ngerol.":
    "A natural supplementary food often used to support sustained song.",
  "2-3x seminggu untuk stamina.": "Offer 2–3 times per week as a stamina-supporting supplement.",
  "Pilih voer khusus murai batu, protein min 18%.":
    "Choose food formulated for white-rumped shamas with at least 18% protein.",
  "Buang kepala & kaki. 5-10 ekor/hari.": "Remove the heads and legs. Offer 5–10 crickets per day.",
  "1 sendok teh 2-3x seminggu.": "Offer 1 teaspoon, 2–3 times per week.",
  "Batasi max 5 ekor/hari, panas.":
    "Limit to no more than 5 mealworms per day because they are energy-dense.",
  "Lebih aman dari UH, boleh harian.":
    "Generally less fatty than mealworms and may be offered in controlled daily portions.",
  "Doping suara, cuci bersih.": "Used as a supplementary protein source; wash thoroughly.",
  "Pilih voer khusus dengan protein 16-18%.":
    "Choose food formulated for white-eyes with 16–18% protein.",
  "Buah pokok pleci, ganti tiap hari.": "A common fruit for white-eyes; replace it daily.",
  "Buang biji, iris tipis.": "Remove the seeds and slice thinly.",
  "1 sdt sehari sudah cukup.": "One teaspoon per day is enough.",
  "1 tetes madu di air minum 2x seminggu.":
    "Use one drop of honey in the drinking water no more than twice per week.",
  "Peras sedikit di potongan pisang.": "Squeeze a small amount over a piece of banana.",
  Cokelat: "Chocolate",
  Bawang: "Onion and Garlic",
  Kafein: "Caffeine",
  Garam: "Salt",
  Apel: "Apple",
  Sawi: "Leafy Mustard Greens",
  "Jagung Manis": "Sweet Corn",
  Pisang: "Banana",
  Tomat: "Tomato",
  Roti: "Bread",
  "Mengandung persin yang sangat mematikan untuk burung — dapat menyebabkan gagal jantung.":
    "Contains persin, which is highly toxic to birds and can cause heart failure.",
  "Mengandung theobromine & caffeine yang beracun bagi sistem saraf burung.":
    "Contains theobromine and caffeine, which are toxic to a bird's nervous system.",
  "Bawang merah/putih merusak sel darah merah dan menyebabkan anemia.":
    "Onions and garlic can damage red blood cells and cause anemia.",
  "Kopi, teh, dan minuman berkafein memicu detak jantung tidak normal.":
    "Coffee, tea, and other caffeinated drinks can trigger an abnormal heart rate.",
  "Garam berlebih menyebabkan dehidrasi berat dan gagal ginjal.":
    "Excess salt can cause severe dehydration and kidney failure.",
  "Daging apel aman & kaya vitamin C. WAJIB buang biji karena mengandung sianida.":
    "Apple flesh is safe in small amounts, but the seeds must be removed because they contain cyanogenic compounds.",
  "Sumber serat & vitamin K yang sangat baik. Cuci bersih sebelum diberikan.":
    "A good source of fiber and vitamin K. Wash thoroughly before serving.",
  "Kaya beta-karoten untuk warna bulu cerah. Parut atau iris halus.":
    "Rich in beta-carotene. Grate or slice it finely before serving.",
  "Sumber karbohidrat & energi. Berikan segar, hindari yang berpengawet.":
    "A source of carbohydrates and energy. Serve fresh and avoid preserved products.",
  "Aman & kaya kalium. Berikan sedikit karena tinggi gula alami.":
    "Safe in small amounts and rich in potassium, but naturally high in sugar.",
  "Buah tomat matang aman. Daun & batang beracun (mengandung solanine).":
    "Ripe tomato flesh may be offered in small amounts. The leaves and stems are toxic and contain solanine.",
  "Boleh sesekali dalam jumlah kecil. Roti tawar tanpa garam & pengawet.":
    "May be offered occasionally in a very small amount; choose plain bread without added salt or preservatives.",
  "Racikan Milet & Telur Penambah Gacor": "Millet and Egg Supplement Mix",
  "Meningkatkan stamina & birahi untuk lovebird gacor":
    "A supplementary mix intended to support energy during active periods.",
  "Extra Fooding Pemulih Bulu Mabuk": "Molting Support Supplement",
  "Mempercepat pertumbuhan bulu baru saat mabung":
    "Provides extra nutrients during feather regrowth.",
  "Racikan Ngerol Kenari Juara": "Canary Song Support Mix",
  "Meningkatkan durasi & variasi suara ngerol":
    "A supplementary mix intended to support energy for sustained song.",
  "EF Booster Masa Mabung": "Molting Support Booster",
  "Nutrisi lengkap untuk pertumbuhan bulu": "Additional nutrients to support feather growth.",
  "Racikan Doping Suara Murai Juara": "Shama Song Support Mix",
  "Meningkatkan volume & variasi tembakan":
    "A protein-rich supplement intended to support condition and vocal activity.",
  "EF Pemulih Pasca Mabung": "Post-Molt Recovery Supplement",
  "Restorasi stamina & kilau bulu": "Supports energy recovery and feather condition after molting.",
  "Racikan Buka Paruh Pleci Ngalas": "White-eye Fruit and Protein Mix",
  "Merangsang pleci rajin buka paruh & ngalas":
    "A supplementary mix intended to support activity and vocal condition.",
  "Salad Buah Pleci Sehat": "Fresh Fruit Salad for White-eyes",
  "Menjaga imun & warna bulu":
    "Provides fruit variety and nutrients that support general condition.",
  "50 gr milet putih": "50 g white millet",
  "20 gr milet merah": "20 g red millet",
  "1 butir telur puyuh rebus": "1 boiled quail egg",
  "1 sdt kwaci kupas": "1 tsp shelled sunflower seeds",
  "Kangkung segar 5 lembar": "5 fresh water-spinach leaves",
  "Jagung muda 1 potong": "1 small piece of young corn",
  "Kwaci 10 biji": "10 sunflower seeds",
  "Apel tanpa biji ¼ buah": "¼ seedless apple",
  "30 gr canary seed": "30 g canary seed",
  "10 gr niger seed": "10 g niger seed",
  "1 lembar sawi putih": "1 Chinese-cabbage leaf",
  "½ butir telur puyuh": "½ quail egg",
  "Niger seed 15 gr": "15 g niger seed",
  "Telur puyuh 1 butir": "1 quail egg",
  "Timun ½ potong": "½ cucumber",
  "Buah pir kecil": "1 small pear",
  "Kroto segar 1 sdm": "1 tbsp fresh weaver-ant eggs",
  "Jangkrik 5 ekor": "5 crickets",
  "Cacing tanah 2 ekor": "2 earthworms",
  "Voer premium": "Premium softbill food",
  "Ulat kandang 1 sdm": "1 tbsp lesser mealworms",
  "Jangkrik 7 ekor": "7 crickets",
  "Kroto 1 sdt": "1 tsp weaver-ant eggs",
  "Multivitamin burung": "Bird multivitamin",
  "Pisang kepok ½ buah": "½ saba banana",
  "1 tetes madu": "1 drop of honey",
  "Voer halus": "Fine softbill food",
  "Pepaya matang ¼ potong": "¼ piece ripe papaya",
  "Apel merah ¼ potong": "¼ red apple",
  "Perasan jeruk manis": "Fresh sweet-orange juice",
  "Ulat kandang 5 ekor": "5 lesser mealworms",
  "Rebus telur puyuh hingga matang, dinginkan, kupas.":
    "Boil the quail egg until cooked, let it cool, then peel it.",
  "Cincang halus putih & kuning telur.": "Finely chop the egg white and yolk.",
  "Campurkan milet putih & merah dalam wadah.": "Mix the white and red millet in a bowl.",
  "Tambahkan telur cincang & kwaci, aduk rata.":
    "Add the chopped egg and sunflower seeds, then mix evenly.",
  "Sajikan segar, ganti sisa pakan setiap hari.": "Serve fresh and replace leftovers every day.",
  "Cuci bersih semua sayur & buah.": "Wash all fruit and vegetables thoroughly.",
  "Iris jagung dan apel kecil-kecil.": "Cut the corn and apple into small pieces.",
  "Susun kangkung di sangkar, gantung dengan jepitan.":
    "Place the water spinach in the cage and secure it with a food clip.",
  "Berikan kwaci sebagai treat pagi hari.": "Offer the sunflower seeds as a morning treat.",
  "Ganti sisa EF setiap sore.": "Replace any remaining supplementary food every evening.",
  "Campurkan canary seed & niger seed.": "Mix the canary seed and niger seed.",
  "Rebus telur puyuh, cincang halus.": "Boil the quail egg and chop it finely.",
  "Iris sawi putih tipis-tipis.": "Slice the Chinese cabbage thinly.",
  "Sajikan seed di cepuk utama, EF di cepuk terpisah.":
    "Serve the seed mix in the main dish and the supplementary food in a separate dish.",
  "Beri air minum bersih tiap pagi.": "Provide fresh drinking water every morning.",
  "Rebus telur puyuh, dinginkan.": "Boil the quail egg and let it cool.",
  "Iris timun & pir kecil-kecil.": "Cut the cucumber and pear into small pieces.",
  "Berikan niger seed sebagai boost harian.":
    "Offer a small measured amount of niger seed as the daily supplement.",
  "Sajikan telur di pagi hari 3x seminggu.": "Serve the egg in the morning, three times per week.",
  "Semprot bulu perlahan dengan air hangat.": "Mist the feathers gently with lukewarm water.",
  "Cuci kroto dengan air bersih, tiriskan.":
    "Rinse the weaver-ant eggs with clean water and drain them.",
  "Buang kepala & kaki jangkrik.": "Remove the crickets' heads and legs.",
  "Cuci cacing tanah, potong jadi 2.": "Wash the earthworms and cut them in half.",
  "Berikan kroto pagi hari sebelum dijemur.":
    "Offer the weaver-ant eggs in the morning before sunning.",
  "Selingi jangkrik & cacing sepanjang hari.":
    "Alternate measured portions of crickets and earthworms during the day.",
  "Siapkan voer segar di cepuk utama.": "Place fresh softbill food in the main dish.",
  "Berikan ulat kandang sebagai EF utama.": "Use lesser mealworms as the main supplementary food.",
  "Selingi jangkrik pagi & sore.": "Alternate crickets between the morning and evening feedings.",
  "Tambahkan multivitamin di air minum 2x seminggu.":
    "Add the multivitamin to drinking water twice per week, following the product directions.",
  "Jemur 15-30 menit pagi hari.": "Provide 15–30 minutes of gentle morning sun.",
  "Belah pisang memanjang.": "Split the banana lengthwise.",
  "Taburi kroto di atas belahan pisang.": "Sprinkle the weaver-ant eggs over the banana.",
  "Tetesi madu murni di ujung pisang.": "Place a small drop of honey on the tip of the banana.",
  "Gantung di sangkar dekat tenggeran.": "Hang it in the cage near a perch.",
  "Berikan pagi hari sebelum dijemur.": "Offer it in the morning before sunning.",
  "Potong pepaya & apel dadu kecil.": "Dice the papaya and apple into small cubes.",
  "Peras sedikit jeruk manis di atasnya.": "Squeeze a small amount of sweet orange over it.",
  "Aduk pelan agar tercampur.": "Mix gently until combined.",
  "Sajikan di cepuk EF.": "Serve it in the supplementary-food dish.",
  "Tambahkan ulat kandang di samping.": "Place the lesser mealworms alongside it.",
};

const normalizedExactContentTranslations = new Map(
  Object.entries(exactContentTranslations).map(([source, translation]) => [
    normalizeLookupKey(source),
    translation,
  ]),
);

const phraseTranslations: Array<[RegExp, string]> = [
  [/\bTimbang pakan kering\b/gi, "Weigh the dry food"],
  [/\bjangan konversi (?:dari )?tsp\b/gi, "do not convert from teaspoons"],
  [/\bsayuran diberikan terpisah\b/gi, "serve vegetables separately"],
  [/\bpakan fase reproduksi\b/gi, "breeding-formula food"],
  [/\bpantau kondisi induk\b/gi, "monitor the breeding pair's condition"],
  [/\bpakan dasar\b/gi, "staple food"],
  [/\bpakan formulasi\b/gi, "formulated food"],
  [/\bpakan utama\b/gi, "staple food"],
  [/\bsayuran hijau\b/gi, "leafy greens"],
  [/\bwortel parut\b/gi, "grated carrot"],
  [/\bbrokoli cincang\b/gi, "chopped broccoli"],
  [/\bjagung matang\b/gi, "cooked corn"],
  [/\bkacang polong matang\b/gi, "cooked peas"],
  [/\bwadah terpisah\b/gi, "a separate dish"],
  [/\bulat kandang\b/gi, "lesser mealworms"],
  [/\bulat hongkong\b/gi, "mealworms"],
  [/\bcacing tanah\b/gi, "earthworms"],
  [/\btelur puyuh\b/gi, "quail egg"],
  [/\bsawi putih\b/gi, "Chinese cabbage"],
  [/\bmilet putih\b/gi, "white millet"],
  [/\bmilet merah\b/gi, "red millet"],
  [/\bjagung muda\b/gi, "young corn"],
  [/\bapel merah\b/gi, "red apple"],
  [/\bpisang kepok\b/gi, "saba banana"],
  [/\bjeruk manis\b/gi, "sweet orange"],
  [/\bbuah pir\b/gi, "pear"],
  [/\bvoer\b/gi, "softbill food"],
  [/\bjangkrik\b/gi, "crickets"],
  [/\bkroto\b/gi, "weaver-ant eggs"],
  [/\bcacing\b/gi, "earthworms"],
  [/\bulat\b/gi, "mealworms"],
  [/\bpisang\b/gi, "banana"],
  [/\bpepaya\b/gi, "papaya"],
  [/\bapel\b/gi, "apple"],
  [/\btelur\b/gi, "egg"],
  [/\bsawi\b/gi, "Chinese cabbage"],
  [/\bkwaci\b/gi, "sunflower seeds"],
  [/\bkangkung\b/gi, "water spinach"],
  [/\bjagung\b/gi, "corn"],
  [/\btimun\b/gi, "cucumber"],
  [/\bsetiap hari\b/gi, "every day"],
  [/\bsetiap pagi\b/gi, "every morning"],
  [/\bpagi hari\b/gi, "in the morning"],
  [/\bsore hari\b/gi, "in the evening"],
  [/\bPagi\s*:/gi, "Morning:"],
  [/\bSore\s*:/gi, "Evening:"],
  [/\bsekitar\b/gi, "about"],
  [/(\d+(?:[.,]\d+)?)\s*(?:gram|gr)\b/gi, "$1 g"],
  [/(\d+(?:[.,]\d+)?)\s*sdt\b/gi, "$1 tsp"],
  [/(\d+(?:[.,]\d+)?)\s*sdm\b/gi, "$1 tbsp"],
  [/\bCuci bersih\b/gi, "Wash thoroughly"],
  [/\bCuci semua bahan\b/gi, "Wash all ingredients"],
  [/\bCuci bahan\b/gi, "Wash the ingredients"],
  [/\bCincang halus\b/gi, "Finely chop"],
  [/\bCincang kecil\b/gi, "Chop into small pieces"],
  [/\bSajikan\b/gi, "Serve"],
  [/\bBerikan\b/gi, "Offer"],
  [/\bBuang sisa\b/gi, "Discard leftovers"],
  [/\btanpa bumbu\b/gi, "without seasoning"],
];

export function formatLocalizedNumber(value: number, language: ContentLanguage) {
  if (!Number.isFinite(value)) return String(value);

  return new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function localizeContent(value: string, language: ContentLanguage) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (language === "id") return formatNumbersInText(trimmed, language);

  const normalizedSource = formatNumbersInText(trimmed, "en");
  const exact = normalizedExactContentTranslations.get(normalizeLookupKey(normalizedSource));
  if (exact) return formatNumbersInText(exact, language);

  let translated = translatePortionTemplate(normalizedSource);
  for (const [pattern, replacement] of phraseTranslations) {
    translated = translated.replace(pattern, replacement);
  }

  return formatNumbersInText(cleanSpacing(translated), language);
}

function formatNumbersInText(value: string, language: ContentLanguage) {
  return value.replace(
    /(^|[^\d:])(-?\d+[.,]\d+)(?![\d:])/g,
    (match, prefix: string, token: string) => {
      const parsed = Number(token.replace(",", "."));
      if (!Number.isFinite(parsed)) return match;
      return `${prefix}${formatLocalizedNumber(parsed, language)}`;
    },
  );
}

function translatePortionTemplate(value: string) {
  const formulatedFood = value.match(
    /^(Pagi|Sore):\s*sekitar\s*([\d.]+)\s*g\s*pakan formulasi;\s*sayuran diberikan terpisah\.?$/i,
  );
  if (formulatedFood) {
    const period = formulatedFood[1].toLocaleLowerCase("id-ID") === "pagi" ? "Morning" : "Evening";
    return `${period}: about ${formulatedFood[2]} g of formulated food; serve vegetables separately.`;
  }

  const breedingFood = value.match(
    /^(Pagi|Sore):\s*sekitar\s*([\d.]+)\s*g\s*pakan dasar\.\s*Gunakan pakan fase reproduksi dan pantau kondisi induk\.?$/i,
  );
  if (breedingFood) {
    const period = breedingFood[1].toLocaleLowerCase("id-ID") === "pagi" ? "Morning" : "Evening";
    return `${period}: about ${breedingFood[2]} g of staple food. Use breeding-formula food and monitor the breeding pair's condition.`;
  }

  return value;
}

function normalizeLookupKey(value: string) {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase("id-ID");
}

function cleanSpacing(value: string) {
  return value
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,.;:!?])(?=[A-Za-z])/g, "$1 ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
