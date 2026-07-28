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

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const model = Deno.env.get("OPENAI_MODEL") || "gpt-5";
    if (!supabaseUrl || !publishableKey)
      throw new Error("Supabase function environment is incomplete.");
    if (!openAiKey)
      return json({ error: "OPENAI_API_KEY belum diatur di Edge Function Secrets." }, 503);

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
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions:
          "You are the private PetBites CMS content assistant. Produce conservative, evidence-aware bird nutrition drafts and review public bird requests. Never present medical or veterinary certainty. Never invent source URLs. A human admin must review every suggestion before publishing. Return valid JSON only, without markdown fences.",
        input: prompt,
      }),
    });

    const raw = await aiResponse.json();
    if (!aiResponse.ok) {
      console.error("OpenAI error", raw);
      return json({ error: raw?.error?.message || "AI provider request failed" }, 502);
    }

    const outputText = extractOutputText(raw);
    const parsed = parseJsonObject(outputText);
    await supabase.from("content_audit_log").insert({
      actor_id: userData.user.id,
      table_name: entity,
      record_id: String(draft.id ?? "new"),
      action: "ai_generate",
      new_data: { action, model },
    });

    return json({
      suggestion: parsed?.suggestion ?? parsed ?? null,
      text: parsed?.text ?? (parsed ? "" : outputText),
      model,
    });
  } catch (error) {
    console.error(error);
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

function extractOutputText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;
  const output = Array.isArray(response.output) ? response.output : [];
  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content)
      ? (item as { content: unknown[] }).content
      : [];
    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        parts.push((part as { text: string }).text);
      }
    }
  }
  return parts.join("\n");
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
