export type ContentLanguage = "id" | "en";

export function formatLocalizedNumber(value: number, language: ContentLanguage) {
  if (!Number.isFinite(value)) return String(value);

  return new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats decimal values embedded in database text, for example:
 * - "sekitar 5.5000000000000000 g" -> "sekitar 5,5 g" (ID)
 * - "about 5.432343 g" -> "about 5.43 g" (EN)
 *
 * Integer values and time values such as 07:00 are left untouched.
 */
export function formatLocalizedNumbersInText(value: string, language: ContentLanguage) {
  if (!value || !/[0-9][.,][0-9]/.test(value)) return value;

  return value.replace(
    /(^|[^\p{L}\p{N}])([+-]?\d+[.,]\d+)(?=$|[^\p{L}\p{N}])/gu,
    (match, prefix: string, rawNumber: string) => {
      const parsed = Number(rawNumber.replace(",", "."));
      if (!Number.isFinite(parsed)) return match;
      return `${prefix}${formatLocalizedNumber(parsed, language)}`;
    },
  );
}
