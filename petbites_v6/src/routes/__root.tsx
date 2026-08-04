import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { LanguageProvider } from "@/features/petbites/language";

import { reportLovableError } from "../lib/lovable-error-reporting";
import appCss from "../styles.css?url";

const INITIAL_THEME_SCRIPT = `(() => {
  try {
    const saved = localStorage.getItem("petbites:theme");
    const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch {
    // The application will apply the theme after hydration.
  }
})();`;

const fallbackMessages = {
  id: {
    notFoundEyebrow: "Halaman tidak ditemukan",
    notFoundTitle: "Sepertinya burungnya terbang terlalu jauh",
    notFoundCopy: "Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.",
    backToPetBites: "Kembali ke PetBites",
    errorEyebrow: "PetBites mengalami kendala",
    errorTitle: "Halaman belum berhasil dimuat",
    errorCopy:
      "Coba muat ulang. Data kamu tidak berubah karena halaman ini hanya menampilkan panduan.",
    retry: "Coba lagi",
    backHome: "Kembali ke beranda",
  },
  en: {
    notFoundEyebrow: "Page not found",
    notFoundTitle: "It looks like this bird flew a little too far",
    notFoundCopy: "The address you opened is unavailable or has been moved.",
    backToPetBites: "Back to PetBites",
    errorEyebrow: "PetBites encountered a problem",
    errorTitle: "The page could not be loaded",
    errorCopy:
      "Try loading it again. Your data has not changed because this page only displays guidance.",
    retry: "Try again",
    backHome: "Back to homepage",
  },
} as const;

function useFallbackMessages() {
  const [language, setLanguage] = useState<keyof typeof fallbackMessages>("id");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("petbites:language");
      if (stored === "en" || stored === "id") setLanguage(stored);
    } catch {
      // Indonesian remains the fallback when browser storage is unavailable.
    }
  }, []);

  return fallbackMessages[language];
}

function NotFoundComponent() {
  const copy = useFallbackMessages();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">{copy.notFoundEyebrow}</p>
        <h1 className="mt-3 text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{copy.notFoundTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.notFoundCopy}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {copy.backToPetBites}
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const copy = useFallbackMessages();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">{copy.errorEyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {copy.errorTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.errorCopy}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {copy.retry}
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {copy.backHome}
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "color-scheme", content: "light dark" },
      { name: "theme-color", content: "#f7f5ed" },
      { title: "PetBites — Panduan Nutrisi Burung" },
      {
        name: "description",
        content:
          "Panduan pakan burung: cari makanan, cek bahan berbahaya, lihat perkiraan porsi, dan ikuti resep sederhana.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      {
        rel: "preload",
        href: "/theme/forest-day.webp",
        as: "image",
        type: "image/webp",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "preload",
        href: "/theme/forest-night.webp",
        as: "image",
        type: "image/webp",
        media: "(prefers-color-scheme: dark)",
      },
      { rel: "preload", href: "/welcome/flying-bird.webp", as: "image", type: "image/webp" },
      {
        rel: "preload",
        href: "/welcome/flying-bird-wing.webp",
        as: "image",
        type: "image/webp",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INITIAL_THEME_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Outlet />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
