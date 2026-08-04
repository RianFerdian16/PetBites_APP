export type Safety = "safe" | "caution" | "toxic";
export type BirdSize = "Kecil" | "Standar" | "Besar";
export type BirdCondition = "Harian" | "Mabung" | "Ternak";
export type FeatureId = "food" | "toxic" | "portion" | "recipe";

export interface AppFeature {
  id: FeatureId;
  label: string;
  shortLabel: string;
  description: string;
  iconKey: string;
  sortOrder: number;
}

export interface FoodItem {
  id: string;
  name: string;
  nameEn?: string;
  category: "main" | "extra";
  benefits: string[];
  benefitsEn: string[];
  note?: string;
  noteEn?: string;
}

export interface ToxicEntry {
  id: string;
  name: string;
  nameEn?: string;
  status: Safety;
  explanation: string;
  explanationEn?: string;
}

export interface PortionData {
  id: string;
  size: BirdSize;
  condition: BirdCondition;
  grams: number;
  teaspoon: string;
  teaspoonEn?: string;
  morning: string;
  morningEn?: string;
  evening: string;
  eveningEn?: string;
}

export interface Recipe {
  id: string;
  title: string;
  titleEn?: string;
  purpose: string;
  purposeEn?: string;
  ingredients: string[];
  ingredientsEn: string[];
  steps: string[];
  stepsEn: string[];
}

export interface Bird {
  id: string;
  name: string;
  nameEn?: string;
  emoji: string;
  imageUrl?: string;
  scientific: string;
  description: string;
  descriptionEn?: string;
  foods: FoodItem[];
  toxic: ToxicEntry[];
  portions: PortionData[];
  recipes: Recipe[];
}

export interface PetBitesContent {
  birds: Bird[];
  features: AppFeature[];
}
