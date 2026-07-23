import { Database, Moon, RefreshCw, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BrandMark } from "./illustrations";

export function SiteHeader({ onHome }: { onHome: () => void }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let savedTheme: string | null = null;
    try {
      savedTheme = window.localStorage.getItem("petbites:theme");
    } catch {
      // Use the operating-system preference when storage is unavailable.
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", shouldUseDark);
    setDark(shouldUseDark);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    document.documentElement.classList.toggle("dark", nextDark);

    try {
      window.localStorage.setItem("petbites:theme", nextDark ? "dark" : "light");
    } catch {
      // Theme switching remains available even when persistence is blocked.
    }

    setDark(nextDark);
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button className="site-header__brand" type="button" onClick={onHome}>
          <BrandMark compact />
          <span>
            <strong>PetBites</strong>
            <small>Panduan nutrisi burung</small>
          </span>
        </button>

        <nav className="site-header__nav" aria-label="Navigasi utama">
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#pilih-burung">Pilih burung</a>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={dark ? "Gunakan tema terang" : "Gunakan tema gelap"}
            title={dark ? "Tema terang" : "Tema gelap"}
          >
            {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

export function LoadingState() {
  return (
    <section className="loading-page" aria-busy="true" aria-live="polite">
      <div className="loading-page__intro">
        <div className="loading-page__mark">
          <BrandMark />
        </div>
        <div>
          <p className="eyebrow">Sedang menyiapkan panduan</p>
          <h2>Memuat data burung dan pakannya</h2>
          <p>PetBites sedang menyusun informasi dari database agar siap kamu gunakan.</p>
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
  return (
    <section className="error-page">
      <Card className="error-card">
        <CardHeader>
          <div className="error-card__icon">
            <Database className="h-6 w-6" />
          </div>
          <CardTitle>Data belum bisa dimuat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert variant="destructive">
            <AlertTitle>Koneksi Supabase bermasalah</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <p className="text-sm leading-6 text-muted-foreground">
            Periksa koneksi internet dan isi <code>.env.local</code>. Database tidak diubah oleh
            tombol di bawah; PetBites hanya mencoba membaca ulang data.
          </p>
          <Button type="button" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba muat ulang
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <BrandMark compact />
          <span>
            <strong>PetBites</strong>
            <small>Dibuat untuk pemilik burung Indonesia.</small>
          </span>
        </div>
        <p>
          Informasi bersifat panduan umum. Untuk kondisi kesehatan khusus, konsultasikan dengan
          dokter hewan.
        </p>
      </div>
    </footer>
  );
}
