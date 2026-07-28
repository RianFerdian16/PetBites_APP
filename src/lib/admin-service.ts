import type { Session } from "@supabase/supabase-js";

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
  for (const row of ingredients.data ?? []) {
    const current = ingredientsByRecipe.get(row.recipe_id) ?? [];
    current.push(row.ingredient);
    ingredientsByRecipe.set(row.recipe_id, current);
  }

  const stepsByRecipe = new Map<string, string[]>();
  for (const row of steps.data ?? []) {
    const current = stepsByRecipe.get(row.recipe_id) ?? [];
    current.push(row.instruction);
    stepsByRecipe.set(row.recipe_id, current);
  }

  return {
    birds: (birds.data ?? []) as AdminRecord[],
    bird_foods: (foods.data ?? []) as AdminRecord[],
    toxic_entries: (toxic.data ?? []) as AdminRecord[],
    portion_rules: (portions.data ?? []) as AdminRecord[],
    recipes: (recipes.data ?? []).map((row) => ({
      ...row,
      ingredients: ingredientsByRecipe.get(row.id) ?? [],
      steps: stepsByRecipe.get(row.id) ?? [],
    })) as AdminRecord[],
    bird_requests: (requests.data ?? []) as AdminRecord[],
  };
}

export async function saveAdminRecord(entity: AdminEntity, record: AdminRecord) {
  const supabase = getSupabaseClient();
  const payload = { ...record };
  delete payload.created_at;
  delete payload.updated_at;
  delete payload.ingredients;
  delete payload.steps;

  if (entity === "recipes") {
    const ingredients = normalizeLines(record.ingredients);
    const steps = normalizeLines(record.steps);
    const { error: recipeError } = await supabase
      .from("recipes")
      .upsert(payload, { onConflict: "id" });
    if (recipeError) throw recipeError;

    const [{ error: ingredientDeleteError }, { error: stepDeleteError }] = await Promise.all([
      supabase.from("recipe_ingredients").delete().eq("recipe_id", record.id),
      supabase.from("recipe_steps").delete().eq("recipe_id", record.id),
    ]);
    if (ingredientDeleteError) throw ingredientDeleteError;
    if (stepDeleteError) throw stepDeleteError;

    if (ingredients.length > 0) {
      const { error } = await supabase.from("recipe_ingredients").insert(
        ingredients.map((ingredient, index) => ({
          recipe_id: record.id,
          sort_order: index + 1,
          ingredient,
        })),
      );
      if (error) throw error;
    }

    if (steps.length > 0) {
      const { error } = await supabase.from("recipe_steps").insert(
        steps.map((instruction, index) => ({
          recipe_id: record.id,
          sort_order: index + 1,
          instruction,
        })),
      );
      if (error) throw error;
    }
  } else {
    const { error } = await supabase.from(entity).upsert(payload, { onConflict: "id" });
    if (error) throw error;
  }

  if (entity !== "bird_requests") clearPetBitesCache();
}

export async function deleteAdminRecord(entity: AdminEntity, id: string) {
  const { error } = await getSupabaseClient().from(entity).delete().eq("id", id);
  if (error) throw error;
  if (entity !== "bird_requests") clearPetBitesCache();
}

export async function uploadBirdMedia(file: File, slug: string) {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > 6 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 6 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
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
  if (error) throw error;
  if (!data || typeof data !== "object") throw new Error("Respons AI tidak valid.");
  return data as { suggestion?: Record<string, unknown>; text?: string; model?: string };
}

function normalizeLines(value: unknown): string[] {
  if (Array.isArray(value))
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
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
