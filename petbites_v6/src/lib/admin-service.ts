import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { clearPetBitesCache } from "@/lib/bird-service";
import { getSupabaseClient } from "@/lib/supabase";

export type AdminRole = "owner" | "editor" | "reviewer";
export type ContentStatus = "draft" | "review" | "published" | "archived";
export type ReviewStatus = "needs_review" | "reviewed" | "archived";
export type AdminEntity =
  "birds" | "bird_foods" | "toxic_entries" | "portion_rules" | "recipes" | "bird_requests";

export type AdminProfile = {
  user_id: string;
  email: string | null;
  role: AdminRole;
};

export type AdminRecord = Record<string, unknown> & { id: string };

export type AdminData = {
  birds: AdminRecord[];
  bird_foods: AdminRecord[];
  toxic_entries: AdminRecord[];
  portion_rules: AdminRecord[];
  recipes: AdminRecord[];
  bird_requests: AdminRecord[];
};

export type AiAction = "draft" | "improve" | "translate" | "review";

type SaveAdminRecordOptions = {
  isNew?: boolean;
};

const ENTITY_COLUMNS: Record<AdminEntity, ReadonlySet<string>> = {
  birds: new Set([
    "id",
    "name",
    "name_en",
    "emoji",
    "image_url",
    "scientific_name",
    "description",
    "description_en",
    "sort_order",
    "is_active",
    "review_status",
    "source_urls",
    "content_status",
    "ai_generated",
    "ai_model",
    "ai_generated_at",
  ]),
  bird_foods: new Set([
    "id",
    "bird_id",
    "name",
    "name_en",
    "category",
    "benefits",
    "benefits_en",
    "note",
    "note_en",
    "sort_order",
    "review_status",
    "source_urls",
    "content_status",
    "ai_generated",
    "ai_model",
    "ai_generated_at",
  ]),
  toxic_entries: new Set([
    "id",
    "bird_id",
    "name",
    "name_en",
    "status",
    "explanation",
    "explanation_en",
    "sort_order",
    "review_status",
    "source_urls",
    "content_status",
    "ai_generated",
    "ai_model",
    "ai_generated_at",
  ]),
  portion_rules: new Set([
    "id",
    "bird_id",
    "size",
    "condition",
    "grams",
    "teaspoon",
    "teaspoon_en",
    "morning",
    "morning_en",
    "evening",
    "evening_en",
    "sort_order",
    "review_status",
    "source_urls",
    "content_status",
    "ai_generated",
    "ai_model",
    "ai_generated_at",
  ]),
  recipes: new Set([
    "id",
    "bird_id",
    "title",
    "title_en",
    "purpose",
    "purpose_en",
    "sort_order",
    "review_status",
    "source_urls",
    "content_status",
    "ai_generated",
    "ai_model",
    "ai_generated_at",
  ]),
  bird_requests: new Set([
    "id",
    "bird_name",
    "local_name",
    "scientific_name",
    "reason",
    "contact",
    "status",
    "admin_notes",
  ]),
};

export async function getAdminSession(): Promise<Session | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return data.session;
}

export function subscribeToAdminAuth(callback: (session: Session | null) => void) {
  const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) =>
    callback(session),
  );
  return () => data.subscription.unsubscribe();
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOutAdmin() {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}

export async function fetchAdminProfile(userId: string): Promise<AdminProfile | null> {
  const { data, error } = await getSupabaseClient()
    .from("admin_users")
    .select("user_id,email,role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as AdminProfile | null;
}

export async function fetchAdminData(): Promise<AdminData> {
  const supabase = getSupabaseClient();
  const [birds, foods, toxic, portions, recipes, ingredients, steps, requests] = await Promise.all([
    supabase.from("birds").select("*").order("sort_order"),
    supabase.from("bird_foods").select("*").order("sort_order"),
    supabase.from("toxic_entries").select("*").order("sort_order"),
    supabase.from("portion_rules").select("*").order("sort_order"),
    supabase.from("recipes").select("*").order("sort_order"),
    supabase.from("recipe_ingredients").select("*").order("sort_order"),
    supabase.from("recipe_steps").select("*").order("sort_order"),
    supabase.from("bird_requests").select("*").order("created_at", { ascending: false }),
  ]);

  const firstError = [birds, foods, toxic, portions, recipes, ingredients, steps, requests].find(
    (result) => result.error,
  )?.error;
  if (firstError) throw firstError;

  const ingredientsByRecipe = new Map<string, string[]>();
  const ingredientsEnByRecipe = new Map<string, string[]>();
  for (const row of ingredients.data ?? []) {
    const current = ingredientsByRecipe.get(row.recipe_id) ?? [];
    current.push(row.ingredient);
    ingredientsByRecipe.set(row.recipe_id, current);

    const currentEn = ingredientsEnByRecipe.get(row.recipe_id) ?? [];
    currentEn.push(row.ingredient_en ?? "");
    ingredientsEnByRecipe.set(row.recipe_id, currentEn);
  }

  const stepsByRecipe = new Map<string, string[]>();
  const stepsEnByRecipe = new Map<string, string[]>();
  for (const row of steps.data ?? []) {
    const current = stepsByRecipe.get(row.recipe_id) ?? [];
    current.push(row.instruction);
    stepsByRecipe.set(row.recipe_id, current);

    const currentEn = stepsEnByRecipe.get(row.recipe_id) ?? [];
    currentEn.push(row.instruction_en ?? "");
    stepsEnByRecipe.set(row.recipe_id, currentEn);
  }

  return {
    birds: (birds.data ?? []) as AdminRecord[],
    bird_foods: (foods.data ?? []) as AdminRecord[],
    toxic_entries: (toxic.data ?? []) as AdminRecord[],
    portion_rules: (portions.data ?? []) as AdminRecord[],
    recipes: (recipes.data ?? []).map((row) => ({
      ...row,
      ingredients: ingredientsByRecipe.get(row.id) ?? [],
      ingredients_en: ingredientsEnByRecipe.get(row.id) ?? [],
      steps: stepsByRecipe.get(row.id) ?? [],
      steps_en: stepsEnByRecipe.get(row.id) ?? [],
    })) as AdminRecord[],
    bird_requests: (requests.data ?? []) as AdminRecord[],
  };
}

export async function saveAdminRecord(
  entity: AdminEntity,
  record: AdminRecord,
  options: SaveAdminRecordOptions = {},
) {
  const supabase = getSupabaseClient();
  const ingredients = entity === "recipes" ? normalizeLines(record.ingredients) : [];
  const ingredientsEn =
    entity === "recipes" ? normalizeLinesPreserveEmpty(record.ingredients_en) : [];
  const steps = entity === "recipes" ? normalizeLines(record.steps) : [];
  const stepsEn = entity === "recipes" ? normalizeLinesPreserveEmpty(record.steps_en) : [];

  const normalized: Record<string, unknown> = { ...record };
  if (entity === "bird_foods") {
    normalized.benefits = normalizeLines(record.benefits);
    normalized.benefits_en = normalizeLinesPreserveEmpty(record.benefits_en);
  }
  if (entity !== "bird_requests") normalized.source_urls = normalizeLines(record.source_urls);

  const payload = pickAllowedColumns(entity, normalized);

  if (entity === "recipes") {
    await saveRecipeRecord(
      supabase,
      payload,
      record.id,
      ingredients,
      ingredientsEn,
      steps,
      stepsEn,
      Boolean(options.isNew),
    );
  } else {
    const query = options.isNew
      ? supabase.from(entity).insert(payload)
      : supabase.from(entity).update(payload).eq("id", record.id);
    const { data, error } = await query.select("id").maybeSingle();
    if (error) throw error;
    if (!data) {
      throw new Error(
        options.isNew
          ? "Data baru tidak berhasil dibuat. Periksa izin database lalu coba lagi."
          : "Data ini tidak ditemukan lagi di database. Muat ulang daftar sebelum menyimpan.",
      );
    }
  }

  if (entity !== "bird_requests") clearPetBitesCache();
}

async function saveRecipeRecord(
  supabase: SupabaseClient,
  payload: Record<string, unknown>,
  recipeId: string,
  ingredients: string[],
  ingredientsEn: string[],
  steps: string[],
  stepsEn: string[],
  isNew: boolean,
) {
  let previousRecipe: Record<string, unknown> | null = null;
  let previousIngredients: Array<Record<string, unknown>> = [];
  let previousSteps: Array<Record<string, unknown>> = [];

  if (!isNew) {
    const [recipeResult, ingredientResult, stepResult] = await Promise.all([
      supabase.from("recipes").select("*").eq("id", recipeId).maybeSingle(),
      supabase
        .from("recipe_ingredients")
        .select("recipe_id,sort_order,ingredient,ingredient_en")
        .eq("recipe_id", recipeId)
        .order("sort_order"),
      supabase
        .from("recipe_steps")
        .select("recipe_id,sort_order,instruction,instruction_en")
        .eq("recipe_id", recipeId)
        .order("sort_order"),
    ]);

    const firstError = [recipeResult, ingredientResult, stepResult].find(
      (result) => result.error,
    )?.error;
    if (firstError) throw firstError;
    if (!recipeResult.data) {
      throw new Error("Resep ini tidak ditemukan lagi di database. Muat ulang sebelum menyimpan.");
    }

    previousRecipe = recipeResult.data as Record<string, unknown>;
    previousIngredients = (ingredientResult.data ?? []) as Array<Record<string, unknown>>;
    previousSteps = (stepResult.data ?? []) as Array<Record<string, unknown>>;
  }

  try {
    const desiredStatus = payload.content_status;
    const stagedPayload =
      desiredStatus === "published" ? { ...payload, content_status: "draft" } : payload;
    const parentQuery = isNew
      ? supabase.from("recipes").insert(stagedPayload)
      : supabase.from("recipes").update(stagedPayload).eq("id", recipeId);
    const { data: savedRecipe, error: recipeError } = await parentQuery.select("id").maybeSingle();
    if (recipeError) throw recipeError;
    if (!savedRecipe) {
      throw new Error(
        isNew
          ? "Resep baru tidak berhasil dibuat."
          : "Resep ini tidak ditemukan lagi saat proses simpan.",
      );
    }

    const { error: ingredientDeleteError } = await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", recipeId);
    if (ingredientDeleteError) throw ingredientDeleteError;

    const { error: stepDeleteError } = await supabase
      .from("recipe_steps")
      .delete()
      .eq("recipe_id", recipeId);
    if (stepDeleteError) throw stepDeleteError;

    if (ingredients.length > 0) {
      const { error } = await supabase.from("recipe_ingredients").insert(
        ingredients.map((ingredient, index) => ({
          recipe_id: recipeId,
          sort_order: index + 1,
          ingredient,
          ingredient_en: ingredientsEn[index] || null,
        })),
      );
      if (error) throw error;
    }

    if (steps.length > 0) {
      const { error } = await supabase.from("recipe_steps").insert(
        steps.map((instruction, index) => ({
          recipe_id: recipeId,
          sort_order: index + 1,
          instruction,
          instruction_en: stepsEn[index] || null,
        })),
      );
      if (error) throw error;
    }

    if (desiredStatus === "published") {
      const { data, error } = await supabase
        .from("recipes")
        .update({ content_status: "published" })
        .eq("id", recipeId)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Resep tidak ditemukan saat proses publish.");
    }
  } catch (error) {
    const rollbackError = await rollbackRecipeSave(
      supabase,
      recipeId,
      isNew,
      previousRecipe,
      previousIngredients,
      previousSteps,
    );

    if (rollbackError) {
      throw new Error(
        `${errorMessage(error)} Pemulihan data lama juga gagal: ${errorMessage(rollbackError)}`,
      );
    }
    throw error;
  }
}

async function rollbackRecipeSave(
  supabase: SupabaseClient,
  recipeId: string,
  isNew: boolean,
  previousRecipe: Record<string, unknown> | null,
  previousIngredients: Array<Record<string, unknown>>,
  previousSteps: Array<Record<string, unknown>>,
) {
  try {
    if (isNew) {
      const { error } = await supabase.from("recipes").delete().eq("id", recipeId);
      if (error) throw error;
      return null;
    }

    if (!previousRecipe) return null;

    const previousPayload = pickAllowedColumns("recipes", previousRecipe);
    const previousStatus = previousPayload.content_status;
    const { error: stageError } = await supabase
      .from("recipes")
      .update({ ...previousPayload, content_status: "draft" })
      .eq("id", recipeId);
    if (stageError) throw stageError;

    const { error: ingredientDeleteError } = await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", recipeId);
    if (ingredientDeleteError) throw ingredientDeleteError;

    const { error: stepDeleteError } = await supabase
      .from("recipe_steps")
      .delete()
      .eq("recipe_id", recipeId);
    if (stepDeleteError) throw stepDeleteError;

    if (previousIngredients.length > 0) {
      const { error } = await supabase.from("recipe_ingredients").insert(previousIngredients);
      if (error) throw error;
    }

    if (previousSteps.length > 0) {
      const { error } = await supabase.from("recipe_steps").insert(previousSteps);
      if (error) throw error;
    }

    const { error: parentError } = await supabase
      .from("recipes")
      .update({ ...previousPayload, content_status: previousStatus })
      .eq("id", recipeId);
    if (parentError) throw parentError;

    return null;
  } catch (error) {
    return error;
  }
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String(error.message);
  return "Kesalahan database tidak diketahui.";
}

export async function deleteAdminRecord(entity: AdminEntity, id: string) {
  const { data, error } = await getSupabaseClient()
    .from(entity)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Data ini tidak ditemukan atau tidak dapat dihapus.");
  if (entity !== "bird_requests") clearPetBitesCache();
}

const BIRD_MEDIA_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadBirdMedia(file: File, slug: string) {
  const extension = BIRD_MEDIA_EXTENSIONS[file.type];
  if (!extension) throw new Error("Format gambar harus PNG, JPG, atau WebP.");
  if (file.size <= 0) throw new Error("File gambar kosong atau rusak.");
  if (file.size > 6 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 6 MB.");

  const safeSlug = slugify(slug || "bird");
  const path = `${safeSlug}/${Date.now()}.${extension}`;
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from("bird-media").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("bird-media").getPublicUrl(path);
  return data.publicUrl;
}

export async function requestAiSuggestion(input: {
  action: AiAction;
  entity: AdminEntity;
  draft: Record<string, unknown>;
  instruction?: string;
}) {
  const { data, error } = await getSupabaseClient().functions.invoke("petbites-ai", {
    body: input,
  });

  if (error) throw new Error(await readFunctionError(error));
  if (!data || typeof data !== "object") throw new Error("Respons AI tidak valid.");

  return data as {
    suggestion?: Record<string, unknown> | null;
    text?: string;
    model?: string;
  };
}

function pickAllowedColumns(entity: AdminEntity, record: Record<string, unknown>) {
  const allowed = ENTITY_COLUMNS[entity];
  return Object.fromEntries(
    Object.entries(record).filter(([key, value]) => allowed.has(key) && value !== undefined),
  );
}

async function readFunctionError(error: unknown) {
  const fallback =
    error instanceof Error ? error.message : "Edge Function gagal memproses permintaan AI.";
  if (!error || typeof error !== "object" || !("context" in error)) return fallback;

  const context = (error as { context?: unknown }).context;
  if (!context || typeof context !== "object") return fallback;

  try {
    if ("clone" in context && typeof context.clone === "function") {
      const response = context.clone() as Response;
      const body = (await response.json()) as { error?: unknown; message?: unknown };
      return String(body.error ?? body.message ?? fallback);
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function normalizeLinesPreserveEmpty(value: unknown): string[] {
  const source = Array.isArray(value)
    ? value.map(String)
    : typeof value === "string"
      ? value.split(/\r?\n/)
      : [];
  return source.map((item) => item.trim());
}

function normalizeLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
