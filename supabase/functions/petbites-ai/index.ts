import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedEntities = new Set([
  "birds",
  "bird_foods",
  "toxic_entries",
  "portion_rules",
  "recipes",
  "bird_requests",
]);
const allowedActions = new Set(["draft", "improve", "translate", "review"]);

const editableFields: Record<string, string[]> = {
  birds: ["name", "emoji", "scientific_name", "description"],
  bird_foods: ["name", "category", "benefits", "note"],
  toxic_entries: ["name", "status", "explanation"],
  portion_rules: ["size", "condition", "grams", "teaspoon", "morning", "evening"],
  recipes: ["title", "purpose", "ingredients", "steps"],
  bird_requests: ["bird_name", "local_name", "scientific_name", "admin_notes", "status"],
};

const readableFields: Record<string, string[]> = {
  birds: ["name", "scientific_name", "description"],
  bird_foods: ["name", "category", "benefits", "note"],
  toxic_entries: ["name", "status", "explanation"],
  portion_rules: ["size", "condition", "grams", "teaspoon", "morning", "evening"],
  recipes: ["title", "purpose", "ingredients", "steps"],
  bird_requests: ["bird_name", "local_name", "scientific_name", "reason", "admin_notes", "status"],
};

const systemInstruction = [
  "You are the private PetBites CMS content assistant.",
  "Write concise, natural Indonesian unless the task is translation.",
  "Be conservative and evidence-aware about bird care and nutrition.",
  "Never invent source URLs, medical certainty, veterinary diagnoses, or precise dosage claims.",
  "Never change IDs, relations, publication status, contact details, image URLs, sort order, or sources.",
  "A human admin must review every suggestion before saving or publishing.",
  "Return valid JSON only, without markdown fences.",
].join(" ");

type GeminiResponse = {
  error?: { message?: string };
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

type ParsedOutput = {
  suggestion?: Record<string, unknown> | null;
  text?: unknown;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Sesi admin tidak ditemukan. Login ulang." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey =
      Deno.env.get("SUPABASE_ANON_KEY") ||
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ||
      readDefaultNamedKey("SUPABASE_PUBLISHABLE_KEYS");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash-lite";

    if (!supabaseUrl || !publishableKey) {
      throw new Error("Konfigurasi Supabase Edge Function belum lengkap.");
    }
    if (!geminiKey) {
      return json({ error: "GEMINI_API_KEY belum diatur di Edge Function Secrets." }, 503);
    }

    const supabase = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });

    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return json({ error: "Sesi admin sudah tidak valid. Logout lalu login kembali." }, 401);
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (adminError || !admin) return json({ error: "Akses admin diperlukan." }, 403);

    const body = await request.json();
    const entity = String(body.entity ?? "");
    const action = String(body.action ?? "");
    if (!allowedEntities.has(entity) || !allowedActions.has(action)) {
      return json({ error: "Permintaan AI tidak valid." }, 400);
    }
    if (admin.role === "reviewer" && action !== "review") {
      return json({ error: "Role reviewer hanya boleh menjalankan pemeriksaan isi." }, 403);
    }

    const sourceDraft = body.draft && typeof body.draft === "object" ? body.draft : {};
    const draft = pickFields(sourceDraft as Record<string, unknown>, readableFields[entity]);
    const instruction = String(body.instruction ?? "")
      .trim()
      .slice(0, 1500);

    const prompt = buildPrompt({ entity, action, draft, instruction });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    const raw = (await geminiResponse.json()) as GeminiResponse;
    if (!geminiResponse.ok) {
      console.error("Gemini error", raw);
      return json(
        {
          error: raw.error?.message || "Gemini gagal memproses permintaan.",
          providerStatus: geminiResponse.status,
        },
        502,
      );
    }

    const outputText = extractGeminiText(raw);
    if (!outputText) {
      const finishReason = raw.candidates?.[0]?.finishReason;
      return json(
        {
          error: finishReason
            ? `Gemini tidak menghasilkan teks. Alasan: ${finishReason}`
            : "Gemini tidak menghasilkan respons teks.",
        },
        502,
      );
    }

    const parsed = parseJsonObject(outputText) as ParsedOutput | null;
    if (!parsed)
      return json({ error: "Format respons Gemini tidak dapat dibaca. Coba lagi." }, 502);

    const suggestion =
      action === "draft" || action === "improve"
        ? sanitizeSuggestion(entity, parsed.suggestion)
        : null;
    const text = String(parsed.text ?? "")
      .trim()
      .slice(0, 8000);

    const { error: auditError } = await supabase.from("content_audit_log").insert({
      actor_id: userData.user.id,
      table_name: entity,
      record_id: String((sourceDraft as Record<string, unknown>).id ?? "new"),
      action: "ai_generate",
      new_data: { action, model, provider: "gemini" },
    });
    if (auditError) console.error("Audit log error", auditError);

    return json({ suggestion, text, model });
  } catch (error) {
    console.error(error);
    if (error instanceof DOMException && error.name === "AbortError") {
      return json({ error: "Gemini terlalu lama merespons. Coba lagi." }, 504);
    }
    return json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server." },
      500,
    );
  }
});

function buildPrompt(input: {
  entity: string;
  action: string;
  draft: Record<string, unknown>;
  instruction: string;
}) {
  const fields = editableFields[input.entity];
  const actionGuide: Record<string, string> = {
    draft:
      "Create a cautious first draft only for missing or weak editable fields. Preserve usable existing facts.",
    improve:
      "Improve clarity and readability of existing editable fields without adding unsupported facts.",
    translate:
      "Translate the human-readable content into natural English. Return the translation in text only.",
    review:
      "Review completeness, contradictions, unsafe certainty, and claims needing verification. Return advice in Indonesian text only.",
  };

  const outputContract =
    input.action === "draft" || input.action === "improve"
      ? {
          suggestion: `object containing only these keys when relevant: ${fields.join(", ")}`,
          text: "a short Indonesian explanation of what was changed and what still needs human verification",
        }
      : {
          suggestion: null,
          text:
            input.action === "translate"
              ? "the complete natural English version"
              : "a clear Indonesian review with actionable points",
        };

  return JSON.stringify({
    task: actionGuide[input.action],
    entity: input.entity,
    current_draft: input.draft,
    additional_instruction: input.instruction || null,
    output_contract: outputContract,
    strict_rules: [
      `For suggestions, never use fields outside: ${fields.join(", ")}.`,
      "Never produce source_urls or invent references.",
      "Never change id, bird_id, contact, reason, image_url, sort_order, content_status, or review_status.",
      "For bird_requests, status may only be pending, reviewing, rejected, or duplicate; never approved.",
      "For toxic_entries, status may only be safe, caution, or toxic.",
      "For bird_foods, category may only be main or extra.",
      "For portion_rules, size may only be Kecil, Standar, or Besar and condition may only be Harian, Mabung, or Ternak.",
    ],
  });
}

function sanitizeSuggestion(entity: string, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const allowed = new Set(editableFields[entity]);
  const result: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!allowed.has(key) || raw === undefined) continue;

    if (key === "benefits" || key === "ingredients" || key === "steps") {
      const items = normalizeTextList(raw);
      if (items.length > 0) result[key] = items;
      continue;
    }

    if (key === "grams") {
      const number = Number(raw);
      if (Number.isFinite(number) && number > 0) result[key] = number;
      continue;
    }

    if (key === "category") {
      if (raw === "main" || raw === "extra") result[key] = raw;
      continue;
    }

    if (key === "status" && entity === "toxic_entries") {
      if (raw === "safe" || raw === "caution" || raw === "toxic") result[key] = raw;
      continue;
    }

    if (key === "status" && entity === "bird_requests") {
      if (raw === "pending" || raw === "reviewing" || raw === "rejected" || raw === "duplicate") {
        result[key] = raw;
      }
      continue;
    }

    if (key === "size") {
      if (raw === "Kecil" || raw === "Standar" || raw === "Besar") result[key] = raw;
      continue;
    }

    if (key === "condition") {
      if (raw === "Harian" || raw === "Mabung" || raw === "Ternak") result[key] = raw;
      continue;
    }

    if (typeof raw === "string") {
      const cleaned = raw.trim().slice(0, 6000);
      if (cleaned) result[key] = cleaned;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

function pickFields(record: Record<string, unknown>, fields: string[]) {
  return Object.fromEntries(
    fields
      .filter((field) => field in record)
      .map((field) => [field, sanitizePromptValue(record[field])]),
  );
}

function sanitizePromptValue(value: unknown): unknown {
  if (typeof value === "string") return value.slice(0, 6000);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => String(item).slice(0, 500));
  return undefined;
}

function normalizeTextList(value: unknown) {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\r?\n/)
      : [];
  return source
    .map(String)
    .map((item) => item.trim().slice(0, 1000))
    .filter(Boolean)
    .slice(0, 50);
}

function readDefaultNamedKey(variableName: string) {
  const raw = Deno.env.get(variableName);
  if (!raw) return undefined;

  try {
    const keys = JSON.parse(raw) as Record<string, string>;
    return keys.default || Object.values(keys)[0];
  } catch {
    return undefined;
  }
}

function extractGeminiText(response: GeminiResponse) {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text ?? "")
    .filter(Boolean)
    .join("\n");
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  const cleaned = value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
