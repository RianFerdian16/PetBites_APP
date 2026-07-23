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
  emoji: string;
  image_url: string | null;
  scientific_name: string;
  description: string;
  sort_order: number;
};

type FoodRow = {
  id: string;
  bird_id: string;
  name: string;
  category: "main" | "extra";
  benefits: string[] | null;
  note: string | null;
  sort_order: number;
};

type ToxicRow = {
  id: string;
  bird_id: string | null;
  name: string;
  status: Safety;
  explanation: string;
  sort_order: number;
};

type PortionRow = {
  id: string;
  bird_id: string;
  size: BirdSize;
  condition: BirdCondition;
  grams: number | string;
  teaspoon: string;
  morning: string;
  evening: string;
  sort_order: number;
};

type RecipeRow = {
  id: string;
  bird_id: string;
  title: string;
  purpose: string;
  sort_order: number;
};

type IngredientRow = {
  recipe_id: string;
  sort_order: number;
  ingredient: string;
};

type StepRow = {
  recipe_id: string;
  sort_order: number;
  instruction: string;
};

type FetchOptions = {
  force?: boolean;
};

const CACHE_KEY = "petbites:content:v2";
const CACHE_TTL_MS = 5 * 60 * 1000;
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

function readSessionCache(): PetBitesContent | null {
  if (typeof window === "undefined") return null;

  try {
    const serialized = window.sessionStorage.getItem(CACHE_KEY);
    if (!serialized) return null;

    const parsed = JSON.parse(serialized) as {
      expiresAt?: number;
      content?: PetBitesContent;
    };

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
    // Storage can be unavailable in private mode. The in-memory cache still works.
  }
}

export function clearPetBitesCache() {
  memoryCache = null;
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Cache invalidation still succeeds in memory when storage is blocked.
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
      .order("sort_order"),
    supabase
      .from("birds")
      .select("id,name,emoji,image_url,scientific_name,description,sort_order")
      .order("sort_order"),
    supabase
      .from("bird_foods")
      .select("id,bird_id,name,category,benefits,note,sort_order")
      .order("sort_order"),
    supabase
      .from("toxic_entries")
      .select("id,bird_id,name,status,explanation,sort_order")
      .order("sort_order"),
    supabase
      .from("portion_rules")
      .select("id,bird_id,size,condition,grams,teaspoon,morning,evening,sort_order")
      .order("sort_order"),
    supabase.from("recipes").select("id,bird_id,title,purpose,sort_order").order("sort_order"),
    supabase
      .from("recipe_ingredients")
      .select("recipe_id,sort_order,ingredient")
      .order("sort_order"),
    supabase.from("recipe_steps").select("recipe_id,sort_order,instruction").order("sort_order"),
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
      emoji: birdRow.emoji,
      imageUrl: birdRow.image_url ?? undefined,
      scientific: birdRow.scientific_name,
      description: birdRow.description,
      foods: (foodsByBird.get(birdRow.id) ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        benefits: row.benefits ?? [],
        note: row.note ?? undefined,
      })),
      toxic: mergedToxic.map((row) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        explanation: row.explanation,
      })),
      portions: (portionsByBird.get(birdRow.id) ?? []).map((row) => ({
        id: row.id,
        size: row.size,
        condition: row.condition,
        grams: Number(row.grams),
        teaspoon: row.teaspoon,
        morning: row.morning,
        evening: row.evening,
      })),
      recipes: (recipesByBird.get(birdRow.id) ?? []).map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        purpose: recipe.purpose,
        ingredients: (ingredientsByRecipe.get(recipe.id) ?? []).map((row) => row.ingredient),
        steps: (stepsByRecipe.get(recipe.id) ?? []).map((row) => row.instruction),
      })),
    };
  });

  const content = { birds, features };
  memoryCache = { expiresAt: Date.now() + CACHE_TTL_MS, content };
  writeSessionCache(content);
  return content;
}
