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
  category: "main" | "extra";
  benefits: string[];
  note?: string;
}

export interface ToxicEntry {
  id: string;
  name: string;
  status: Safety;
  explanation: string;
}

export interface PortionData {
  id: string;
  size: BirdSize;
  condition: BirdCondition;
  grams: number;
  teaspoon: string;
  morning: string;
  evening: string;
}

export interface Recipe {
  id: string;
  title: string;
  purpose: string;
  ingredients: string[];
  steps: string[];
}

export interface Bird {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
  scientific: string;
  description: string;
  foods: FoodItem[];
  toxic: ToxicEntry[];
  portions: PortionData[];
  recipes: Recipe[];
}

export interface PetBitesContent {
  birds: Bird[];
  features: AppFeature[];
}
