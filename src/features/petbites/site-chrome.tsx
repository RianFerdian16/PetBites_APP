import { Database, Languages, Moon, RefreshCw, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BrandMark } from "./illustrations";
import { useLanguage } from "./language";

type HomeSectionId = "cara-kerja" | "pilih-burung";

export function SiteHeader({
  onHome,
  onNavigateSection,
}: {
  onHome: () => void;
  onNavigateSection: (sectionId: HomeSectionId) => void;
}) {
  const [dark, setDark] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function readSavedTheme() {
      try {
        return window.localStorage.getItem("petbites:theme");
      } catch {
        return null;
      }
    }

    function applyTheme(shouldUseDark: boolean) {
      document.documentElement.classList.toggle("dark", shouldUseDark);
      updateThemeColor(shouldUseDark);
      setDark(shouldUseDark);
    }

    const savedTheme = readSavedTheme();
    applyTheme(savedTheme ? savedTheme === "dark" : mediaQuery.matches);

    function handleSystemThemeChange(event: MediaQueryListEvent) {
      if (!readSavedTheme()) applyTheme(event.matches);
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    document.documentElement.classList.toggle("dark", nextDark);
    updateThemeColor(nextDark);

    try {
      window.localStorage.setItem("petbites:theme", nextDark ? "dark" : "light");
    } catch {
      // Theme switching remains available even when persistence is blocked.
    }

    setDark(nextDark);
  }

  const languageLabel =
    language === "id" ? t("language.switchToEnglish") : t("language.switchToIndonesian");

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button
          className="site-header__brand"
          type="button"
          onClick={onHome}
          aria-label={t("header.goHome")}
        >
          <BrandMark compact />
          <span>
            <strong>PetBites</strong>
            <small>{t("header.tagline")}</small>
          </span>
        </button>

        <nav className="site-header__nav" aria-label={t("header.navigation")}>
          <a
            href="#cara-kerja"
            onClick={(event) => {
              event.preventDefault();
              onNavigateSection("cara-kerja");
            }}
          >
            {t("header.howItWorks")}
          </a>
          <a
            href="#pilih-burung"
            onClick={(event) => {
              event.preventDefault();
              onNavigateSection("pilih-burung");
            }}
          >
            {t("header.chooseBird")}
          </a>
          <button
            type="button"
            className="language-toggle"
            onClick={toggleLanguage}
            aria-label={languageLabel}
            title={languageLabel}
          >
            <Languages className="h-[17px] w-[17px]" aria-hidden="true" />
            <span aria-live="polite">{language === "id" ? "EN" : "ID"}</span>
          </button>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={dark ? t("theme.useLight") : t("theme.useDark")}
            title={dark ? t("theme.useLight") : t("theme.useDark")}
            aria-pressed={dark}
          >
            {dark ? (
              <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

export function LoadingState() {
  const { t } = useLanguage();

  return (
    <section className="loading-page" aria-busy="true" aria-live="polite">
      <div className="loading-page__intro">
        <div className="loading-page__mark">
          <BrandMark />
        </div>
        <div>
          <p className="eyebrow">{t("loading.eyebrow")}</p>
          <h2>{t("loading.title")}</h2>
          <p>{t("loading.copy")}</p>
        </div>
      </div>

      <div className="loading-page__progress" aria-hidden="true">
        <span />
      </div>

      <div className="loading-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="loading-card" key={index}>
            <span className="loading-card__image" />
            <span className="loading-card__title" />
            <span className="loading-card__line" />
            <span className="loading-card__line loading-card__line--short" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function DatabaseError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useLanguage();

  return (
    <section className="error-page">
      <Card className="error-card">
        <CardHeader>
          <div className="error-card__icon">
            <Database className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle>{t("error.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert variant="destructive">
            <AlertTitle>{t("error.connectionTitle")}</AlertTitle>
            <AlertDescription>{t("error.copy")}</AlertDescription>
          </Alert>

          {import.meta.env.DEV && (
            <details className="error-card__details">
              <summary>{t("error.technicalDetails")}</summary>
              <code>{message}</code>
            </details>
          )}

          <Button type="button" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t("error.retry")}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <BrandMark compact />
          <span>
            <strong>PetBites</strong>
            <small>{t("footer.tagline")}</small>
          </span>
        </div>
        <p>{t("footer.disclaimer")}</p>
      </div>
    </footer>
  );
}

function updateThemeColor(dark: boolean) {
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) themeColor.content = dark ? "#17241b" : "#f4f2e8";
}
