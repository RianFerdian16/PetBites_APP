import type { PostgrestSingleResponse } from "@supabase/supabase-js";

import type {
  AppFeature,
  Bird,
  BirdCondition,
  BirdSize,
  FeatureId,
  PetBitesContent,
  Safety,
} from "@/lib/birds-data";
import { getSupabaseClient } from "@/lib/supabase";

type FeatureRow = {
  id: string;
  label: string;
  short_label: string;
  description: string;
  icon_key: string;
  sort_order: number;
};

type BirdRow = {
  id: string;
  name: string;
  name_en: string | null;
  emoji: string;
  image_url: string | null;
  scientific_name: string;
  description: string;
  description_en: string | null;
  sort_order: number;
};

type FoodRow = {
  id: string;
  bird_id: string;
  name: string;
  name_en: string | null;
  category: "main" | "extra";
  benefits: string[] | null;
  benefits_en: string[] | null;
  note: string | null;
  note_en: string | null;
  sort_order: number;
};

type ToxicRow = {
  id: string;
  bird_id: string | null;
  name: string;
  name_en: string | null;
  status: Safety;
  explanation: string;
  explanation_en: string | null;
  sort_order: number;
};

type PortionRow = {
  id: string;
  bird_id: string;
  size: BirdSize;
  condition: BirdCondition;
  grams: number | string;
  teaspoon: string;
  teaspoon_en: string | null;
  morning: string;
  morning_en: string | null;
  evening: string;
  evening_en: string | null;
  sort_order: number;
};

type RecipeRow = {
  id: string;
  bird_id: string;
  title: string;
  title_en: string | null;
  purpose: string;
  purpose_en: string | null;
  sort_order: number;
};

type IngredientRow = {
  recipe_id: string;
  sort_order: number;
  ingredient: string;
  ingredient_en: string | null;
};

type StepRow = {
  recipe_id: string;
  sort_order: number;
  instruction: string;
  instruction_en: string | null;
};

type FetchOptions = { force?: boolean };

const CACHE_KEY = "petbites:content:v6";
const CACHE_TTL_MS = 60 * 1000;
const supportedFeatures = new Set<FeatureId>(["food", "toxic", "portion", "recipe"]);

let memoryCache: { expiresAt: number; content: PetBitesContent } | null = null;

function isFeatureId(value: string): value is FeatureId {
  return supportedFeatures.has(value as FeatureId);
}

function assertRows<T>(result: PostgrestSingleResponse<T[]>, label: string): T[] {
  if (result.error) {
    throw new Error(`Gagal mengambil ${label} dari Supabase: ${result.error.message}`);
  }
  return result.data ?? [];
}

function groupBy<T, K>(rows: T[], keySelector: (row: T) => K) {
  const grouped = new Map<K, T[]>();
  for (const row of rows) {
    const key = keySelector(row);
    const current = grouped.get(key);
    if (current) current.push(row);
    else grouped.set(key, [row]);
  }
  return grouped;
}

function optionalText(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readSessionCache(): PetBitesContent | null {
  if (typeof window === "undefined") return null;
  try {
    const serialized = window.sessionStorage.getItem(CACHE_KEY);
    if (!serialized) return null;
    const parsed = JSON.parse(serialized) as { expiresAt?: number; content?: PetBitesContent };
    if (!parsed.expiresAt || !parsed.content || parsed.expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.content;
  } catch {
    window.sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function writeSessionCache(content: PetBitesContent) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ expiresAt: Date.now() + CACHE_TTL_MS, content }),
    );
  } catch {
    // Private browsing may block storage; memory cache still works.
  }
}

export function clearPetBitesCache() {
  memoryCache = null;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Memory invalidation is still enough when storage is blocked.
  }
}

export async function fetchPetBitesContent(options: FetchOptions = {}): Promise<PetBitesContent> {
  if (!options.force && memoryCache && memoryCache.expiresAt > Date.now()) {
    return memoryCache.content;
  }
  if (!options.force) {
    const cachedContent = readSessionCache();
    if (cachedContent) {
      memoryCache = { expiresAt: Date.now() + CACHE_TTL_MS, content: cachedContent };
      return cachedContent;
    }
  }

  const supabase = getSupabaseClient();
  const [
    featureResult,
    birdResult,
    foodResult,
    toxicResult,
    portionResult,
    recipeResult,
    ingredientResult,
    stepResult,
  ] = await Promise.all([
    supabase
      .from("app_features")
      .select("id,label,short_label,description,icon_key,sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("birds")
      .select(
        "id,name,name_en,emoji,image_url,scientific_name,description,description_en,sort_order",
      )
      .eq("is_active", true)
      .eq("content_status", "published")
      .order("sort_order"),
    supabase
      .from("bird_foods")
      .select("id,bird_id,name,name_en,category,benefits,benefits_en,note,note_en,sort_order")
      .eq("content_status", "published")
      .order("sort_order"),
    supabase
      .from("toxic_entries")
      .select("id,bird_id,name,name_en,status,explanation,explanation_en,sort_order")
      .eq("content_status", "published")
      .order("sort_order"),
    supabase
      .from("portion_rules")
      .select(
        "id,bird_id,size,condition,grams,teaspoon,teaspoon_en,morning,morning_en,evening,evening_en,sort_order",
      )
      .eq("content_status", "published")
      .order("sort_order"),
    supabase
      .from("recipes")
      .select("id,bird_id,title,title_en,purpose,purpose_en,sort_order")
      .eq("content_status", "published")
      .order("sort_order"),
    supabase
      .from("recipe_ingredients")
      .select("recipe_id,sort_order,ingredient,ingredient_en")
      .order("sort_order"),
    supabase
      .from("recipe_steps")
      .select("recipe_id,sort_order,instruction,instruction_en")
      .order("sort_order"),
  ]);

  const featureRows = assertRows<FeatureRow>(featureResult, "daftar fitur");
  const birdRows = assertRows<BirdRow>(birdResult, "data burung");
  const foodRows = assertRows<FoodRow>(foodResult, "data makanan");
  const toxicRows = assertRows<ToxicRow>(toxicResult, "data Toxic Checker");
  const portionRows = assertRows<PortionRow>(portionResult, "aturan porsi");
  const recipeRows = assertRows<RecipeRow>(recipeResult, "data resep");
  const ingredientRows = assertRows<IngredientRow>(ingredientResult, "bahan resep");
  const stepRows = assertRows<StepRow>(stepResult, "langkah resep");

  if (birdRows.length === 0) {
    throw new Error("Tabel birds tidak berisi data aktif yang dapat dibaca.");
  }

  const foodsByBird = groupBy(foodRows, (row) => row.bird_id);
  const toxicByBird = groupBy(
    toxicRows.filter((row) => row.bird_id !== null),
    (row) => row.bird_id as string,
  );
  const portionsByBird = groupBy(portionRows, (row) => row.bird_id);
  const recipesByBird = groupBy(recipeRows, (row) => row.bird_id);
  const ingredientsByRecipe = groupBy(ingredientRows, (row) => row.recipe_id);
  const stepsByRecipe = groupBy(stepRows, (row) => row.recipe_id);
  const commonToxic = toxicRows.filter((row) => row.bird_id === null);

  const features: AppFeature[] = featureRows
    .filter((row) => isFeatureId(row.id))
    .map((row) => ({
      id: row.id as FeatureId,
      label: row.label,
      shortLabel: row.short_label,
      description: row.description,
      iconKey: row.icon_key,
      sortOrder: row.sort_order,
    }));

  const birds: Bird[] = birdRows.map((birdRow) => {
    const birdSpecificToxic = toxicByBird.get(birdRow.id) ?? [];
    const overrideNames = new Set(
      birdSpecificToxic.map((row) => row.name.toLocaleLowerCase("id-ID")),
    );
    const mergedToxic = [
      ...commonToxic.filter((row) => !overrideNames.has(row.name.toLocaleLowerCase("id-ID"))),
      ...birdSpecificToxic,
    ].sort((left, right) => left.sort_order - right.sort_order);

    return {
      id: birdRow.id,
      name: birdRow.name,
      nameEn: optionalText(birdRow.name_en),
      emoji: birdRow.emoji,
      imageUrl: birdRow.image_url ?? undefined,
      scientific: birdRow.scientific_name,
      description: birdRow.description,
      descriptionEn: optionalText(birdRow.description_en),
      foods: (foodsByBird.get(birdRow.id) ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        nameEn: optionalText(row.name_en),
        category: row.category,
        benefits: row.benefits ?? [],
        benefitsEn: row.benefits_en ?? [],
        note: optionalText(row.note),
        noteEn: optionalText(row.note_en),
      })),
      toxic: mergedToxic.map((row) => ({
        id: row.id,
        name: row.name,
        nameEn: optionalText(row.name_en),
        status: row.status,
        explanation: row.explanation,
        explanationEn: optionalText(row.explanation_en),
      })),
      portions: (portionsByBird.get(birdRow.id) ?? []).map((row) => ({
        id: row.id,
        size: row.size,
        condition: row.condition,
        grams: Number(row.grams),
        teaspoon: row.teaspoon,
        teaspoonEn: optionalText(row.teaspoon_en),
        morning: row.morning,
        morningEn: optionalText(row.morning_en),
        evening: row.evening,
        eveningEn: optionalText(row.evening_en),
      })),
      recipes: (recipesByBird.get(birdRow.id) ?? []).map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        titleEn: optionalText(recipe.title_en),
        purpose: recipe.purpose,
        purposeEn: optionalText(recipe.purpose_en),
        ingredients: (ingredientsByRecipe.get(recipe.id) ?? []).map((row) => row.ingredient),
        ingredientsEn: (ingredientsByRecipe.get(recipe.id) ?? []).map(
          (row) => optionalText(row.ingredient_en) ?? "",
        ),
        steps: (stepsByRecipe.get(recipe.id) ?? []).map((row) => row.instruction),
        stepsEn: (stepsByRecipe.get(recipe.id) ?? []).map(
          (row) => optionalText(row.instruction_en) ?? "",
        ),
      })),
    };
  });

  const content = { birds, features };
  memoryCache = { expiresAt: Date.now() + CACHE_TTL_MS, content };
  writeSessionCache(content);
  return content;
}
