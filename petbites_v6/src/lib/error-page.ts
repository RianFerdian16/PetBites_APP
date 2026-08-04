type ErrorPageLanguage = "id" | "en";

const errorCopy: Record<
  ErrorPageLanguage,
  { title: string; message: string; retry: string; home: string }
> = {
  id: {
    title: "Halaman belum berhasil dimuat",
    message: "Terjadi kendala pada server. Coba muat ulang atau kembali ke beranda.",
    retry: "Coba lagi",
    home: "Kembali ke beranda",
  },
  en: {
    title: "This page could not be loaded",
    message: "The server encountered a problem. Try refreshing or return to the homepage.",
    retry: "Try again",
    home: "Go to homepage",
  },
};

export function renderErrorPage(preferredLanguage: ErrorPageLanguage = "id"): string {
  const copy = errorCopy[preferredLanguage];
  const serializedCopy = JSON.stringify(errorCopy).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="${preferredLanguage}">
  <head>
    <meta charset="utf-8" />
    <title>${copy.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1 id="error-title">${copy.title}</h1>
      <p id="error-message">${copy.message}</p>
      <div class="actions">
        <button id="error-retry" class="primary" onclick="location.reload()">${copy.retry}</button>
        <a id="error-home" class="secondary" href="/">${copy.home}</a>
      </div>
    </div>
    <script>
      (() => {
        const copy = ${serializedCopy};
        let language = ${JSON.stringify(preferredLanguage)};
        try {
          const saved = localStorage.getItem("petbites:language");
          if (saved === "id" || saved === "en") language = saved;
          else if (navigator.language && navigator.language.toLowerCase().startsWith("en")) language = "en";
        } catch {
          if (navigator.language && navigator.language.toLowerCase().startsWith("en")) language = "en";
        }
        const selected = copy[language];
        document.documentElement.lang = language;
        document.title = selected.title;
        document.getElementById("error-title").textContent = selected.title;
        document.getElementById("error-message").textContent = selected.message;
        document.getElementById("error-retry").textContent = selected.retry;
        document.getElementById("error-home").textContent = selected.home;
      })();
    </script>
  </body>
</html>`;
}

export function preferredErrorLanguage(request: Request): ErrorPageLanguage {
  const header = request.headers.get("accept-language")?.toLowerCase() ?? "";
  return header.startsWith("en") ? "en" : "id";
}
