export type Safety = "safe" | "caution" | "toxic";

export interface FoodItem {
  name: string;
  category: "main" | "extra";
  benefits: string[];
  note?: string;
}

export interface ToxicEntry {
  name: string;
  status: Safety;
  explanation: string;
}

export interface PortionData {
  size: "Kecil" | "Standar" | "Besar";
  condition: "Harian" | "Mabuk" | "Ternak";
  grams: number;
  teaspoon: string;
  morning: string;
  evening: string;
}

export interface Recipe {
  title: string;
  purpose: string;
  ingredients: string[];
  steps: string[];
}

export interface Bird {
  id: string;
  name: string;
  emoji: string;
  scientific: string;
  description: string;
  foods: FoodItem[];
  toxic: ToxicEntry[];
  portions: PortionData[];
  recipes: Recipe[];
}

const commonToxic: ToxicEntry[] = [
  { name: "Alpukat", status: "toxic", explanation: "Mengandung persin yang sangat mematikan untuk burung — dapat menyebabkan gagal jantung." },
  { name: "Cokelat", status: "toxic", explanation: "Mengandung theobromine & caffeine yang beracun bagi sistem saraf burung." },
  { name: "Bawang", status: "toxic", explanation: "Bawang merah/putih merusak sel darah merah dan menyebabkan anemia." },
  { name: "Kafein", status: "toxic", explanation: "Kopi, teh, dan minuman berkafein memicu detak jantung tidak normal." },
  { name: "Garam", status: "toxic", explanation: "Garam berlebih menyebabkan dehidrasi berat dan gagal ginjal." },
  { name: "Apel", status: "caution", explanation: "Daging apel aman & kaya vitamin C. WAJIB buang biji karena mengandung sianida." },
  { name: "Sawi", status: "safe", explanation: "Sumber serat & vitamin K yang sangat baik. Cuci bersih sebelum diberikan." },
  { name: "Wortel", status: "safe", explanation: "Kaya beta-karoten untuk warna bulu cerah. Parut atau iris halus." },
  { name: "Jagung Manis", status: "safe", explanation: "Sumber karbohidrat & energi. Berikan segar, hindari yang berpengawet." },
  { name: "Pisang", status: "safe", explanation: "Aman & kaya kalium. Berikan sedikit karena tinggi gula alami." },
  { name: "Tomat", status: "caution", explanation: "Buah tomat matang aman. Daun & batang beracun (mengandung solanine)." },
  { name: "Roti", status: "caution", explanation: "Boleh sesekali dalam jumlah kecil. Roti tawar tanpa garam & pengawet." },
];

export const birdsData: Bird[] = [
  {
    id: "lovebird",
    name: "Lovebird",
    emoji: "🦜",
    scientific: "Agapornis spp.",
    description: "Burung sosial berukuran kecil yang dikenal dengan ikatan pasangan yang kuat dan warna bulu cerah.",
    foods: [
      { name: "Milet Putih", category: "main", benefits: ["Karbohidrat", "Energi"], note: "Pakan utama harian, sekitar 60% dari total pakan." },
      { name: "Milet Merah", category: "main", benefits: ["Serat", "Mineral"], note: "Campurkan dengan milet putih untuk variasi." },
      { name: "Canary Seed", category: "main", benefits: ["Protein", "Lemak Sehat"] },
      { name: "Biji Kenari", category: "main", benefits: ["Omega-3", "Protein"] },
      { name: "Kangkung", category: "extra", benefits: ["Vitamin A", "Serat"], note: "Baik untuk birahi & warna bulu." },
      { name: "Jagung Muda", category: "extra", benefits: ["Karbohidrat", "Vitamin B"] },
      { name: "Apel (tanpa biji)", category: "extra", benefits: ["Vitamin C", "Antioksidan"] },
      { name: "Kwaci", category: "extra", benefits: ["Vitamin E", "Lemak Sehat"], note: "Batasi 5-10 biji per hari." },
    ],
    toxic: commonToxic,
    portions: [
      { size: "Kecil", condition: "Harian", grams: 8, teaspoon: "1.5 sdt", morning: "07:00 - 4 gram", evening: "17:00 - 4 gram" },
      { size: "Standar", condition: "Harian", grams: 10, teaspoon: "2 sdt", morning: "07:00 - 5 gram", evening: "17:00 - 5 gram" },
      { size: "Besar", condition: "Harian", grams: 12, teaspoon: "2.5 sdt", morning: "07:00 - 6 gram", evening: "17:00 - 6 gram" },
      { size: "Kecil", condition: "Mabuk", grams: 12, teaspoon: "2.5 sdt", morning: "07:00 - 6 gram + kwaci", evening: "17:00 - 6 gram + kangkung" },
      { size: "Standar", condition: "Mabuk", grams: 14, teaspoon: "3 sdt", morning: "07:00 - 7 gram + kwaci", evening: "17:00 - 7 gram + kangkung" },
      { size: "Besar", condition: "Mabuk", grams: 16, teaspoon: "3.5 sdt", morning: "07:00 - 8 gram + kwaci", evening: "17:00 - 8 gram + kangkung" },
      { size: "Kecil", condition: "Ternak", grams: 14, teaspoon: "3 sdt", morning: "07:00 - 7 gram + telur", evening: "17:00 - 7 gram + jagung" },
      { size: "Standar", condition: "Ternak", grams: 16, teaspoon: "3.5 sdt", morning: "07:00 - 8 gram + telur", evening: "17:00 - 8 gram + jagung" },
      { size: "Besar", condition: "Ternak", grams: 18, teaspoon: "4 sdt", morning: "07:00 - 9 gram + telur", evening: "17:00 - 9 gram + jagung" },
    ],
    recipes: [
      {
        title: "Racikan Milet & Telur Penambah Gacor",
        purpose: "Meningkatkan stamina & birahi untuk lovebird gacor",
        ingredients: ["50 gr milet putih", "20 gr milet merah", "1 butir telur puyuh rebus", "1 sdt kwaci kupas"],
        steps: [
          "Rebus telur puyuh hingga matang, dinginkan, kupas.",
          "Cincang halus putih & kuning telur.",
          "Campurkan milet putih & merah dalam wadah.",
          "Tambahkan telur cincang & kwaci, aduk rata.",
          "Sajikan segar, ganti sisa pakan setiap hari.",
        ],
      },
      {
        title: "Extra Fooding Pemulih Bulu Mabuk",
        purpose: "Mempercepat pertumbuhan bulu baru saat mabung",
        ingredients: ["Kangkung segar 5 lembar", "Jagung muda 1 potong", "Kwaci 10 biji", "Apel tanpa biji ¼ buah"],
        steps: [
          "Cuci bersih semua sayur & buah.",
          "Iris jagung dan apel kecil-kecil.",
          "Susun kangkung di sangkar, gantung dengan jepitan.",
          "Berikan kwaci sebagai treat pagi hari.",
          "Ganti sisa EF setiap sore.",
        ],
      },
    ],
  },
  {
    id: "kenari",
    name: "Burung Kenari",
    emoji: "🐤",
    scientific: "Serinus canaria",
    description: "Burung penyanyi legendaris dengan suara merdu, populer untuk lomba kicau dan peliharaan rumahan.",
    foods: [
      { name: "Canary Seed", category: "main", benefits: ["Protein", "Karbohidrat"], note: "Pakan pokok kenari, 70% dari total ransum." },
      { name: "Milet Putih", category: "main", benefits: ["Energi", "Serat"] },
      { name: "Niger Seed", category: "main", benefits: ["Omega-3", "Vitamin E"] },
      { name: "Biji Sawi", category: "main", benefits: ["Mineral", "Protein"] },
      { name: "Sawi Putih", category: "extra", benefits: ["Vitamin K", "Serat"], note: "Doping alami untuk suara ngerol." },
      { name: "Timun", category: "extra", benefits: ["Hidrasi", "Vitamin"] },
      { name: "Telur Puyuh", category: "extra", benefits: ["Protein Tinggi"], note: "2-3x seminggu untuk stamina." },
      { name: "Buah Pir", category: "extra", benefits: ["Vitamin C", "Serat"] },
    ],
    toxic: commonToxic,
    portions: [
      { size: "Kecil", condition: "Harian", grams: 5, teaspoon: "1 sdt", morning: "07:00 - 2.5 gram", evening: "17:00 - 2.5 gram" },
      { size: "Standar", condition: "Harian", grams: 6, teaspoon: "1.2 sdt", morning: "07:00 - 3 gram", evening: "17:00 - 3 gram" },
      { size: "Besar", condition: "Harian", grams: 8, teaspoon: "1.5 sdt", morning: "07:00 - 4 gram", evening: "17:00 - 4 gram" },
      { size: "Kecil", condition: "Mabuk", grams: 7, teaspoon: "1.5 sdt", morning: "07:00 - 3.5 gram + niger", evening: "17:00 - 3.5 gram + sawi" },
      { size: "Standar", condition: "Mabuk", grams: 9, teaspoon: "2 sdt", morning: "07:00 - 4.5 gram + niger", evening: "17:00 - 4.5 gram + sawi" },
      { size: "Besar", condition: "Mabuk", grams: 11, teaspoon: "2.2 sdt", morning: "07:00 - 5.5 gram + niger", evening: "17:00 - 5.5 gram + sawi" },
      { size: "Kecil", condition: "Ternak", grams: 9, teaspoon: "2 sdt", morning: "07:00 - 4.5 gram + telur", evening: "17:00 - 4.5 gram + sawi" },
      { size: "Standar", condition: "Ternak", grams: 11, teaspoon: "2.2 sdt", morning: "07:00 - 5.5 gram + telur", evening: "17:00 - 5.5 gram + sawi" },
      { size: "Besar", condition: "Ternak", grams: 13, teaspoon: "2.6 sdt", morning: "07:00 - 6.5 gram + telur", evening: "17:00 - 6.5 gram + sawi" },
    ],
    recipes: [
      {
        title: "Racikan Ngerol Kenari Juara",
        purpose: "Meningkatkan durasi & variasi suara ngerol",
        ingredients: ["30 gr canary seed", "10 gr niger seed", "1 lembar sawi putih", "½ butir telur puyuh"],
        steps: [
          "Campurkan canary seed & niger seed.",
          "Rebus telur puyuh, cincang halus.",
          "Iris sawi putih tipis-tipis.",
          "Sajikan seed di cepuk utama, EF di cepuk terpisah.",
          "Beri air minum bersih tiap pagi.",
        ],
      },
      {
        title: "EF Booster Masa Mabung",
        purpose: "Nutrisi lengkap untuk pertumbuhan bulu",
        ingredients: ["Niger seed 15 gr", "Telur puyuh 1 butir", "Timun ½ potong", "Buah pir kecil"],
        steps: [
          "Rebus telur puyuh, dinginkan.",
          "Iris timun & pir kecil-kecil.",
          "Berikan niger seed sebagai boost harian.",
          "Sajikan telur di pagi hari 3x seminggu.",
          "Semprot bulu perlahan dengan air hangat.",
        ],
      },
    ],
  },
  {
    id: "murai",
    name: "Murai Batu",
    emoji: "🕊️",
    scientific: "Copsychus malabaricus",
    description: "Burung kicau pemakan serangga dengan ekor panjang & suara variatif, primadona kontes kicau.",
    foods: [
      { name: "Voer Halus Premium", category: "main", benefits: ["Protein", "Vitamin Kompleks"], note: "Pilih voer khusus murai batu, protein min 18%." },
      { name: "Voer Kasar", category: "main", benefits: ["Serat", "Mineral"] },
      { name: "Jangkrik", category: "extra", benefits: ["Protein Tinggi", "Kitin"], note: "Buang kepala & kaki. 5-10 ekor/hari." },
      { name: "Kroto", category: "extra", benefits: ["Protein", "Asam Amino"], note: "1 sendok teh 2-3x seminggu." },
      { name: "Ulat Hongkong", category: "extra", benefits: ["Lemak", "Energi"], note: "Batasi max 5 ekor/hari, panas." },
      { name: "Ulat Kandang", category: "extra", benefits: ["Protein Sedang"], note: "Lebih aman dari UH, boleh harian." },
      { name: "Cacing Tanah", category: "extra", benefits: ["Protein", "Mineral"], note: "Doping suara, cuci bersih." },
      { name: "Belalang Hijau", category: "extra", benefits: ["Protein", "Kalsium"] },
    ],
    toxic: commonToxic,
    portions: [
      { size: "Kecil", condition: "Harian", grams: 15, teaspoon: "3 sdt voer", morning: "07:00 - Voer + 3 jangkrik", evening: "17:00 - Voer + 3 jangkrik" },
      { size: "Standar", condition: "Harian", grams: 18, teaspoon: "3.5 sdt voer", morning: "07:00 - Voer + 5 jangkrik", evening: "17:00 - Voer + 5 jangkrik" },
      { size: "Besar", condition: "Harian", grams: 22, teaspoon: "4 sdt voer", morning: "07:00 - Voer + 7 jangkrik", evening: "17:00 - Voer + 7 jangkrik" },
      { size: "Kecil", condition: "Mabuk", grams: 18, teaspoon: "3.5 sdt voer", morning: "07:00 - Voer + kroto 1sdt", evening: "17:00 - Voer + ulat kandang" },
      { size: "Standar", condition: "Mabuk", grams: 22, teaspoon: "4 sdt voer", morning: "07:00 - Voer + kroto 1sdt", evening: "17:00 - Voer + ulat kandang" },
      { size: "Besar", condition: "Mabuk", grams: 26, teaspoon: "5 sdt voer", morning: "07:00 - Voer + kroto 1.5sdt", evening: "17:00 - Voer + ulat kandang" },
      { size: "Kecil", condition: "Ternak", grams: 22, teaspoon: "4 sdt voer", morning: "07:00 - Voer + 10 jangkrik + kroto", evening: "17:00 - Voer + cacing" },
      { size: "Standar", condition: "Ternak", grams: 26, teaspoon: "5 sdt voer", morning: "07:00 - Voer + 12 jangkrik + kroto", evening: "17:00 - Voer + cacing" },
      { size: "Besar", condition: "Ternak", grams: 30, teaspoon: "6 sdt voer", morning: "07:00 - Voer + 15 jangkrik + kroto", evening: "17:00 - Voer + cacing" },
    ],
    recipes: [
      {
        title: "Racikan Doping Suara Murai Juara",
        purpose: "Meningkatkan volume & variasi tembakan",
        ingredients: ["Kroto segar 1 sdm", "Jangkrik 5 ekor", "Cacing tanah 2 ekor", "Voer premium"],
        steps: [
          "Cuci kroto dengan air bersih, tiriskan.",
          "Buang kepala & kaki jangkrik.",
          "Cuci cacing tanah, potong jadi 2.",
          "Berikan kroto pagi hari sebelum dijemur.",
          "Selingi jangkrik & cacing sepanjang hari.",
        ],
      },
      {
        title: "EF Pemulih Pasca Mabung",
        purpose: "Restorasi stamina & kilau bulu",
        ingredients: ["Ulat kandang 1 sdm", "Jangkrik 7 ekor", "Kroto 1 sdt", "Multivitamin burung"],
        steps: [
          "Siapkan voer segar di cepuk utama.",
          "Berikan ulat kandang sebagai EF utama.",
          "Selingi jangkrik pagi & sore.",
          "Tambahkan multivitamin di air minum 2x seminggu.",
          "Jemur 15-30 menit pagi hari.",
        ],
      },
    ],
  },
  {
    id: "pleci",
    name: "Pleci",
    emoji: "🐦",
    scientific: "Zosterops spp.",
    description: "Burung kacamata mungil pemakan buah & serangga, terkenal dengan buka paruh (ngalas) yang khas.",
    foods: [
      { name: "Voer Pleci Halus", category: "main", benefits: ["Protein", "Vitamin"], note: "Pilih voer khusus dengan protein 16-18%." },
      { name: "Pisang Kepok", category: "main", benefits: ["Kalium", "Karbohidrat"], note: "Buah pokok pleci, ganti tiap hari." },
      { name: "Pepaya", category: "extra", benefits: ["Vitamin C", "Enzim Papain"] },
      { name: "Apel Merah", category: "extra", benefits: ["Antioksidan", "Serat"], note: "Buang biji, iris tipis." },
      { name: "Kroto", category: "extra", benefits: ["Protein", "Doping Suara"], note: "1 sdt sehari sudah cukup." },
      { name: "Ulat Kandang", category: "extra", benefits: ["Protein Ringan"] },
      { name: "Nektar Madu", category: "extra", benefits: ["Energi", "Antibakteri"], note: "1 tetes madu di air minum 2x seminggu." },
      { name: "Jeruk Manis", category: "extra", benefits: ["Vitamin C"], note: "Peras sedikit di potongan pisang." },
    ],
    toxic: commonToxic,
    portions: [
      { size: "Kecil", condition: "Harian", grams: 4, teaspoon: "0.8 sdt", morning: "07:00 - Voer + pisang", evening: "17:00 - Voer + pepaya" },
      { size: "Standar", condition: "Harian", grams: 5, teaspoon: "1 sdt", morning: "07:00 - Voer + pisang", evening: "17:00 - Voer + apel" },
      { size: "Besar", condition: "Harian", grams: 6, teaspoon: "1.2 sdt", morning: "07:00 - Voer + pisang", evening: "17:00 - Voer + pepaya" },
      { size: "Kecil", condition: "Mabuk", grams: 5, teaspoon: "1 sdt", morning: "07:00 - Kroto 1sdt + pisang", evening: "17:00 - Voer + apel" },
      { size: "Standar", condition: "Mabuk", grams: 6, teaspoon: "1.2 sdt", morning: "07:00 - Kroto 1sdt + pisang", evening: "17:00 - Voer + pepaya" },
      { size: "Besar", condition: "Mabuk", grams: 7, teaspoon: "1.4 sdt", morning: "07:00 - Kroto 1.5sdt + pisang", evening: "17:00 - Voer + pepaya" },
      { size: "Kecil", condition: "Ternak", grams: 6, teaspoon: "1.2 sdt", morning: "07:00 - Kroto + pisang + telur", evening: "17:00 - Voer + apel + ulat" },
      { size: "Standar", condition: "Ternak", grams: 7, teaspoon: "1.4 sdt", morning: "07:00 - Kroto + pisang + telur", evening: "17:00 - Voer + apel + ulat" },
      { size: "Besar", condition: "Ternak", grams: 8, teaspoon: "1.6 sdt", morning: "07:00 - Kroto + pisang + telur", evening: "17:00 - Voer + apel + ulat" },
    ],
    recipes: [
      {
        title: "Racikan Buka Paruh Pleci Ngalas",
        purpose: "Merangsang pleci rajin buka paruh & ngalas",
        ingredients: ["Pisang kepok ½ buah", "Kroto 1 sdt", "1 tetes madu", "Voer halus"],
        steps: [
          "Belah pisang memanjang.",
          "Taburi kroto di atas belahan pisang.",
          "Tetesi madu murni di ujung pisang.",
          "Gantung di sangkar dekat tenggeran.",
          "Berikan pagi hari sebelum dijemur.",
        ],
      },
      {
        title: "Salad Buah Pleci Sehat",
        purpose: "Menjaga imun & warna bulu",
        ingredients: ["Pepaya matang ¼ potong", "Apel merah ¼ potong", "Perasan jeruk manis", "Ulat kandang 5 ekor"],
        steps: [
          "Potong pepaya & apel dadu kecil.",
          "Peras sedikit jeruk manis di atasnya.",
          "Aduk pelan agar tercampur.",
          "Sajikan di cepuk EF.",
          "Tambahkan ulat kandang di samping.",
        ],
      },
    ],
  },
];
