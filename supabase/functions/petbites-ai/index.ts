import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

const systemInstruction = [
  "You are the private PetBites CMS content assistant.",
  "Produce conservative, evidence-aware bird nutrition drafts and review public bird requests.",
  "Never present medical or veterinary certainty.",
  "Never invent source URLs.",
  "A human admin must review every suggestion before publishing.",
  "Return valid JSON only, without markdown fences.",
].join(" ");

type GeminiResponse = {
  error?: { message?: string };
  candidates?: Array<{
    finishReason?: string;
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey =
      Deno.env.get("SUPABASE_ANON_KEY") ||
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ||
      readDefaultNamedKey("SUPABASE_PUBLISHABLE_KEYS");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";

    if (!supabaseUrl || !publishableKey) {
      throw new Error("Supabase function environment is incomplete.");
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
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (adminError || !admin) return json({ error: "Admin access required" }, 403);

    const body = await request.json();
    const entity = String(body.entity ?? "");
    const action = String(body.action ?? "");
    const draft = body.draft && typeof body.draft === "object" ? body.draft : {};
    const instruction = String(body.instruction ?? "").slice(0, 2000);
    if (!allowedEntities.has(entity) || !allowedActions.has(action)) {
      return json({ error: "Invalid AI request" }, 400);
    }

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
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
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
          error: raw.error?.message || "Gemini API request failed",
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
            ? `Gemini tidak menghasilkan teks. Finish reason: ${finishReason}`
            : "Gemini tidak menghasilkan respons teks.",
        },
        502,
      );
    }

    const parsed = parseJsonObject(outputText);
    await supabase.from("content_audit_log").insert({
      actor_id: userData.user.id,
      table_name: entity,
      record_id: String(draft.id ?? "new"),
      action: "ai_generate",
      new_data: { action, model, provider: "gemini" },
    });

    return json({
      suggestion: parsed?.suggestion ?? parsed ?? null,
      text: parsed?.text ?? (parsed ? "" : outputText),
      model,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof DOMException && error.name === "AbortError") {
      return json({ error: "Gemini terlalu lama merespons. Coba lagi." }, 504);
    }
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function buildPrompt(input: {
  entity: string;
  action: string;
  draft: Record<string, unknown>;
  instruction: string;
}) {
  const actionGuide: Record<string, string> = {
    draft: "Complete missing fields with a cautious Indonesian draft.",
    improve: "Improve clarity, consistency, and readability while preserving factual boundaries.",
    translate:
      "Translate human-readable content fields into natural English. Keep IDs, enums, URLs, and numeric fields unchanged.",
    review:
      "Review the draft for missing evidence, unsafe certainty, contradictions, spam, and duplicate-looking content. Do not rewrite unless necessary.",
  };

  return JSON.stringify({
    task: actionGuide[input.action],
    entity: input.entity,
    current_draft: input.draft,
    additional_instruction: input.instruction || null,
    output_contract: {
      suggestion:
        input.entity === "bird_requests"
          ? "object containing only bird_name, local_name, scientific_name, status, and admin_notes"
          : "object containing only fields relevant to this entity",
      text: "short reviewer note in Indonesian",
    },
    safety_rules: [
      "Never fabricate veterinary claims or precise dosage claims.",
      "Never fabricate source URLs.",
      "When evidence is uncertain, keep content_status as review and review_status as needs_review.",
      "For toxic entries, prefer caution over unsupported safe claims.",
      "For bird requests, never mark approved solely from the request; prefer reviewing and explain what must be verified.",
    ],
  });
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
