import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

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

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Halaman tidak ditemukan</p>
        <h1 className="mt-3 text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Sepertinya burungnya terbang terlalu jauh
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Kembali ke PetBites
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">PetBites mengalami kendala</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Halaman belum berhasil dimuat
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Coba muat ulang. Data kamu tidak berubah karena halaman ini hanya menampilkan panduan.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Kembali ke beranda
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
