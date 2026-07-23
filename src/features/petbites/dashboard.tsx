import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Clock3,
  Moon,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Utensils,
  Wheat,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AppFeature,
  Bird,
  BirdCondition,
  BirdSize,
  FeatureId,
  FoodItem,
  Safety,
} from "@/lib/birds-data";

const featureIcons: Record<FeatureId, typeof Search> = {
  food: Wheat,
  toxic: ShieldCheck,
  portion: Utensils,
  recipe: ChefHat,
};

export function BirdDashboard({
  bird,
  features,
  onBack,
}: {
  bird: Bird;
  features: AppFeature[];
  onBack: () => void;
}) {
  return (
    <div className="dashboard-page">
      <div className="dashboard-page__back">
        <Button type="button" variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke daftar burung
        </Button>
      </div>

      <section className="bird-profile">
        <div className="bird-profile__media">
          {bird.imageUrl ? (
            <img
              src={bird.imageUrl}
              alt={`Burung ${bird.name}`}
              decoding="async"
              width="720"
              height="520"
            />
          ) : (
            <span role="img" aria-label={bird.name}>
              {bird.emoji}
            </span>
          )}
        </div>
        <div className="bird-profile__copy">
          <p className="eyebrow">Panduan nutrisi</p>
          <h1>{bird.name}</h1>
          <p className="bird-profile__scientific">{bird.scientific}</p>
          <p className="bird-profile__description">{bird.description}</p>
        </div>
        <dl className="bird-profile__stats">
          <div>
            <dt>Pakan</dt>
            <dd>{bird.foods.length}</dd>
          </div>
          <div>
            <dt>Toxic check</dt>
            <dd>{bird.toxic.length}</dd>
          </div>
          <div>
            <dt>Resep</dt>
            <dd>{bird.recipes.length}</dd>
          </div>
        </dl>
      </section>

      {features.length > 0 ? (
        <Tabs defaultValue={features[0].id} className="dashboard-tabs">
          <div className="dashboard-tabs__bar">
            <TabsList className="dashboard-tabs__list" aria-label="Fitur panduan nutrisi">
              {features.map((feature) => {
                const Icon = featureIcons[feature.id];
                return (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className="dashboard-tabs__trigger"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{feature.shortLabel}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="dashboard-tabs__content">
              <FeatureIntro feature={feature} />
              <FeatureContent bird={bird} featureId={feature.id} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Alert>
          <AlertTitle>Belum ada fitur aktif</AlertTitle>
          <AlertDescription>
            Aktifkan data pada tabel <code>app_features</code> di Supabase.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function FeatureIntro({ feature }: { feature: AppFeature }) {
  const Icon = featureIcons[feature.id];
  return (
    <header className="feature-intro">
      <span className={`feature-intro__icon feature-intro__icon--${feature.id}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="eyebrow">{feature.shortLabel}</p>
        <h2>{feature.label}</h2>
        <p>{feature.description}</p>
      </div>
    </header>
  );
}

function FeatureContent({ featureId, bird }: { featureId: FeatureId; bird: Bird }) {
  switch (featureId) {
    case "food":
      return <FoodFinder bird={bird} />;
    case "toxic":
      return <ToxicChecker bird={bird} />;
    case "portion":
      return <PortionCalculator bird={bird} />;
    case "recipe":
      return <Recipes bird={bird} />;
  }
}

function FoodFinder({ bird }: { bird: Bird }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | FoodItem["category"]>("all");

  const filteredFoods = useMemo(() => {
    const normalizedQuery = normalize(query);
    return bird.foods.filter((food) => {
      const matchesCategory = category === "all" || food.category === category;
      const matchesQuery =
        !normalizedQuery ||
        normalize(`${food.name} ${food.benefits.join(" ")} ${food.note ?? ""}`).includes(
          normalizedQuery,
        );
      return matchesCategory && matchesQuery;
    });
  }, [bird.foods, category, query]);

  return (
    <section className="tool-panel">
      <div className="tool-panel__controls">
        <label className="tool-search">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Cari pakan</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama pakan atau manfaatnya..."
            autoComplete="off"
          />
        </label>
        <div className="segment-control" aria-label="Filter kategori pakan">
          {[
            { value: "all" as const, label: "Semua" },
            { value: "main" as const, label: "Utama" },
            { value: "extra" as const, label: "Tambahan" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={category === option.value ? "is-active" : ""}
              onClick={() => setCategory(option.value)}
              aria-pressed={category === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="tool-panel__result-count" role="status">
        Menampilkan {filteredFoods.length} dari {bird.foods.length} pakan
      </p>

      {filteredFoods.length > 0 ? (
        <div className="food-grid">
          {filteredFoods.map((food) => (
            <article className="food-card" key={food.id}>
              <div className="food-card__header">
                <span className={`food-card__icon food-card__icon--${food.category}`}>
                  {food.category === "main" ? (
                    <Wheat className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <Badge variant="outline">
                    {food.category === "main" ? "Pakan utama" : "Pakan tambahan"}
                  </Badge>
                  <h3>{food.name}</h3>
                </div>
              </div>
              {food.benefits.length > 0 && (
                <ul className="benefit-list">
                  {food.benefits.map((benefit) => (
                    <li key={benefit}>
                      <Check className="h-3.5 w-3.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}
              {food.note && <p className="food-card__note">{food.note}</p>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyToolState
          icon={<Search className="h-5 w-5" />}
          title="Pakan tidak ditemukan"
          description="Coba kata kunci lain atau hapus filter kategori."
          actionLabel="Reset pencarian"
          onAction={() => {
            setQuery("");
            setCategory("all");
          }}
        />
      )}
    </section>
  );
}

function ToxicChecker({ bird }: { bird: Bird }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const exactMatch = useMemo(() => {
    if (!normalizedQuery) return null;
    return (
      bird.toxic.find((entry) => normalize(entry.name) === normalizedQuery) ??
      bird.toxic.find((entry) => normalize(entry.name).includes(normalizedQuery)) ??
      null
    );
  }, [bird.toxic, normalizedQuery]);

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return bird.toxic.slice(0, 6);
    return bird.toxic
      .filter((entry) => normalize(entry.name).includes(normalizedQuery))
      .slice(0, 6);
  }, [bird.toxic, normalizedQuery]);

  const toxicEntries = bird.toxic.filter((entry) => entry.status === "toxic");

  return (
    <section className="tool-panel toxic-tool">
      <div className="toxic-search-card">
        <div className="toxic-search-card__copy">
          <ShieldCheck className="h-6 w-6" />
          <div>
            <h3>Cek sebelum diberikan</h3>
            <p>Ketik nama makanan atau bahan dapur untuk melihat status keamanannya.</p>
          </div>
        </div>
        <label className="tool-search tool-search--large">
          <Search className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Cari keamanan bahan makanan</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Contoh: alpukat, apel, cokelat..."
            autoComplete="off"
          />
        </label>
        <div className="suggestion-row" aria-label="Saran pencarian">
          {suggestions.map((entry) => (
            <button key={entry.id} type="button" onClick={() => setQuery(entry.name)}>
              {entry.name}
            </button>
          ))}
        </div>
      </div>

      <div className="toxic-result" aria-live="polite">
        {!normalizedQuery ? (
          <div className="toxic-result__placeholder">
            <Search className="h-5 w-5" />
            <p>Hasil pemeriksaan akan muncul di sini.</p>
          </div>
        ) : exactMatch ? (
          <SafetyResult entry={exactMatch} />
        ) : (
          <div className="unknown-result">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <h3>Belum ada di database</h3>
              <p>
                “{query.trim()}” belum terdaftar. Jangan menganggap bahan tersebut aman sebelum
                mendapatkan rujukan yang tepercaya.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="avoid-list">
        <div className="avoid-list__heading">
          <div>
            <p className="eyebrow">Perlu diingat</p>
            <h3>Bahan yang umum ditemukan di dapur</h3>
          </div>
          <Badge variant="destructive">{toxicEntries.length} bahan berbahaya</Badge>
        </div>
        <div className="avoid-list__grid">
          {toxicEntries.map((entry) => (
            <article key={entry.id}>
              <ShieldAlert className="h-4 w-4" />
              <div>
                <h4>{entry.name}</h4>
                <p>{entry.explanation}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SafetyResult({ entry }: { entry: Bird["toxic"][number] }) {
  const config: Record<
    Safety,
    { label: string; description: string; icon: typeof ShieldCheck; className: string }
  > = {
    safe: {
      label: "Aman",
      description: "Bisa diberikan sesuai catatan dan porsi yang wajar.",
      icon: ShieldCheck,
      className: "safety-result--safe",
    },
    caution: {
      label: "Perlu dibatasi",
      description: "Perhatikan jumlah, frekuensi, atau cara penyajiannya.",
      icon: AlertTriangle,
      className: "safety-result--caution",
    },
    toxic: {
      label: "Berbahaya",
      description: "Jangan diberikan kepada burung.",
      icon: ShieldAlert,
      className: "safety-result--toxic",
    },
  };

  const state = config[entry.status];
  const Icon = state.icon;

  return (
    <article className={`safety-result ${state.className}`}>
      <span className="safety-result__icon">
        <Icon className="h-7 w-7" />
      </span>
      <div>
        <p className="safety-result__eyebrow">Hasil pemeriksaan</p>
        <div className="safety-result__title-row">
          <h3>{entry.name}</h3>
          <Badge>{state.label}</Badge>
        </div>
        <p className="safety-result__summary">{state.description}</p>
        <p className="safety-result__detail">{entry.explanation}</p>
      </div>
    </article>
  );
}

function PortionCalculator({ bird }: { bird: Bird }) {
  const [condition, setCondition] = useState<BirdCondition>("Harian");
  const [size, setSize] = useState<BirdSize>("Standar");

  const result = bird.portions.find(
    (portion) => portion.condition === condition && portion.size === size,
  );

  const conditions: Array<{ id: BirdCondition; label: string; description: string }> = [
    { id: "Harian", label: "Harian", description: "Kondisi normal" },
    { id: "Mabung", label: "Mabung", description: "Rontok dan tumbuh bulu" },
    { id: "Ternak", label: "Masa ternak", description: "Breeding dan produksi" },
  ];
  const sizes: BirdSize[] = ["Kecil", "Standar", "Besar"];

  return (
    <section className="portion-layout">
      <div className="portion-form">
        <fieldset>
          <legend>Kondisi burung</legend>
          <div className="condition-options">
            {conditions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={condition === option.id ? "is-active" : ""}
                onClick={() => setCondition(option.id)}
                aria-pressed={condition === option.id}
              >
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
                {condition === option.id && <CheckCircle2 className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Ukuran burung</legend>
          <div className="size-options">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                className={size === option ? "is-active" : ""}
                onClick={() => setSize(option)}
                aria-pressed={size === option}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <Alert>
          <AlertTitle>Gunakan sebagai estimasi awal</AlertTitle>
          <AlertDescription>
            Pantau nafsu makan, berat badan, dan kondisi kotoran. Kebutuhan setiap burung dapat
            berbeda.
          </AlertDescription>
        </Alert>
      </div>

      {result ? (
        <div className="portion-result" aria-live="polite">
          <div className="portion-result__header">
            <div>
              <p className="eyebrow">Perkiraan porsi</p>
              <h3>
                {bird.name} · {condition} · {size}
              </h3>
            </div>
            <Utensils className="h-6 w-6" />
          </div>

          <div className="portion-result__numbers">
            <div>
              <span>Total harian</span>
              <strong>
                {result.grams}
                <small>gram</small>
              </strong>
            </div>
            <div>
              <span>Perkiraan volume</span>
              <strong className="portion-result__teaspoon">{result.teaspoon}</strong>
            </div>
          </div>

          <div className="feeding-timeline">
            <article>
              <span className="feeding-timeline__icon feeding-timeline__icon--morning">
                <Sun className="h-5 w-5" />
              </span>
              <div>
                <p>Pagi</p>
                <strong>{result.morning}</strong>
              </div>
            </article>
            <span className="feeding-timeline__line" aria-hidden="true" />
            <article>
              <span className="feeding-timeline__icon feeding-timeline__icon--evening">
                <Moon className="h-5 w-5" />
              </span>
              <div>
                <p>Sore</p>
                <strong>{result.evening}</strong>
              </div>
            </article>
          </div>
        </div>
      ) : (
        <EmptyToolState
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Aturan porsi belum tersedia"
          description={`Belum ada data untuk ${bird.name}, ukuran ${size}, kondisi ${condition}.`}
        />
      )}
    </section>
  );
}

function Recipes({ bird }: { bird: Bird }) {
  if (bird.recipes.length === 0) {
    return (
      <EmptyToolState
        icon={<ChefHat className="h-5 w-5" />}
        title="Resep belum tersedia"
        description={`Belum ada resep aktif untuk ${bird.name}.`}
      />
    );
  }

  return (
    <section className="recipe-grid">
      {bird.recipes.map((recipe, index) => (
        <details className="recipe-card" key={recipe.id} open={index === 0}>
          <summary>
            <span className="recipe-card__number">{String(index + 1).padStart(2, "0")}</span>
            <span className="recipe-card__heading">
              <strong>{recipe.title}</strong>
              <small>{recipe.purpose}</small>
            </span>
            <ChevronDown className="recipe-card__chevron h-5 w-5" />
          </summary>

          <div className="recipe-card__content">
            <div className="recipe-card__section">
              <h4>
                <Utensils className="h-4 w-4" />
                Bahan
              </h4>
              <ul>
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient}>
                    <Check className="h-4 w-4" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            <div className="recipe-card__section">
              <h4>
                <Clock3 className="h-4 w-4" />
                Cara membuat
              </h4>
              <ol>
                {recipe.steps.map((step, stepIndex) => (
                  <li key={`${recipe.id}-${stepIndex}`}>
                    <span>{stepIndex + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </details>
      ))}
    </section>
  );
}

function EmptyToolState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-tool-state" role="status">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <Button type="button" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id-ID")
    .trim();
}
