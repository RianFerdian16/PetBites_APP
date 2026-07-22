import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PawPrint, Search, ArrowRight, ArrowLeft, ShieldCheck, AlertTriangle, ShieldAlert, Scale, ChefHat, Sun, Moon, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { birdsData, type Bird, type Safety } from "@/lib/birds-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PetBites — Panduan Nutrisi & Pakan Hewan Kesayangan" },
      { name: "description", content: "Panduan lengkap nutrisi, cek makanan berbahaya, kalkulator porsi, dan resep racikan untuk burung kesayanganmu." },
      { property: "og:title", content: "PetBites — Panduan Nutrisi Burung & Hewan" },
      { property: "og:description", content: "Cari pakan aman, hindari yang beracun, hitung porsi tepat, dan racik resep sendiri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PetBites,
});

const categories = [
  { id: "bird", label: "Burung", emoji: "🐦", active: true },
  { id: "cat", label: "Kucing", emoji: "🐱", active: false },
  { id: "dog", label: "Anjing", emoji: "🐶", active: false },
];

function PetBites() {
  const [selected, setSelected] = useState<Bird | null>(null);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {selected ? (
          <Dashboard bird={selected} onBack={() => setSelected(null)} />
        ) : (
          <Home onSelect={setSelected} />
        )}
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        🐾 PetBites · Nutrisi terpercaya untuk sahabat berbulu · Data referensi umum, konsultasikan kondisi khusus ke dokter hewan.
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <PawPrint className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-bold sm:text-xl">🐾 PetBites</h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            Panduan Nutrisi & Pakan Hewan Kesayangan
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto hidden bg-mint text-mint-foreground sm:inline-flex">
          Phase 1 · Birds
        </Badge>
      </div>
    </header>
  );
}

function Home({ onSelect }: { onSelect: (b: Bird) => void }) {
  const [category, setCategory] = useState("bird");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => birdsData.filter((b) => b.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="space-y-10 pt-8 sm:pt-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card px-6 py-10 shadow-sm sm:px-10 sm:py-14">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-warm/40 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <Badge className="mb-4 bg-mint text-mint-foreground hover:bg-mint">Smart nutrition for happier pets</Badge>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-5xl">
            Panduan Nutrisi <span className="text-primary">Lengkap & Aman</span> untuk Hewan Kesayanganmu
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Cari pakan yang tepat, hindari bahan berbahaya, hitung porsi harian, dan racik menu buatan sendiri —
            semuanya dalam satu tempat.
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              disabled={!c.active}
              onClick={() => setCategory(c.id)}
              className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                category === c.id && c.active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              } ${!c.active ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span className="text-base">{c.emoji}</span>
              {c.label}
              {!c.active && (
                <Badge variant="outline" className="ml-1 border-amber-warm/60 bg-amber-warm/20 text-[10px] font-semibold text-amber-warm-foreground">
                  Coming Soon
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari jenis burung... e.g. Lovebird, Kenari"
            className="h-12 rounded-2xl border-border bg-card pl-11 shadow-sm focus-visible:ring-primary"
          />
        </div>
      </section>

      {/* Species grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((b) => (
          <SpeciesCard key={b.id} bird={b} onSelect={() => onSelect(b)} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            Tidak menemukan spesies. Coba kata kunci lain.
          </p>
        )}
      </section>
    </div>
  );
}

function SpeciesCard({ bird, onSelect }: { bird: Bird; onSelect: () => void }) {
  return (
    <Card className="group flex flex-col overflow-hidden border-border/60 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div className="flex items-center justify-center bg-gradient-to-br from-mint to-amber-warm/40 py-8 text-6xl">
        {bird.emoji}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{bird.name}</CardTitle>
        <CardDescription className="text-xs italic">{bird.scientific}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="line-clamp-3 text-xs text-muted-foreground">{bird.description}</p>
      </CardContent>
      <div className="p-4 pt-0">
        <Button onClick={onSelect} className="w-full justify-between" size="sm">
          Lihat Panduan Nutrisi
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
}

function Dashboard({ bird, onBack }: { bird: Bird; onBack: () => void }) {
  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Pilih Burung Lain
        </Button>
      </div>

      <Card className="overflow-hidden border-border/60">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-primary/10 via-mint to-amber-warm/30 p-6 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-card text-4xl shadow-sm">
            {bird.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Panduan Nutrisi</p>
            <h2 className="truncate font-display text-2xl font-bold sm:text-3xl">{bird.name}</h2>
            <p className="text-sm italic text-muted-foreground">{bird.scientific}</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="food" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-muted/60 p-1 sm:grid-cols-4">
          <TabsTrigger value="food" className="gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm">
            <Search className="h-4 w-4" /> Food Finder
          </TabsTrigger>
          <TabsTrigger value="toxic" className="gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm">
            <AlertTriangle className="h-4 w-4" /> Toxic Check
          </TabsTrigger>
          <TabsTrigger value="portion" className="gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm">
            <Scale className="h-4 w-4" /> Porsi
          </TabsTrigger>
          <TabsTrigger value="recipe" className="gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm">
            <ChefHat className="h-4 w-4" /> Resep
          </TabsTrigger>
        </TabsList>

        <TabsContent value="food"><FoodFinder bird={bird} /></TabsContent>
        <TabsContent value="toxic"><ToxicChecker bird={bird} /></TabsContent>
        <TabsContent value="portion"><PortionCalculator bird={bird} /></TabsContent>
        <TabsContent value="recipe"><Recipes bird={bird} /></TabsContent>
      </Tabs>
    </div>
  );
}

function FoodFinder({ bird }: { bird: Bird }) {
  const main = bird.foods.filter((f) => f.category === "main");
  const extra = bird.foods.filter((f) => f.category === "extra");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <FoodSection title="Makanan Utama" subtitle="Biji-bijian / Voer" tone="primary" items={main} />
      <FoodSection title="Extra Fooding (EF)" subtitle="Sayur, Buah, Serangga" tone="amber" items={extra} />
    </div>
  );
}

function FoodSection({
  title, subtitle, tone, items,
}: { title: string; subtitle: string; tone: "primary" | "amber"; items: Bird["foods"] }) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone === "primary" ? "bg-primary/15 text-primary" : "bg-amber-warm/30 text-amber-warm-foreground"}`}>
            {tone === "primary" ? "🌾" : "🥬"}
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((f) => (
          <div key={f.name} className="rounded-xl border border-border/60 bg-background/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm">{f.name}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {f.benefits.map((b) => (
                <Badge key={b} variant="secondary" className="bg-mint text-mint-foreground text-[10px] font-medium">
                  {b}
                </Badge>
              ))}
            </div>
            {f.note && <p className="mt-2 text-xs text-muted-foreground">{f.note}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ToxicChecker({ bird }: { bird: Bird }) {
  const [q, setQ] = useState("");
  const match = useMemo(() => {
    if (!q.trim()) return null;
    return bird.toxic.find((t) => t.name.toLowerCase().includes(q.trim().toLowerCase())) ?? "not-found";
  }, [q, bird.toxic]);

  const toxicList = bird.toxic.filter((t) => t.status === "toxic");

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Cek Makanan Berbahaya</CardTitle>
          <CardDescription>Ketik nama bahan untuk cek keamanannya secara instan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari bahan makanan... (misal: Alpukat, Apel, Sawi, Cokelat)"
              className="h-12 rounded-2xl pl-11"
            />
          </div>

          {match === "not-found" && (
            <Alert>
              <AlertTitle>Belum ada di database</AlertTitle>
              <AlertDescription>
                Bahan "{q}" belum terdaftar. Sebagai prinsip umum: hindari makanan olahan, berbumbu, atau mengandung gula/garam tinggi.
              </AlertDescription>
            </Alert>
          )}
          {match && match !== "not-found" && <ResultCard entry={match} />}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-toxic" />
            <CardTitle className="text-base">Common Kitchen Foods to Avoid</CardTitle>
          </div>
          <CardDescription>Bahan dapur yang sering ada tapi berbahaya untuk burung.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {toxicList.map((t) => (
            <div key={t.name} className="flex items-start gap-3 rounded-xl border border-toxic/30 bg-toxic/5 p-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-toxic text-toxic-foreground">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.explanation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultCard({ entry }: { entry: { name: string; status: Safety; explanation: string } }) {
  const config: Record<Safety, { label: string; icon: React.ReactNode; className: string }> = {
    safe: {
      label: "🟢 Aman",
      icon: <ShieldCheck className="h-5 w-5" />,
      className: "border-safe/40 bg-safe/10 text-safe-foreground",
    },
    caution: {
      label: "🟡 Aman dengan Catatan",
      icon: <AlertTriangle className="h-5 w-5" />,
      className: "border-caution/50 bg-caution/15 text-caution-foreground",
    },
    toxic: {
      label: "🔴 Berbahaya",
      icon: <ShieldAlert className="h-5 w-5" />,
      className: "border-toxic/50 bg-toxic/10 text-toxic",
    },
  };
  const c = config[entry.status];
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 ${c.className}`}>
      <div className="shrink-0">{c.icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{entry.name}</p>
          <Badge className={
            entry.status === "safe" ? "bg-safe text-safe-foreground" :
            entry.status === "caution" ? "bg-caution text-caution-foreground" :
            "bg-toxic text-toxic-foreground"
          }>{c.label}</Badge>
        </div>
        <p className="mt-1.5 text-sm">{entry.explanation}</p>
      </div>
    </div>
  );
}

function PortionCalculator({ bird }: { bird: Bird }) {
  const [condition, setCondition] = useState<"Harian" | "Mabuk" | "Ternak">("Harian");
  const [size, setSize] = useState<"Kecil" | "Standar" | "Besar">("Standar");

  const result = bird.portions.find((p) => p.condition === condition && p.size === size)!;

  const conditions = [
    { id: "Harian" as const, label: "Harian / Normal", emoji: "☀️" },
    { id: "Mabuk" as const, label: "Mabung / Rontok Bulu", emoji: "🪶" },
    { id: "Ternak" as const, label: "Masa Ternak / Breeding", emoji: "🥚" },
  ];
  const sizes = [
    { id: "Kecil" as const, label: "Kecil" },
    { id: "Standar" as const, label: "Standar" },
    { id: "Besar" as const, label: "Besar" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Input Kondisi</CardTitle>
          <CardDescription>Pilih kondisi & ukuran burung untuk rekomendasi porsi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kondisi</p>
            <div className="grid gap-2">
              {conditions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCondition(c.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition ${
                    condition === c.id
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span>{c.label}</span>
                  {condition === c.id && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ukuran / Berat</p>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={`rounded-xl border p-3 text-sm transition ${
                    size === s.id
                      ? "border-primary bg-primary text-primary-foreground font-medium"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-mint/40 to-amber-warm/20">
        <CardHeader>
          <CardTitle className="text-base">Rekomendasi Porsi</CardTitle>
          <CardDescription>{bird.name} · {condition} · {size}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card/80 p-4 backdrop-blur">
              <p className="text-xs text-muted-foreground">Total Harian</p>
              <p className="mt-1 font-display text-3xl font-bold text-primary">{result.grams}<span className="ml-1 text-base font-medium text-foreground">g</span></p>
            </div>
            <div className="rounded-2xl bg-card/80 p-4 backdrop-blur">
              <p className="text-xs text-muted-foreground">Setara Sendok Teh</p>
              <p className="mt-1 font-display text-3xl font-bold text-amber-warm-foreground">{result.teaspoon}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jadwal Pemberian</p>
            <div className="flex items-start gap-3 rounded-xl bg-card/80 p-3 backdrop-blur">
              <Sun className="h-5 w-5 shrink-0 text-amber-warm-foreground" />
              <div><p className="text-xs font-medium">Pagi</p><p className="text-sm">{result.morning}</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-card/80 p-3 backdrop-blur">
              <Moon className="h-5 w-5 shrink-0 text-primary" />
              <div><p className="text-xs font-medium">Sore</p><p className="text-sm">{result.evening}</p></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            * Estimasi umum. Pantau berat & kondisi burung, sesuaikan bila perlu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Recipes({ bird }: { bird: Bird }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {bird.recipes.map((r) => (
        <Card key={r.title} className="flex flex-col border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-warm/40 text-lg">
                🍲
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base">{r.title}</CardTitle>
                <CardDescription className="text-xs">{r.purpose}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bahan</p>
              <ul className="space-y-1.5">
                {r.ingredients.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Langkah</p>
              <ol className="space-y-2">
                {r.steps.map((s, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
