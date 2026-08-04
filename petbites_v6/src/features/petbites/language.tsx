/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AppFeature, FeatureId } from "@/lib/birds-data";

import { formatLocalizedNumber, formatLocalizedNumbersInText } from "./content-localization";

export type Language = "id" | "en";

type Variables = Record<string, string | number>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, variables?: Variables) => string;
  birdName: (indonesian: string, english?: string | null) => string;
  birdDescription: (indonesian: string, english?: string | null) => string;
  featureText: (
    feature: Pick<AppFeature, "id" | "label" | "shortLabel" | "description">,
    field: "label" | "shortLabel" | "description",
  ) => string;
  contentText: (indonesian: string, english?: string | null) => string;
  formatNumber: (value: number) => string;
};

const STORAGE_KEY = "petbites:language";

const messages: Record<Language, Record<string, string>> = {
  id: {
    "accessibility.skipToContent": "Lewati ke konten utama",
    "language.switchToEnglish": "Ganti ke bahasa Inggris",
    "language.switchToIndonesian": "Ganti ke bahasa Indonesia",
    "header.tagline": "Panduan nutrisi burung",
    "header.goHome": "Kembali ke beranda PetBites",
    "header.howItWorks": "Cara kerja",
    "header.chooseBird": "Pilih burung",
    "header.navigation": "Navigasi utama",
    "theme.useLight": "Gunakan tema terang",
    "theme.useDark": "Gunakan tema gelap",
    "welcome.skip": "Lewati",
    "welcome.aria": "Selamat datang di PetBites",
    "welcome.eyebrow": "Selamat datang di",
    "welcome.copy": "Panduan pakan yang lebih mudah dipahami untuk burung kesayanganmu.",
    "home.badge": "Panduan nutrisi burung",
    "home.titleBefore": "Pilih pakan dengan",
    "home.titleAccent": "lebih yakin.",
    "home.lead":
      "Cari makanan yang sesuai, cek bahan berbahaya, lihat perkiraan porsi, dan ikuti resep sederhana untuk burung kesayanganmu.",
    "home.chooseSpecies": "Pilih jenis burung",
    "home.viewHow": "Lihat cara kerja",
    "home.proofLabel": "Keunggulan PetBites",
    "home.noAccount": "Tanpa akun",
    "home.mobileFriendly": "Nyaman di ponsel",
    "home.expandableData": "Mudah dipahami",
    "hero.structuredData": "Data terstruktur",
    "hero.practical": "Praktis dipakai",
    "home.featuresEyebrow": "Satu tempat, empat kebutuhan",
    "home.featuresTitle": "Panduan yang langsung bisa dipakai",
    "home.featuresCopy":
      "Pakan, keamanan bahan, perkiraan porsi, dan resep tersedia dalam satu panduan yang mudah digunakan.",
    "home.stepsEyebrow": "Cara kerja",
    "home.stepsTitle": "Tiga langkah sederhana",
    "home.step1Title": "Pilih jenis burung",
    "home.step1Copy":
      "PetBites menyesuaikan daftar pakan, porsi, dan resep dengan burung pilihanmu.",
    "home.step2Title": "Buka panduan yang dibutuhkan",
    "home.step2Copy": "Gunakan Food Finder, Toxic Checker, kalkulator porsi, atau resep.",
    "home.step3Title": "Terapkan secara bertahap",
    "home.step3Copy":
      "Gunakan hasil sebagai acuan umum dan tetap pantau kondisi burung setiap hari.",
    "home.startHere": "Mulai dari sini",
    "home.chooseYourBird": "Pilih jenis burungmu",
    "home.availableBirds":
      "{count} jenis burung tersedia. Pilih satu untuk melihat pakan, keamanan bahan, perkiraan porsi, dan resep.",
    "home.searchBird": "Cari jenis burung",
    "home.searchPlaceholder": "Cari Lovebird, Kenari, Pleci...",
    "home.notFoundTitle": "Burung belum ditemukan",
    "home.notFoundCopy": "Coba gunakan nama umum atau nama ilmiahnya.",
    "home.clearSearch": "Hapus pencarian",
    "bird.alt": "Burung {name}",
    "translation.unavailable": "Terjemahan bahasa Inggris belum tersedia.",
    "bird.openGuide": "Buka panduan {name}",
    "bird.foodCount": "{count} pakan",
    "bird.checkedCount": "{count} bahan dicek",
    "bird.recipeCount": "{count} resep",
    "dashboard.back": "Kembali ke daftar burung",
    "dashboard.nutritionGuide": "Panduan nutrisi",
    "dashboard.food": "Pakan",
    "dashboard.toxicCheck": "Cek keamanan",
    "dashboard.recipes": "Resep",
    "dashboard.tabsLabel": "Fitur panduan nutrisi",
    "dashboard.noFeaturesTitle": "Belum ada fitur aktif",
    "dashboard.noFeaturesCopy": "Panduan untuk burung ini belum tersedia. Silakan coba lagi nanti.",
    "food.searchLabel": "Cari pakan",
    "food.searchPlaceholder": "Cari nama pakan atau manfaatnya...",
    "food.filterLabel": "Filter kategori pakan",
    "food.all": "Semua",
    "food.main": "Utama",
    "food.extra": "Tambahan",
    "food.resultCount": "Menampilkan {shown} dari {total} pakan",
    "food.mainBadge": "Pakan utama",
    "food.extraBadge": "Pakan tambahan",
    "food.emptyTitle": "Pakan tidak ditemukan",
    "food.emptyCopy": "Coba kata kunci lain atau hapus filter kategori.",
    "food.reset": "Reset pencarian",
    "toxic.checkFirst": "Cek sebelum diberikan",
    "toxic.checkCopy": "Ketik nama makanan atau bahan dapur untuk melihat status keamanannya.",
    "toxic.searchLabel": "Cari keamanan bahan makanan",
    "toxic.searchPlaceholder": "Contoh: alpukat, apel, cokelat...",
    "toxic.suggestions": "Saran pencarian",
    "toxic.placeholder": "Hasil pemeriksaan akan muncul di sini.",
    "toxic.unknownTitle": "Belum ada di database",
    "toxic.unknownCopy":
      "“{query}” belum terdaftar. Jangan menganggap bahan tersebut aman sebelum mendapatkan rujukan yang tepercaya.",
    "toxic.remember": "Perlu diingat",
    "toxic.kitchenItems": "Bahan yang umum ditemukan di dapur",
    "toxic.dangerousCount": "{count} bahan berbahaya",
    "safety.result": "Hasil pemeriksaan",
    "safety.safe": "Aman",
    "safety.safeCopy": "Bisa diberikan sesuai catatan dan porsi yang wajar.",
    "safety.caution": "Perlu dibatasi",
    "safety.cautionCopy": "Perhatikan jumlah, frekuensi, atau cara penyajiannya.",
    "safety.toxic": "Berbahaya",
    "safety.toxicCopy": "Jangan diberikan kepada burung.",
    "portion.condition": "Kondisi burung",
    "portion.daily": "Harian",
    "portion.dailyCopy": "Kondisi normal",
    "portion.molting": "Mabung",
    "portion.moltingCopy": "Rontok dan tumbuh bulu",
    "portion.breeding": "Masa ternak",
    "portion.breedingCopy": "Masa berkembang biak",
    "portion.size": "Ukuran burung",
    "portion.small": "Kecil",
    "portion.standard": "Standar",
    "portion.large": "Besar",
    "portion.estimateTitle": "Gunakan sebagai estimasi awal",
    "portion.estimateCopy":
      "Pantau nafsu makan, berat badan, dan kondisi kotoran. Kebutuhan setiap burung dapat berbeda.",
    "portion.estimated": "Perkiraan porsi",
    "portion.dailyTotal": "Total harian",
    "portion.grams": "gram",
    "portion.volume": "Perkiraan volume",
    "portion.morning": "Pagi",
    "portion.evening": "Sore",
    "portion.unavailableTitle": "Aturan porsi belum tersedia",
    "portion.unavailableCopy": "Belum ada data untuk {bird}, ukuran {size}, kondisi {condition}.",
    "recipe.unavailableTitle": "Resep belum tersedia",
    "recipe.unavailableCopy": "Belum ada resep aktif untuk {bird}.",
    "recipe.ingredients": "Bahan",
    "recipe.steps": "Cara membuat",
    "loading.eyebrow": "Sedang menyiapkan panduan",
    "loading.title": "Memuat data burung dan pakannya",
    "loading.copy": "PetBites sedang menyusun informasi dari database agar siap kamu gunakan.",
    "error.title": "Data belum bisa dimuat",
    "error.connectionTitle": "Koneksi sedang bermasalah",
    "error.copy": "Periksa koneksi internet, lalu coba muat ulang beberapa saat lagi.",
    "error.technicalDetails": "Detail teknis (mode pengembangan)",
    "error.retry": "Coba muat ulang",
    "request.eyebrow": "Bantu kembangkan PetBites",
    "request.title": "Burungmu belum tersedia?",
    "request.copy":
      "Kirim request jenis burung yang kamu pelihara. Tim PetBites akan meninjau, melengkapi data, dan menambahkannya setelah lolos review.",
    "request.flowLabel": "Alur request burung",
    "request.flowSend": "Kirim request",
    "request.flowReview": "Kami review",
    "request.flowPublish": "Burung ditambahkan",
    "request.formTitle": "Request burung baru",
    "request.formCopy":
      "Isi informasi yang kamu tahu. Kolom selain nama dan alasan boleh dikosongkan.",
    "request.birdName": "Nama burung *",
    "request.birdNamePlaceholder": "Contoh: Jalak Bali",
    "request.localName": "Nama lokal / nama lain",
    "request.localNamePlaceholder": "Contoh: Curik Bali",
    "request.scientificName": "Nama ilmiah",
    "request.scientificNamePlaceholder": "Opsional",
    "request.contact": "Email atau kontak",
    "request.contactPlaceholder": "Opsional, hanya terlihat admin",
    "request.reason": "Ceritakan kebutuhanmu *",
    "request.reasonPlaceholder":
      "Contoh: Saya memelihara burung ini dan belum menemukan panduan pakan yang mudah dipahami.",
    "request.privacy": "Request akan diterima oleh admin. Kontak tidak ditampilkan ke publik.",
    "request.submit": "Kirim request",
    "request.sending": "Mengirim…",
    "request.successTitle": "Request berhasil dikirim",
    "request.successCopy": "Terima kasih. Request-mu masuk ke antrean review PetBites.",
    "request.sendAnother": "Kirim request lain",
    "request.validationName": "Nama burung minimal 2 karakter.",
    "request.validationReason": "Alasan minimal 10 karakter.",
    "request.cooldown": "Tunggu sebentar sebelum mengirim request berikutnya.",
    "request.error": "Request belum berhasil dikirim. Coba lagi beberapa saat.",
    "footer.tagline": "Panduan praktis untuk pemilik burung.",
    "footer.disclaimer":
      "Informasi bersifat panduan umum. Untuk kondisi kesehatan khusus, konsultasikan dengan dokter hewan.",
  },
  en: {
    "accessibility.skipToContent": "Skip to main content",
    "language.switchToEnglish": "Switch to English",
    "language.switchToIndonesian": "Switch to Indonesian",
    "header.tagline": "Bird nutrition guide",
    "header.goHome": "Return to the PetBites homepage",
    "header.howItWorks": "How it works",
    "header.chooseBird": "Choose a bird",
    "header.navigation": "Main navigation",
    "theme.useLight": "Use light theme",
    "theme.useDark": "Use dark theme",
    "welcome.skip": "Skip",
    "welcome.aria": "Welcome to PetBites",
    "welcome.eyebrow": "Welcome to",
    "welcome.copy": "A simpler feeding guide for your beloved bird.",
    "home.badge": "Bird nutrition guide",
    "home.titleBefore": "Choose food with",
    "home.titleAccent": "more confidence.",
    "home.lead":
      "Find suitable foods, check harmful ingredients, view estimated portions, and follow simple recipes for your bird.",
    "home.chooseSpecies": "Choose a bird species",
    "home.viewHow": "See how it works",
    "home.proofLabel": "PetBites benefits",
    "home.noAccount": "No account required",
    "home.mobileFriendly": "Comfortable on mobile",
    "home.expandableData": "Easy to understand",
    "hero.structuredData": "Structured data",
    "hero.practical": "Practical to use",
    "home.featuresEyebrow": "One place, four essentials",
    "home.featuresTitle": "Practical guidance you can use right away",
    "home.featuresCopy":
      "Food, ingredient safety, portion estimates, and recipes are available in one easy-to-use guide.",
    "home.stepsEyebrow": "How it works",
    "home.stepsTitle": "Three simple steps",
    "home.step1Title": "Choose a bird species",
    "home.step1Copy":
      "PetBites adjusts the food list, portions, and recipes for your selected bird.",
    "home.step2Title": "Open the guide you need",
    "home.step2Copy": "Use Food Finder, Toxic Checker, Portion Calculator, or Recipes.",
    "home.step3Title": "Apply changes gradually",
    "home.step3Copy":
      "Use the results as general guidance and keep monitoring your bird every day.",
    "home.startHere": "Start here",
    "home.chooseYourBird": "Choose your bird",
    "home.availableBirds":
      "{count} bird species are available. Choose one to explore foods, ingredient safety, portion estimates, and recipes.",
    "home.searchBird": "Search bird species",
    "home.searchPlaceholder": "Search Lovebird, Canary, White-eye...",
    "home.notFoundTitle": "Bird not found",
    "home.notFoundCopy": "Try its common name or scientific name.",
    "home.clearSearch": "Clear search",
    "bird.alt": "{name} bird",
    "translation.unavailable": "English translation is not available yet.",
    "bird.openGuide": "Open the {name} guide",
    "bird.foodCount": "{count} foods",
    "bird.checkedCount": "{count} checked items",
    "bird.recipeCount": "{count} recipes",
    "dashboard.back": "Back to bird list",
    "dashboard.nutritionGuide": "Nutrition guide",
    "dashboard.food": "Foods",
    "dashboard.toxicCheck": "Safety check",
    "dashboard.recipes": "Recipes",
    "dashboard.tabsLabel": "Nutrition guide features",
    "dashboard.noFeaturesTitle": "No active features yet",
    "dashboard.noFeaturesCopy":
      "Guidance for this bird is not available yet. Please try again later.",
    "food.searchLabel": "Search foods",
    "food.searchPlaceholder": "Search by food name or benefit...",
    "food.filterLabel": "Food category filter",
    "food.all": "All",
    "food.main": "Main",
    "food.extra": "Extra",
    "food.resultCount": "Showing {shown} of {total} foods",
    "food.mainBadge": "Main food",
    "food.extraBadge": "Supplementary food",
    "food.emptyTitle": "Food not found",
    "food.emptyCopy": "Try another keyword or clear the category filter.",
    "food.reset": "Reset search",
    "toxic.checkFirst": "Check before feeding",
    "toxic.checkCopy": "Type a food or kitchen ingredient to check its safety status.",
    "toxic.searchLabel": "Search ingredient safety",
    "toxic.searchPlaceholder": "Example: avocado, apple, chocolate...",
    "toxic.suggestions": "Search suggestions",
    "toxic.placeholder": "The safety result will appear here.",
    "toxic.unknownTitle": "Not in the database yet",
    "toxic.unknownCopy":
      "“{query}” is not listed yet. Do not assume it is safe without a reliable reference.",
    "toxic.remember": "Keep in mind",
    "toxic.kitchenItems": "Common kitchen ingredients",
    "toxic.dangerousCount": "{count} dangerous items",
    "safety.result": "Safety result",
    "safety.safe": "Safe",
    "safety.safeCopy": "May be offered according to the notes and in a reasonable portion.",
    "safety.caution": "Limit intake",
    "safety.cautionCopy": "Pay attention to the amount, frequency, and preparation method.",
    "safety.toxic": "Dangerous",
    "safety.toxicCopy": "Do not feed this to birds.",
    "portion.condition": "Bird condition",
    "portion.daily": "Daily",
    "portion.dailyCopy": "Normal condition",
    "portion.molting": "Molting",
    "portion.moltingCopy": "Shedding and growing feathers",
    "portion.breeding": "Breeding",
    "portion.breedingCopy": "Breeding and production period",
    "portion.size": "Bird size",
    "portion.small": "Small",
    "portion.standard": "Standard",
    "portion.large": "Large",
    "portion.estimateTitle": "Use this as an initial estimate",
    "portion.estimateCopy":
      "Monitor appetite, body weight, and droppings. Each bird's needs may differ.",
    "portion.estimated": "Estimated portion",
    "portion.dailyTotal": "Daily total",
    "portion.grams": "grams",
    "portion.volume": "Estimated volume",
    "portion.morning": "Morning",
    "portion.evening": "Evening",
    "portion.unavailableTitle": "Portion guidance is unavailable",
    "portion.unavailableCopy":
      "No data is available for {bird}, {size} size, under {condition} conditions.",
    "recipe.unavailableTitle": "Recipes are unavailable",
    "recipe.unavailableCopy": "There are no active recipes for {bird} yet.",
    "recipe.ingredients": "Ingredients",
    "recipe.steps": "Instructions",
    "loading.eyebrow": "Preparing your guide",
    "loading.title": "Loading birds and feeding data",
    "loading.copy": "PetBites is organizing database information so it is ready to use.",
    "error.title": "The data could not be loaded",
    "error.connectionTitle": "Connection temporarily unavailable",
    "error.copy": "Check your internet connection, then try loading the guide again in a moment.",
    "error.technicalDetails": "Technical details (development mode)",
    "error.retry": "Try again",
    "request.eyebrow": "Help PetBites grow",
    "request.title": "Can’t find your bird?",
    "request.copy":
      "Request the bird species you keep. The PetBites team will review it, complete the data, and add it after approval.",
    "request.flowLabel": "Bird request workflow",
    "request.flowSend": "Send request",
    "request.flowReview": "We review it",
    "request.flowPublish": "Bird is added",
    "request.formTitle": "Request a new bird",
    "request.formCopy": "Share what you know. Only the bird name and reason are required.",
    "request.birdName": "Bird name *",
    "request.birdNamePlaceholder": "Example: Bali Myna",
    "request.localName": "Local or alternate name",
    "request.localNamePlaceholder": "Optional",
    "request.scientificName": "Scientific name",
    "request.scientificNamePlaceholder": "Optional",
    "request.contact": "Email or contact",
    "request.contactPlaceholder": "Optional, visible only to admins",
    "request.reason": "Tell us why you need it *",
    "request.reasonPlaceholder":
      "Example: I keep this bird and could not find a simple feeding guide.",
    "request.privacy":
      "Requests go to the private admin dashboard. Contact details are never public.",
    "request.submit": "Send request",
    "request.sending": "Sending…",
    "request.successTitle": "Request sent",
    "request.successCopy": "Thank you. Your request is now in the PetBites review queue.",
    "request.sendAnother": "Send another request",
    "request.validationName": "The bird name must be at least 2 characters.",
    "request.validationReason": "The reason must be at least 10 characters.",
    "request.cooldown": "Please wait before sending another request.",
    "request.error": "The request could not be sent. Please try again shortly.",
    "footer.tagline": "A practical guide for bird owners.",
    "footer.disclaimer":
      "This information is general guidance. Consult an avian veterinarian for specific health conditions.",
  },
};

const englishFeatures: Record<
  FeatureId,
  { label: string; shortLabel: string; description: string }
> = {
  food: {
    label: "Food Finder",
    shortLabel: "Food",
    description: "Browse suitable staple and supplementary foods for the selected bird.",
  },
  toxic: {
    label: "Toxic Checker",
    shortLabel: "Safety",
    description: "Check whether common foods and kitchen ingredients are safe, limited, or toxic.",
  },
  portion: {
    label: "Portion Calculator",
    shortLabel: "Portion",
    description:
      "View an initial portion estimate based on size and condition, then monitor the bird closely.",
  },
  recipe: {
    label: "DIY Recipes",
    shortLabel: "Recipes",
    description:
      "Follow simple supplementary-food recipes using clearly listed ingredients and steps.",
  },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function interpolate(template: string, variables: Variables = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(variables[key] ?? `{${key}}`));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "id" || stored === "en") setLanguageState(stored);
    } catch {
      // Indonesian remains the default when local storage is unavailable.
    }
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
      // The language still changes for the active session.
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "id" ? "en" : "id");
  }, [language, setLanguage]);

  useEffect(() => {
    const isAdminPage =
      window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/");

    // The CMS is currently Indonesian-only. Do not let the public language
    // preference overwrite the admin route title, description, or document language.
    if (isAdminPage) {
      document.documentElement.lang = "id";
      return;
    }

    const title =
      language === "en" ? "PetBites — Bird Nutrition Guide" : "PetBites — Panduan Nutrisi Burung";
    const description =
      language === "en"
        ? "Find suitable bird foods, check harmful ingredients, view estimated portions, and follow simple recipes."
        : "Cari pakan, cek bahan berbahaya, lihat perkiraan porsi, dan ikuti resep sederhana untuk burung kesayanganmu.";
    const socialDescription =
      language === "en"
        ? "A clear, practical, and easy-to-use bird feeding guide."
        : "Panduan pakan burung yang jelas, praktis, dan mudah digunakan.";

    document.documentElement.lang = language;
    document.title = title;
    updateMetaContent('meta[name="description"]', description);
    updateMetaContent('meta[property="og:title"]', title);
    updateMetaContent('meta[property="og:description"]', socialDescription);
  }, [language]);

  const t = useCallback(
    (key: string, variables?: Variables) => {
      const template = messages[language][key] ?? messages.id[key] ?? key;
      return interpolate(template, variables);
    },
    [language],
  );

  const selectContentLanguage = useCallback(
    (indonesian: string, english?: string | null) => {
      const selected =
        language === "id" ? indonesian : english?.trim() || messages.en["translation.unavailable"];

      return formatLocalizedNumbersInText(selected, language);
    },
    [language],
  );

  const birdName = selectContentLanguage;
  const birdDescription = selectContentLanguage;

  const featureText = useCallback(
    (
      feature: Pick<AppFeature, "id" | "label" | "shortLabel" | "description">,
      field: "label" | "shortLabel" | "description",
    ) =>
      language === "en" ? (englishFeatures[feature.id]?.[field] ?? feature[field]) : feature[field],
    [language],
  );

  const contentText = selectContentLanguage;

  const formatNumber = useCallback(
    (value: number) => formatLocalizedNumber(value, language),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      birdName,
      birdDescription,
      featureText,
      contentText,
      formatNumber,
    }),
    [
      birdDescription,
      birdName,
      contentText,
      featureText,
      formatNumber,
      language,
      setLanguage,
      t,
      toggleLanguage,
    ],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

function updateMetaContent(selector: string, content: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element) element.content = content;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider.");
  return context;
}
