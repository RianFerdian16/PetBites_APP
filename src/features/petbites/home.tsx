import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronRight,
  Database,
  Search,
  ShieldCheck,
  Sparkles,
  Wheat,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AppFeature, Bird, FeatureId } from "@/lib/birds-data";

import { BirdRequestForm } from "./bird-request-form";
import { HeroBirdScene } from "./illustrations";
import { useLanguage } from "./language";

const featureIcons: Record<FeatureId, typeof Search> = {
  food: Wheat,
  toxic: ShieldCheck,
  portion: BookOpenCheck,
  recipe: Sparkles,
};

export function HomePage({
  birds,
  features,
  onSelect,
}: {
  birds: Bird[];
  features: AppFeature[];
  onSelect: (bird: Bird) => void;
}) {
  const [query, setQuery] = useState("");
  const { t, birdName, birdDescription, featureText } = useLanguage();

  const filteredBirds = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return birds;

    return birds.filter((bird) => {
      const localizedName = birdName(bird.id, bird.name);
      const localizedDescription = birdDescription(bird.id, bird.description);
      return normalize(
        `${bird.name} ${localizedName} ${bird.scientific} ${bird.description} ${localizedDescription}`,
      ).includes(normalizedQuery);
    });
  }, [birdDescription, birdName, birds, query]);

  function scrollToSpecies() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .querySelector("#pilih-burung")
      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <div className="home-page">
      <section className="home-hero reveal-section">
        <div className="home-hero__copy">
          <Badge className="home-hero__badge" variant="secondary">
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            {t("home.badge")}
          </Badge>

          <h1>
            {t("home.titleBefore")} <em>{t("home.titleAccent")}</em>
          </h1>
          <p className="home-hero__lead">{t("home.lead")}</p>

          <div className="home-hero__actions">
            <Button type="button" size="lg" onClick={scrollToSpecies} className="gap-2">
              {t("home.chooseSpecies")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button type="button" size="lg" variant="outline" asChild>
              <a href="#cara-kerja">{t("home.viewHow")}</a>
            </Button>
          </div>

          <ul className="home-hero__proof" aria-label={t("home.proofLabel")}>
            <li>
              <Check className="h-4 w-4" aria-hidden="true" />
              {t("home.noAccount")}
            </li>
            <li>
              <Check className="h-4 w-4" aria-hidden="true" />
              {t("home.mobileFriendly")}
            </li>
            <li>
              <Check className="h-4 w-4" aria-hidden="true" />
              {t("home.expandableData")}
            </li>
          </ul>
        </div>

        <HeroBirdScene />
      </section>

      <section className="feature-overview reveal-section" aria-labelledby="feature-title">
        <div className="section-heading">
          <p className="eyebrow">{t("home.featuresEyebrow")}</p>
          <h2 id="feature-title">{t("home.featuresTitle")}</h2>
          <p>{t("home.featuresCopy")}</p>
        </div>

        <div className="feature-overview__grid">
          {features.map((feature, index) => {
            const Icon = featureIcons[feature.id];
            return (
              <article
                className="feature-tile reveal-item"
                key={feature.id}
                style={{ "--delay": `${index * 70}ms` } as CSSProperties}
              >
                <span className={`feature-tile__icon feature-tile__icon--${feature.id}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="feature-tile__number">0{index + 1}</span>
                <h3>{featureText(feature, "label")}</h3>
                <p>{featureText(feature, "description")}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="how-it-works reveal-section"
        id="cara-kerja"
        aria-labelledby="steps-title"
      >
        <div className="section-heading section-heading--compact">
          <p className="eyebrow">{t("home.stepsEyebrow")}</p>
          <h2 id="steps-title">{t("home.stepsTitle")}</h2>
        </div>
        <ol className="steps-list">
          <li>
            <span>1</span>
            <div>
              <h3>{t("home.step1Title")}</h3>
              <p>{t("home.step1Copy")}</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <h3>{t("home.step2Title")}</h3>
              <p>{t("home.step2Copy")}</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <h3>{t("home.step3Title")}</h3>
              <p>{t("home.step3Copy")}</p>
            </div>
          </li>
        </ol>
      </section>

      <section
        className="species-section reveal-section"
        id="pilih-burung"
        aria-labelledby="species-title"
      >
        <div className="species-section__header">
          <div className="section-heading section-heading--compact">
            <p className="eyebrow">{t("home.startHere")}</p>
            <h2 id="species-title">{t("home.chooseYourBird")}</h2>
            <p>{t("home.availableBirds", { count: birds.length })}</p>
          </div>

          <label className="species-search">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{t("home.searchBird")}</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder={t("home.searchPlaceholder")}
              autoComplete="off"
              enterKeyHint="search"
              spellCheck={false}
            />
          </label>
        </div>

        {filteredBirds.length > 0 ? (
          <div className="species-grid">
            {filteredBirds.map((bird, index) => (
              <BirdCard bird={bird} index={index} key={bird.id} onSelect={() => onSelect(bird)} />
            ))}
          </div>
        ) : (
          <div className="empty-search" role="status">
            <Search className="h-6 w-6" aria-hidden="true" />
            <h3>{t("home.notFoundTitle")}</h3>
            <p>{t("home.notFoundCopy")}</p>
            <Button type="button" variant="outline" onClick={() => setQuery("")}>
              {t("home.clearSearch")}
            </Button>
          </div>
        )}
      </section>

      <BirdRequestForm />
    </div>
  );
}

function BirdCard({ bird, index, onSelect }: { bird: Bird; index: number; onSelect: () => void }) {
  const { t, birdName, birdDescription } = useLanguage();
  const localizedName = birdName(bird.id, bird.name);

  return (
    <article
      className="bird-card reveal-item"
      style={{ "--delay": `${Math.min(index, 7) * 55}ms` } as CSSProperties}
    >
      <button
        type="button"
        className="bird-card__button"
        onClick={onSelect}
        aria-label={t("bird.openGuide", { name: localizedName })}
      >
        <div className="bird-card__media">
          {bird.imageUrl ? (
            <img
              src={bird.imageUrl}
              alt={t("bird.alt", { name: localizedName })}
              loading="lazy"
              decoding="async"
              width="640"
              height="420"
              sizes="(max-width: 560px) calc(100vw - 2rem), (max-width: 1040px) 50vw, 25vw"
            />
          ) : (
            <span className="bird-card__emoji" role="img" aria-label={localizedName}>
              {bird.emoji}
            </span>
          )}
          <span className="bird-card__index">{String(index + 1).padStart(2, "0")}</span>
        </div>

        <div className="bird-card__body">
          <div className="bird-card__title-row">
            <div>
              <h3>{localizedName}</h3>
              <p>{bird.scientific}</p>
            </div>
            <span className="bird-card__arrow">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="bird-card__description">{birdDescription(bird.id, bird.description)}</p>
          <div className="bird-card__meta">
            <span>{t("bird.foodCount", { count: bird.foods.length })}</span>
            <span>{t("bird.checkedCount", { count: bird.toxic.length })}</span>
            <span>{t("bird.recipeCount", { count: bird.recipes.length })}</span>
          </div>
        </div>
      </button>
    </article>
  );
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id-ID")
    .trim();
}
