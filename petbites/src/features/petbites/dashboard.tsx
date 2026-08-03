import { useEffect, useMemo, useState } from "react";
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

import { useLanguage } from "./language";

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
  const { t, birdName, birdDescription, featureText } = useLanguage();
  const localizedBirdName = birdName(bird.id, bird.name);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [bird.imageUrl]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__back">
        <Button type="button" variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("dashboard.back")}
        </Button>
      </div>

      <section className="bird-profile">
        <div className="bird-profile__media">
          {bird.imageUrl && !imageFailed ? (
            <img
              src={bird.imageUrl}
              onError={() => setImageFailed(true)}
              alt={t("bird.alt", { name: localizedBirdName })}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              width="720"
              height="520"
              sizes="(max-width: 560px) 76px, (max-width: 800px) 104px, 144px"
            />
          ) : (
            <span role="img" aria-label={localizedBirdName}>
              {bird.emoji}
            </span>
          )}
        </div>
        <div className="bird-profile__copy">
          <p className="eyebrow">{t("dashboard.nutritionGuide")}</p>
          <h1>{localizedBirdName}</h1>
          <p className="bird-profile__scientific">{bird.scientific}</p>
          <p className="bird-profile__description">{birdDescription(bird.id, bird.description)}</p>
        </div>
        <dl className="bird-profile__stats">
          <div>
            <dt>{t("dashboard.food")}</dt>
            <dd>{bird.foods.length}</dd>
          </div>
          <div>
            <dt>{t("dashboard.toxicCheck")}</dt>
            <dd>{bird.toxic.length}</dd>
          </div>
          <div>
            <dt>{t("dashboard.recipes")}</dt>
            <dd>{bird.recipes.length}</dd>
          </div>
        </dl>
      </section>

      {features.length > 0 ? (
        <Tabs defaultValue={features[0].id} className="dashboard-tabs">
          <div className="dashboard-tabs__bar">
            <TabsList className="dashboard-tabs__list" aria-label={t("dashboard.tabsLabel")}>
              {features.map((feature) => {
                const Icon = featureIcons[feature.id];
                return (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className="dashboard-tabs__trigger"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{featureText(feature, "shortLabel")}</span>
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
          <AlertTitle>{t("dashboard.noFeaturesTitle")}</AlertTitle>
          <AlertDescription>{t("dashboard.noFeaturesCopy")}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function FeatureIntro({ feature }: { feature: AppFeature }) {
  const { featureText } = useLanguage();
  const Icon = featureIcons[feature.id];
  return (
    <header className="feature-intro">
      <span className={`feature-intro__icon feature-intro__icon--${feature.id}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="eyebrow">{featureText(feature, "shortLabel")}</p>
        <h2>{featureText(feature, "label")}</h2>
        <p>{featureText(feature, "description")}</p>
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
  const { t, contentText } = useLanguage();

  const filteredFoods = useMemo(() => {
    const normalizedQuery = normalize(query);
    return bird.foods.filter((food) => {
      const matchesCategory = category === "all" || food.category === category;
      const originalSearchText = `${food.name} ${food.benefits.join(" ")} ${food.note ?? ""}`;
      const localizedSearchText = `${contentText(food.name)} ${food.benefits
        .map(contentText)
        .join(" ")} ${food.note ? contentText(food.note) : ""}`;
      const matchesQuery =
        !normalizedQuery ||
        normalize(`${originalSearchText} ${localizedSearchText}`).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [bird.foods, category, contentText, query]);

  const categoryOptions = [
    { value: "all" as const, label: t("food.all") },
    { value: "main" as const, label: t("food.main") },
    { value: "extra" as const, label: t("food.extra") },
  ];

  return (
    <section className="tool-panel">
      <div className="tool-panel__controls">
        <label className="tool-search">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{t("food.searchLabel")}</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder={t("food.searchPlaceholder")}
            autoComplete="off"
            enterKeyHint="search"
            spellCheck={false}
          />
        </label>
        <div className="segment-control" aria-label={t("food.filterLabel")}>
          {categoryOptions.map((option) => (
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
        {t("food.resultCount", { shown: filteredFoods.length, total: bird.foods.length })}
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
                    {food.category === "main" ? t("food.mainBadge") : t("food.extraBadge")}
                  </Badge>
                  <h3>{contentText(food.name)}</h3>
                </div>
              </div>
              {food.benefits.length > 0 && (
                <ul className="benefit-list">
                  {food.benefits.map((benefit, benefitIndex) => (
                    <li key={`${food.id}-${benefitIndex}`}>
                      <Check className="h-3.5 w-3.5" />
                      {contentText(benefit)}
                    </li>
                  ))}
                </ul>
              )}
              {food.note && <p className="food-card__note">{contentText(food.note)}</p>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyToolState
          icon={<Search className="h-5 w-5" />}
          title={t("food.emptyTitle")}
          description={t("food.emptyCopy")}
          actionLabel={t("food.reset")}
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
  const { t, contentText } = useLanguage();
  const normalizedQuery = normalize(query);

  const exactMatch = useMemo(() => {
    if (!normalizedQuery) return null;
    return (
      bird.toxic.find((entry) =>
        [entry.name, contentText(entry.name)]
          .map(normalize)
          .filter(Boolean)
          .includes(normalizedQuery),
      ) ?? null
    );
  }, [bird.toxic, contentText, normalizedQuery]);

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return bird.toxic.slice(0, 6);
    return bird.toxic
      .filter((entry) =>
        normalize(`${entry.name} ${contentText(entry.name)}`).includes(normalizedQuery),
      )
      .slice(0, 6);
  }, [bird.toxic, contentText, normalizedQuery]);

  const toxicEntries = bird.toxic.filter((entry) => entry.status === "toxic");

  return (
    <section className="tool-panel toxic-tool">
      <div className="toxic-search-card">
        <div className="toxic-search-card__copy">
          <ShieldCheck className="h-6 w-6" />
          <div>
            <h3>{t("toxic.checkFirst")}</h3>
            <p>{t("toxic.checkCopy")}</p>
          </div>
        </div>
        <label className="tool-search tool-search--large">
          <Search className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">{t("toxic.searchLabel")}</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder={t("toxic.searchPlaceholder")}
            autoComplete="off"
            enterKeyHint="search"
            spellCheck={false}
          />
        </label>
        <div className="suggestion-row" aria-label={t("toxic.suggestions")}>
          {suggestions.map((entry) => (
            <button key={entry.id} type="button" onClick={() => setQuery(contentText(entry.name))}>
              {contentText(entry.name)}
            </button>
          ))}
        </div>
      </div>

      <div className="toxic-result" aria-live="polite">
        {!normalizedQuery ? (
          <div className="toxic-result__placeholder">
            <Search className="h-5 w-5" />
            <p>{t("toxic.placeholder")}</p>
          </div>
        ) : exactMatch ? (
          <SafetyResult entry={exactMatch} />
        ) : (
          <div className="unknown-result">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <h3>{t("toxic.unknownTitle")}</h3>
              <p>{t("toxic.unknownCopy", { query: query.trim() })}</p>
            </div>
          </div>
        )}
      </div>

      <div className="avoid-list">
        <div className="avoid-list__heading">
          <div>
            <p className="eyebrow">{t("toxic.remember")}</p>
            <h3>{t("toxic.kitchenItems")}</h3>
          </div>
          <Badge variant="destructive">
            {t("toxic.dangerousCount", { count: toxicEntries.length })}
          </Badge>
        </div>
        <div className="avoid-list__grid">
          {toxicEntries.map((entry) => (
            <article key={entry.id}>
              <ShieldAlert className="h-4 w-4" />
              <div>
                <h4>{contentText(entry.name)}</h4>
                <p>{contentText(entry.explanation)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SafetyResult({ entry }: { entry: Bird["toxic"][number] }) {
  const { t, contentText } = useLanguage();
  const config: Record<
    Safety,
    { label: string; description: string; icon: typeof ShieldCheck; className: string }
  > = {
    safe: {
      label: t("safety.safe"),
      description: t("safety.safeCopy"),
      icon: ShieldCheck,
      className: "safety-result--safe",
    },
    caution: {
      label: t("safety.caution"),
      description: t("safety.cautionCopy"),
      icon: AlertTriangle,
      className: "safety-result--caution",
    },
    toxic: {
      label: t("safety.toxic"),
      description: t("safety.toxicCopy"),
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
        <p className="safety-result__eyebrow">{t("safety.result")}</p>
        <div className="safety-result__title-row">
          <h3>{contentText(entry.name)}</h3>
          <Badge>{state.label}</Badge>
        </div>
        <p className="safety-result__summary">{state.description}</p>
        <p className="safety-result__detail">{contentText(entry.explanation)}</p>
      </div>
    </article>
  );
}

function PortionCalculator({ bird }: { bird: Bird }) {
  const [condition, setCondition] = useState<BirdCondition>("Harian");
  const [size, setSize] = useState<BirdSize>("Standar");
  const { t, birdName, contentText, formatNumber } = useLanguage();

  const result = bird.portions.find(
    (portion) => portion.condition === condition && portion.size === size,
  );

  const conditions: Array<{ id: BirdCondition; label: string; description: string }> = [
    { id: "Harian", label: t("portion.daily"), description: t("portion.dailyCopy") },
    { id: "Mabung", label: t("portion.molting"), description: t("portion.moltingCopy") },
    { id: "Ternak", label: t("portion.breeding"), description: t("portion.breedingCopy") },
  ];
  const sizes: Array<{ id: BirdSize; label: string }> = [
    { id: "Kecil", label: t("portion.small") },
    { id: "Standar", label: t("portion.standard") },
    { id: "Besar", label: t("portion.large") },
  ];
  const localizedBirdName = birdName(bird.id, bird.name);
  const conditionLabel = conditions.find((option) => option.id === condition)?.label ?? condition;
  const sizeLabel = sizes.find((option) => option.id === size)?.label ?? size;

  return (
    <section className="portion-layout">
      <div className="portion-form">
        <fieldset>
          <legend>{t("portion.condition")}</legend>
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
          <legend>{t("portion.size")}</legend>
          <div className="size-options">
            {sizes.map((option) => (
              <button
                key={option.id}
                type="button"
                className={size === option.id ? "is-active" : ""}
                onClick={() => setSize(option.id)}
                aria-pressed={size === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <Alert>
          <AlertTitle>{t("portion.estimateTitle")}</AlertTitle>
          <AlertDescription>{t("portion.estimateCopy")}</AlertDescription>
        </Alert>
      </div>

      {result ? (
        <div className="portion-result" aria-live="polite">
          <div className="portion-result__header">
            <div>
              <p className="eyebrow">{t("portion.estimated")}</p>
              <h3>
                {localizedBirdName} · {conditionLabel} · {sizeLabel}
              </h3>
            </div>
            <Utensils className="h-6 w-6" />
          </div>

          <div className="portion-result__numbers">
            <div>
              <span>{t("portion.dailyTotal")}</span>
              <strong>
                {formatNumber(result.grams)}
                <small>{t("portion.grams")}</small>
              </strong>
            </div>
            <div>
              <span>{t("portion.volume")}</span>
              <strong className="portion-result__teaspoon">{contentText(result.teaspoon)}</strong>
            </div>
          </div>

          <div className="feeding-timeline">
            <article>
              <span className="feeding-timeline__icon feeding-timeline__icon--morning">
                <Sun className="h-5 w-5" />
              </span>
              <div>
                <p>{t("portion.morning")}</p>
                <strong>{contentText(result.morning)}</strong>
              </div>
            </article>
            <span className="feeding-timeline__line" aria-hidden="true" />
            <article>
              <span className="feeding-timeline__icon feeding-timeline__icon--evening">
                <Moon className="h-5 w-5" />
              </span>
              <div>
                <p>{t("portion.evening")}</p>
                <strong>{contentText(result.evening)}</strong>
              </div>
            </article>
          </div>
        </div>
      ) : (
        <EmptyToolState
          icon={<AlertTriangle className="h-5 w-5" />}
          title={t("portion.unavailableTitle")}
          description={t("portion.unavailableCopy", {
            bird: localizedBirdName,
            size: sizeLabel,
            condition: conditionLabel,
          })}
        />
      )}
    </section>
  );
}

function Recipes({ bird }: { bird: Bird }) {
  const { t, birdName, contentText } = useLanguage();
  const localizedBirdName = birdName(bird.id, bird.name);

  if (bird.recipes.length === 0) {
    return (
      <EmptyToolState
        icon={<ChefHat className="h-5 w-5" />}
        title={t("recipe.unavailableTitle")}
        description={t("recipe.unavailableCopy", { bird: localizedBirdName })}
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
              <strong>{contentText(recipe.title)}</strong>
              <small>{contentText(recipe.purpose)}</small>
            </span>
            <ChevronDown className="recipe-card__chevron h-5 w-5" />
          </summary>

          <div className="recipe-card__content">
            <div className="recipe-card__section">
              <h4>
                <Utensils className="h-4 w-4" />
                {t("recipe.ingredients")}
              </h4>
              <ul>
                {recipe.ingredients.map((ingredient, ingredientIndex) => (
                  <li key={`${recipe.id}-ingredient-${ingredientIndex}`}>
                    <Check className="h-4 w-4" />
                    {contentText(ingredient)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="recipe-card__section">
              <h4>
                <Clock3 className="h-4 w-4" />
                {t("recipe.steps")}
              </h4>
              <ol>
                {recipe.steps.map((step, stepIndex) => (
                  <li key={`${recipe.id}-${stepIndex}`}>
                    <span>{stepIndex + 1}</span>
                    {contentText(step)}
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
    .replace(/\s+/g, " ")
    .trim();
}
