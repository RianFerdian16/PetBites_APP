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

import { HeroBirdScene } from "./illustrations";

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

  const filteredBirds = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return birds;

    return birds.filter((bird) =>
      normalize(`${bird.name} ${bird.scientific} ${bird.description}`).includes(normalizedQuery),
    );
  }, [birds, query]);

  function scrollToSpecies() {
    document.querySelector("#pilih-burung")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="home-page">
      <section className="home-hero reveal-section">
        <div className="home-hero__copy">
          <Badge className="home-hero__badge" variant="secondary">
            <Database className="h-3.5 w-3.5" />
            Panduan pakan berbasis data
          </Badge>

          <h1>
            Pilih pakan dengan <em>lebih yakin.</em>
          </h1>
          <p className="home-hero__lead">
            Cari makanan yang sesuai, cek bahan berbahaya, lihat perkiraan porsi, dan ikuti resep
            sederhana untuk burung kesayanganmu.
          </p>

          <div className="home-hero__actions">
            <Button type="button" size="lg" onClick={scrollToSpecies} className="gap-2">
              Pilih jenis burung
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button type="button" size="lg" variant="outline" asChild>
              <a href="#cara-kerja">Lihat cara kerja</a>
            </Button>
          </div>

          <ul className="home-hero__proof" aria-label="Keunggulan PetBites">
            <li>
              <Check className="h-4 w-4" />
              Tanpa akun
            </li>
            <li>
              <Check className="h-4 w-4" />
              Ramah perangkat seluler
            </li>
            <li>
              <Check className="h-4 w-4" />
              Data mudah dikembangkan
            </li>
          </ul>
        </div>

        <HeroBirdScene />
      </section>

      <section className="feature-overview reveal-section" aria-labelledby="feature-title">
        <div className="section-heading">
          <p className="eyebrow">Satu tempat, empat kebutuhan</p>
          <h2 id="feature-title">Panduan yang langsung bisa dipakai</h2>
          <p>
            Tidak perlu membuka banyak artikel. Pilih burung, lalu gunakan fitur yang kamu butuhkan.
          </p>
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
                  <Icon className="h-5 w-5" />
                </span>
                <span className="feature-tile__number">0{index + 1}</span>
                <h3>{feature.label}</h3>
                <p>{feature.description}</p>
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
          <p className="eyebrow">Cara kerja</p>
          <h2 id="steps-title">Tiga langkah sederhana</h2>
        </div>
        <ol className="steps-list">
          <li>
            <span>1</span>
            <div>
              <h3>Pilih jenis burung</h3>
              <p>PetBites menyesuaikan daftar pakan, porsi, dan resep dengan burung pilihanmu.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <h3>Buka panduan yang dibutuhkan</h3>
              <p>Gunakan Food Finder, Toxic Checker, kalkulator porsi, atau resep.</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <h3>Terapkan secara bertahap</h3>
              <p>Gunakan hasil sebagai acuan umum dan tetap pantau kondisi burung setiap hari.</p>
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
            <p className="eyebrow">Mulai dari sini</p>
            <h2 id="species-title">Pilih jenis burungmu</h2>
            <p>
              {birds.length} jenis burung tersedia dan seluruh panduannya tersimpan di Supabase.
            </p>
          </div>

          <label className="species-search">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Cari jenis burung</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari Lovebird, Kenari, Pleci..."
              autoComplete="off"
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
            <Search className="h-6 w-6" />
            <h3>Burung belum ditemukan</h3>
            <p>Coba gunakan nama umum atau nama ilmiahnya.</p>
            <Button type="button" variant="outline" onClick={() => setQuery("")}>
              Hapus pencarian
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function BirdCard({ bird, index, onSelect }: { bird: Bird; index: number; onSelect: () => void }) {
  return (
    <article
      className="bird-card reveal-item"
      style={{ "--delay": `${Math.min(index, 7) * 55}ms` } as CSSProperties}
    >
      <button type="button" className="bird-card__button" onClick={onSelect}>
        <div className="bird-card__media">
          {bird.imageUrl ? (
            <img
              src={bird.imageUrl}
              alt={`Burung ${bird.name}`}
              loading="lazy"
              decoding="async"
              width="640"
              height="420"
            />
          ) : (
            <span className="bird-card__emoji" role="img" aria-label={bird.name}>
              {bird.emoji}
            </span>
          )}
          <span className="bird-card__index">{String(index + 1).padStart(2, "0")}</span>
        </div>

        <div className="bird-card__body">
          <div className="bird-card__title-row">
            <div>
              <h3>{bird.name}</h3>
              <p>{bird.scientific}</p>
            </div>
            <span className="bird-card__arrow">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
          <p className="bird-card__description">{bird.description}</p>
          <div className="bird-card__meta">
            <span>{bird.foods.length} pakan</span>
            <span>{bird.toxic.length} bahan dicek</span>
            <span>{bird.recipes.length} resep</span>
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
