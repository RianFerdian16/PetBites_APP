import { getSupabaseClient } from "@/lib/supabase";

export type BirdRequestInput = {
  birdName: string;
  localName?: string;
  scientificName?: string;
  reason: string;
  contact?: string;
  website?: string;
};

export async function submitBirdRequest(input: BirdRequestInput) {
  const payload = {
    p_bird_name: clean(input.birdName, 120),
    p_local_name: nullable(input.localName, 120),
    p_scientific_name: nullable(input.scientificName, 160),
    p_reason: clean(input.reason, 1200),
    p_contact: nullable(input.contact, 180),
    p_website: nullable(input.website, 200),
  };

  const { data, error } = await getSupabaseClient().rpc("submit_bird_request", payload);
  if (error) throw error;
  return data as string;
}

function clean(value: string | undefined, maxLength: number) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

function nullable(value: string | undefined, maxLength: number) {
  const normalized = clean(value, maxLength);
  return normalized || null;
}
