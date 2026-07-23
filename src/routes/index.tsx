import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BirdDashboard } from "@/features/petbites/dashboard";
import { HomePage } from "@/features/petbites/home";
import {
  DatabaseError,
  LoadingState,
  SiteFooter,
  SiteHeader,
} from "@/features/petbites/site-chrome";
import { usePetBitesContent } from "@/features/petbites/use-petbites-content";
import { WelcomeScreen } from "@/features/petbites/welcome-screen";
import type { Bird } from "@/lib/birds-data";

const SELECTED_BIRD_KEY = "petbites:selected-bird";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PetBites — Panduan Nutrisi Burung" },
      {
        name: "description",
        content:
          "Cari pakan, cek bahan berbahaya, lihat perkiraan porsi, dan ikuti resep sederhana untuk burung kesayanganmu.",
      },
      { property: "og:title", content: "PetBites — Panduan Nutrisi Burung" },
      {
        property: "og:description",
        content: "Panduan pakan burung yang jelas, praktis, dan mudah digunakan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#f7f5ed" },
    ],
  }),
  component: PetBites,
});

function PetBites() {
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null);
  const { status, content, error, retry } = usePetBitesContent();

  useEffect(() => {
    try {
      const storedBirdId = window.sessionStorage.getItem(SELECTED_BIRD_KEY);
      if (storedBirdId) setSelectedBirdId(storedBirdId);
    } catch {
      // Selection persistence is optional; the app remains fully usable without it.
    }
  }, []);

  const selectedBird = content?.birds.find((bird) => bird.id === selectedBirdId) ?? null;

  function selectBird(bird: Bird) {
    try {
      window.sessionStorage.setItem(SELECTED_BIRD_KEY, bird.id);
    } catch {
      // Continue with in-memory state when storage is blocked.
    }

    setSelectedBirdId(bird.id);
    scrollToTop();
  }

  function returnHome() {
    try {
      window.sessionStorage.removeItem(SELECTED_BIRD_KEY);
    } catch {
      // No cleanup is required when storage is unavailable.
    }

    setSelectedBirdId(null);
    scrollToTop();
  }

  return (
    <div className="app-shell">
      <WelcomeScreen />
      <SiteHeader onHome={returnHome} />

      <main className="site-main">
        {status === "loading" && <LoadingState />}
        {status === "error" && error && <DatabaseError message={error} onRetry={retry} />}
        {status === "ready" && content && selectedBird && (
          <BirdDashboard bird={selectedBird} features={content.features} onBack={returnHome} />
        )}
        {status === "ready" && content && !selectedBird && (
          <HomePage birds={content.birds} features={content.features} onSelect={selectBird} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function scrollToTop() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
}
