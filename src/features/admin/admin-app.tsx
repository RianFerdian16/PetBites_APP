import type { Session } from "@supabase/supabase-js";
import {
  Bot,
  Copy,
  Database,
  ExternalLink,
  ImagePlus,
  LoaderCircle,
  LogOut,
  MessageCirclePlus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteAdminRecord,
  fetchAdminData,
  fetchAdminProfile,
  getAdminSession,
  requestAiSuggestion,
  saveAdminRecord,
  signInAdmin,
  signOutAdmin,
  slugify,
  subscribeToAdminAuth,
  uploadBirdMedia,
  type AdminData,
  type AdminEntity,
  type AdminProfile,
  type AdminRecord,
  type AiAction,
} from "@/lib/admin-service";

import { BrandMark } from "../petbites/illustrations";

type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "lines";

type FieldDefinition = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  help?: string;
};

type EntityDefinition = {
  title: string;
  singular: string;
  description: string;
  primary: string;
  secondary?: string;
  fields: FieldDefinition[];
  create: () => AdminRecord;
};

type EditorFeedback = {
  tone: "success" | "info" | "error";
  message: string;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Perlu review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const REVIEW_OPTIONS = [
  { value: "needs_review", label: "Needs review" },
  { value: "reviewed", label: "Reviewed" },
  { value: "archived", label: "Archived" },
];

const definitions: Record<AdminEntity, EntityDefinition> = {
  birds: {
    title: "Burung",
    singular: "burung",
    description: "Kelola profil burung, foto, status publikasi, dan referensi.",
    primary: "name",
    secondary: "scientific_name",
    fields: [
      { key: "id", label: "ID / slug", type: "text", required: true },
      { key: "name", label: "Nama", type: "text", required: true },
      { key: "emoji", label: "Emoji cadangan", type: "text" },
      { key: "scientific_name", label: "Nama ilmiah", type: "text", required: true },
      { key: "description", label: "Deskripsi", type: "textarea", required: true },
      { key: "image_url", label: "URL gambar", type: "text", placeholder: "https://..." },
      { key: "sort_order", label: "Urutan", type: "number", required: true },
      { key: "is_active", label: "Aktif", type: "checkbox" },
      { key: "content_status", label: "Status konten", type: "select", options: STATUS_OPTIONS },
      { key: "review_status", label: "Status review", type: "select", options: REVIEW_OPTIONS },
      { key: "source_urls", label: "Sumber (satu URL per baris)", type: "lines" },
    ],
    create: () => ({
      id: "",
      name: "",
      emoji: "🐦",
      scientific_name: "",
      description: "",
      image_url: "",
      sort_order: 0,
      is_active: true,
      content_status: "draft",
      review_status: "needs_review",
      source_urls: [],
    }),
  },
  bird_foods: {
    title: "Pakan",
    singular: "pakan",
    description: "Kelola makanan utama, tambahan, manfaat, catatan, dan sumber.",
    primary: "name",
    secondary: "bird_id",
    fields: [
      { key: "id", label: "ID / slug", type: "text", required: true },
      { key: "bird_id", label: "Burung", type: "select", required: true },
      { key: "name", label: "Nama pakan", type: "text", required: true },
      {
        key: "category",
        label: "Kategori",
        type: "select",
        options: [
          { value: "main", label: "Utama" },
          { value: "extra", label: "Tambahan" },
        ],
      },
      { key: "benefits", label: "Manfaat (satu per baris)", type: "lines" },
      { key: "note", label: "Catatan", type: "textarea" },
      { key: "sort_order", label: "Urutan", type: "number" },
      { key: "content_status", label: "Status konten", type: "select", options: STATUS_OPTIONS },
      { key: "review_status", label: "Status review", type: "select", options: REVIEW_OPTIONS },
      { key: "source_urls", label: "Sumber (satu URL per baris)", type: "lines" },
    ],
    create: () => ({
      id: "",
      bird_id: "",
      name: "",
      category: "main",
      benefits: [],
      note: "",
      sort_order: 0,
      content_status: "draft",
      review_status: "needs_review",
      source_urls: [],
    }),
  },
  toxic_entries: {
    title: "Toxic Checker",
    singular: "bahan",
    description: "Kelola bahan aman, perlu dibatasi, atau berbahaya.",
    primary: "name",
    secondary: "status",
    fields: [
      { key: "id", label: "ID / slug", type: "text", required: true },
      { key: "bird_id", label: "Burung khusus (kosong = berlaku umum)", type: "select" },
      { key: "name", label: "Nama bahan", type: "text", required: true },
      {
        key: "status",
        label: "Status keamanan",
        type: "select",
        options: [
          { value: "safe", label: "Aman" },
          { value: "caution", label: "Perlu dibatasi" },
          { value: "toxic", label: "Berbahaya" },
        ],
      },
      { key: "explanation", label: "Penjelasan", type: "textarea", required: true },
      { key: "sort_order", label: "Urutan", type: "number" },
      { key: "content_status", label: "Status konten", type: "select", options: STATUS_OPTIONS },
      { key: "review_status", label: "Status review", type: "select", options: REVIEW_OPTIONS },
      { key: "source_urls", label: "Sumber (satu URL per baris)", type: "lines" },
    ],
    create: () => ({
      id: "",
      bird_id: "",
      name: "",
      status: "caution",
      explanation: "",
      sort_order: 0,
      content_status: "draft",
      review_status: "needs_review",
      source_urls: [],
    }),
  },
  portion_rules: {
    title: "Aturan porsi",
    singular: "aturan porsi",
    description: "Kelola estimasi porsi berdasarkan ukuran dan kondisi burung.",
    primary: "id",
    secondary: "bird_id",
    fields: [
      { key: "id", label: "ID / slug", type: "text", required: true },
      { key: "bird_id", label: "Burung", type: "select", required: true },
      {
        key: "size",
        label: "Ukuran",
        type: "select",
        options: [
          { value: "Kecil", label: "Kecil" },
          { value: "Standar", label: "Standar" },
          { value: "Besar", label: "Besar" },
        ],
      },
      {
        key: "condition",
        label: "Kondisi",
        type: "select",
        options: [
          { value: "Harian", label: "Harian" },
          { value: "Mabung", label: "Mabung" },
          { value: "Ternak", label: "Ternak" },
        ],
      },
      { key: "grams", label: "Gram per hari", type: "number", required: true },
      { key: "teaspoon", label: "Perkiraan sendok", type: "text", required: true },
      { key: "morning", label: "Jadwal pagi", type: "text", required: true },
      { key: "evening", label: "Jadwal sore", type: "text", required: true },
      { key: "sort_order", label: "Urutan", type: "number" },
      { key: "content_status", label: "Status konten", type: "select", options: STATUS_OPTIONS },
      { key: "review_status", label: "Status review", type: "select", options: REVIEW_OPTIONS },
      { key: "source_urls", label: "Sumber (satu URL per baris)", type: "lines" },
    ],
    create: () => ({
      id: "",
      bird_id: "",
      size: "Standar",
      condition: "Harian",
      grams: 1,
      teaspoon: "",
      morning: "",
      evening: "",
      sort_order: 0,
      content_status: "draft",
      review_status: "needs_review",
      source_urls: [],
    }),
  },
  recipes: {
    title: "Resep",
    singular: "resep",
    description: "Kelola resep, bahan, langkah, tujuan, dan sumber.",
    primary: "title",
    secondary: "bird_id",
    fields: [
      { key: "id", label: "ID / slug", type: "text", required: true },
      { key: "bird_id", label: "Burung", type: "select", required: true },
      { key: "title", label: "Judul resep", type: "text", required: true },
      { key: "purpose", label: "Tujuan", type: "textarea", required: true },
      { key: "ingredients", label: "Bahan (satu per baris)", type: "lines", required: true },
      { key: "steps", label: "Langkah (satu per baris)", type: "lines", required: true },
      { key: "sort_order", label: "Urutan", type: "number" },
      { key: "content_status", label: "Status konten", type: "select", options: STATUS_OPTIONS },
      { key: "review_status", label: "Status review", type: "select", options: REVIEW_OPTIONS },
      { key: "source_urls", label: "Sumber (satu URL per baris)", type: "lines" },
    ],
    create: () => ({
      id: "",
      bird_id: "",
      title: "",
      purpose: "",
      ingredients: [],
      steps: [],
      sort_order: 0,
      content_status: "draft",
      review_status: "needs_review",
      source_urls: [],
    }),
  },
  bird_requests: {
    title: "Request pengguna",
    singular: "request",
    description: "Tinjau permintaan jenis burung dari pengunjung website.",
    primary: "bird_name",
    secondary: "contact",
    fields: [
      { key: "id", label: "ID request", type: "text", required: true },
      { key: "bird_name", label: "Nama burung", type: "text", required: true },
      { key: "local_name", label: "Nama lokal / nama lain", type: "text" },
      { key: "scientific_name", label: "Nama ilmiah", type: "text" },
      { key: "reason", label: "Kebutuhan pengguna", type: "textarea", required: true },
      { key: "contact", label: "Kontak private", type: "text" },
      {
        key: "status",
        label: "Status request",
        type: "select",
        options: [
          { value: "pending", label: "Pending" },
          { value: "reviewing", label: "Sedang direview" },
          { value: "approved", label: "Disetujui" },
          { value: "rejected", label: "Ditolak" },
          { value: "duplicate", label: "Duplikat" },
        ],
      },
      { key: "admin_notes", label: "Catatan admin", type: "textarea" },
    ],
    create: () => ({
      id: "",
      bird_name: "",
      local_name: "",
      scientific_name: "",
      reason: "",
      contact: "",
      status: "pending",
      admin_notes: "",
    }),
  },
};

const contentEntityOrder: AdminEntity[] = [
  "birds",
  "bird_foods",
  "toxic_entries",
  "portion_rules",
  "recipes",
];

const entityOrder: AdminEntity[] = [...contentEntityOrder, "bird_requests"];

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [entity, setEntity] = useState<AdminEntity>("birds");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<AdminRecord>(() => definitions.birds.create());
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editorFeedback, setEditorFeedback] = useState<EditorFeedback | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiAction, setAiAction] = useState<AiAction>("draft");
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<Record<string, unknown> | null>(null);
  const [aiModel, setAiModel] = useState("");
  const [aiApplyNotice, setAiApplyNotice] = useState("");
  const pendingBirdDraft = useRef<AdminRecord | null>(null);

  useEffect(() => {
    let active = true;
    void getAdminSession()
      .then((nextSession) => {
        if (active) setSession(nextSession);
      })
      .catch((caught) => setError(messageFrom(caught)))
      .finally(() => active && setAuthReady(true));

    const unsubscribe = subscribeToAdminAuth((nextSession) => setSession(nextSession));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setProfile(null);
      setData(null);
      return;
    }

    void fetchAdminProfile(session.user.id)
      .then(setProfile)
      .catch((caught) => setError(messageFrom(caught)));
  }, [session]);

  const loadData = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      const nextData = await fetchAdminData();
      setData(nextData);
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const pending = entity === "birds" ? pendingBirdDraft.current : null;
    pendingBirdDraft.current = null;
    setDraft(pending ?? definitions[entity].create());
    setIsNew(true);
    setQuery("");
    setAiAction(entity === "bird_requests" ? "review" : "draft");
    setAiText("");
    setAiSuggestion(null);
    setAiModel("");
    setAiApplyNotice("");
    setEditorFeedback(null);
  }, [entity]);

  const definition = definitions[entity];
  const filteredRecords = useMemo(() => {
    const records = data?.[entity] ?? [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return records;
    return records.filter((record) => JSON.stringify(record).toLowerCase().includes(normalized));
  }, [data, entity, query]);

  const canEdit = profile?.role === "owner" || profile?.role === "editor";

  const totals = useMemo(() => {
    if (!data) return { total: 0, published: 0, review: 0, draft: 0, pendingRequests: 0 };
    const all = contentEntityOrder.flatMap((key) => data[key]);
    return {
      total: all.length,
      published: all.filter((item) => item.content_status === "published").length,
      review: all.filter((item) => item.content_status === "review").length,
      draft: all.filter((item) => item.content_status === "draft").length,
      pendingRequests: data.bird_requests.filter(
        (item) => item.status === "pending" || item.status === "reviewing",
      ).length,
    };
  }, [data]);

  function selectRecord(record: AdminRecord) {
    setDraft(recordToDraft(record));
    setIsNew(false);
    setNotice("");
    setAiText("");
    setAiSuggestion(null);
    setAiModel("");
    setAiApplyNotice("");
    setEditorFeedback(null);
  }

  function newRecord() {
    setDraft(definition.create());
    setIsNew(true);
    setNotice("");
    setAiText("");
    setAiSuggestion(null);
    setAiModel("");
    setAiApplyNotice("");
    setEditorFeedback(null);
  }

  function updateDraft(key: string, value: unknown) {
    setDraft((current) => ({ ...current, [key]: value }));
    setEditorFeedback(null);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!canEdit) {
      const message = "Role reviewer hanya dapat membaca dan menjalankan review AI.";
      setError(message);
      setEditorFeedback({ tone: "error", message });
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    setEditorFeedback(null);

    try {
      const payload = prepareRecord(entity, draft);
      await saveAdminRecord(entity, payload);
      const message = `${capitalize(definition.singular)} berhasil disimpan ke Supabase.`;
      setNotice(message);
      setEditorFeedback({
        tone: "success",
        message: `${message} Data pada form ini sekarang sudah tersimpan.`,
      });
      setDraft(payload);
      setIsNew(false);
      await loadData();
    } catch (caught) {
      const message = messageFrom(caught);
      setError(message);
      setEditorFeedback({ tone: "error", message: `Gagal menyimpan: ${message}` });
    } finally {
      setSaving(false);
    }
  }

  async function refreshCurrentRecord() {
    if (!profile) return;

    const currentId = String(draft.id ?? "").trim();
    setRefreshing(true);
    setError("");
    setNotice("");
    setEditorFeedback(null);

    try {
      const nextData = await fetchAdminData();
      setData(nextData);

      if (isNew || !currentId) {
        setEditorFeedback({
          tone: "info",
          message:
            "Daftar konten sudah dimuat ulang. Form baru tidak diubah karena belum tersimpan di database.",
        });
        return;
      }

      const refreshedRecord = nextData[entity].find((record) => String(record.id) === currentId);
      if (!refreshedRecord) {
        throw new Error("Konten ini tidak ditemukan lagi di database.");
      }

      setDraft(recordToDraft(refreshedRecord));
      setAiText("");
      setAiSuggestion(null);
      setAiModel("");
      setAiApplyNotice("");
      setEditorFeedback({
        tone: "info",
        message:
          "Konten berhasil dimuat ulang dari Supabase. Isi form, termasuk deskripsi, kembali ke versi terakhir yang tersimpan.",
      });
    } catch (caught) {
      const message = messageFrom(caught);
      setError(message);
      setEditorFeedback({ tone: "error", message: `Gagal memuat ulang: ${message}` });
    } finally {
      setRefreshing(false);
    }
  }

  async function remove() {
    if (!canEdit || isNew || !draft.id) return;
    if (
      !window.confirm(
        `Hapus ${definition.singular} “${String(draft[definition.primary] ?? draft.id)}”?`,
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      await deleteAdminRecord(entity, String(draft.id));
      newRecord();
      const message = `${capitalize(definition.singular)} berhasil dihapus dari Supabase.`;
      setNotice(message);
      setEditorFeedback({ tone: "success", message });
      await loadData();
    } catch (caught) {
      const message = messageFrom(caught);
      setError(message);
      setEditorFeedback({ tone: "error", message: `Gagal menghapus: ${message}` });
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File | null) {
    if (!canEdit || !file || entity !== "birds") return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadBirdMedia(file, String(draft.id || draft.name || "bird"));
      updateDraft("image_url", url);
      const message =
        "Gambar berhasil diupload. Tekan Simpan untuk menyimpan URL ke profil burung.";
      setNotice(message);
      setEditorFeedback({ tone: "info", message });
    } catch (caught) {
      const message = messageFrom(caught);
      setError(message);
      setEditorFeedback({ tone: "error", message: `Gagal mengupload gambar: ${message}` });
    } finally {
      setUploading(false);
    }
  }

  async function askAi() {
    if (profile?.role === "reviewer" && aiAction !== "review") {
      const message =
        "Role reviewer hanya dapat memakai pilihan Cek bagian isi yang perlu diperbaiki.";
      setError(message);
      setEditorFeedback({ tone: "error", message });
      return;
    }

    setAiBusy(true);
    setError("");
    setAiText("");
    setAiSuggestion(null);
    setAiModel("");
    setAiApplyNotice("");
    setEditorFeedback(null);

    try {
      const response = await requestAiSuggestion({
        action: aiAction,
        entity,
        draft: prepareRecord(entity, draft, false),
        instruction: aiInstruction,
      });
      setAiText(response.text ?? "");
      setAiSuggestion(response.suggestion ?? null);
      setAiModel(response.model ?? "");
      setEditorFeedback({
        tone: "info",
        message:
          aiAction === "translate"
            ? "Versi Inggris berhasil dibuat. Salin hasilnya bila ingin dipakai di tempat lain."
            : aiAction === "review"
              ? "Pemeriksaan AI selesai. Hasil ini adalah panduan review dan tidak mengubah form."
              : "Hasil AI berhasil dibuat. Periksa hasilnya sebelum diterapkan ke draft.",
      });
    } catch (caught) {
      const message = messageFrom(caught);
      setError(message);
      setEditorFeedback({ tone: "error", message: `AI gagal: ${message}` });
    } finally {
      setAiBusy(false);
    }
  }

  function applyAiSuggestion() {
    if (!canEdit || !aiSuggestion || (aiAction !== "draft" && aiAction !== "improve")) return;

    const sanitized = sanitizeAiSuggestion(entity, aiSuggestion);
    const fieldLabels = new Map(definition.fields.map((field) => [field.key, field.label]));
    const changedEntries = Object.entries(sanitized).filter(
      ([key, value]) => fieldLabels.has(key) && !valuesEqual(draft[key], value),
    );

    if (changedEntries.length === 0) {
      const message =
        "Tidak ada perubahan valid yang bisa diterapkan. AI mungkin hanya mengonfirmasi isi yang sudah sama atau memberi field yang tidak digunakan CMS.";
      setAiApplyNotice(message);
      setEditorFeedback({ tone: "info", message });
      return;
    }

    const applicable = Object.fromEntries(changedEntries);
    const changedLabels = changedEntries.map(([key]) => fieldLabels.get(key) ?? key);

    setDraft((current) => ({
      ...current,
      ...applicable,
      ...(entity === "bird_requests"
        ? {}
        : {
            ai_generated: true,
            ai_model: aiModel || null,
            ai_generated_at: new Date().toISOString(),
          }),
    }));

    const message = `Diterapkan ke draft: ${changedLabels.join(", ")}. Tekan Simpan untuk menyimpan perubahan ke Supabase.`;
    setAiApplyNotice(message);
    setNotice(message);
    setEditorFeedback({ tone: "info", message });
  }

  async function copyAiTranslation() {
    const value = aiText.trim();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      const message = "Versi Inggris berhasil disalin ke clipboard.";
      setAiApplyNotice(message);
      setEditorFeedback({ tone: "success", message });
    } catch {
      const message = "Tidak bisa menyalin otomatis. Blok teks hasil AI lalu salin secara manual.";
      setAiApplyNotice(message);
      setEditorFeedback({ tone: "error", message });
    }
  }

  function changeAiAction(nextAction: AiAction) {
    setAiAction(nextAction);
    setAiText("");
    setAiSuggestion(null);
    setAiModel("");
    setAiApplyNotice("");
    setEditorFeedback(null);
  }

  function createBirdDraftFromRequest() {
    if (entity !== "bird_requests" || isNew) return;
    const name = String(draft.bird_name ?? "").trim();
    if (!name) {
      setError("Nama burung pada request masih kosong.");
      return;
    }

    pendingBirdDraft.current = {
      ...definitions.birds.create(),
      id: slugify(name),
      name,
      scientific_name: String(draft.scientific_name ?? "").trim(),
      content_status: "draft",
      review_status: "needs_review",
      source_urls: [],
    };
    setEntity("birds");
    setNotice("Draft profil burung dibuat dari request. Lengkapi dan review sebelum publish.");
  }

  if (!authReady) return <AdminLoading label="Memeriksa sesi admin…" />;
  if (!session) return <AdminLogin onError={setError} error={error} />;
  if (!profile) {
    return (
      <AdminMessage
        title="Akun belum memiliki akses CMS"
        copy="Login berhasil, tetapi user ini belum terdaftar di tabel admin_users. Ikuti langkah bootstrap admin di README_CMS_AI_SETUP.md."
        onSignOut={() => void signOutAdmin()}
      />
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a href="/" className="admin-brand" aria-label="Kembali ke PetBites">
          <BrandMark compact />
          <span>
            <strong>PetBites CMS</strong>
            <small>Content management + AI assistant</small>
          </span>
        </a>
        <div className="admin-account">
          <span>
            <strong>{profile.email ?? session.user.email}</strong>
            <small>{profile.role}</small>
          </span>
          <Button variant="outline" onClick={() => void signOutAdmin()} className="gap-2">
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-overview">
          <div>
            <p className="eyebrow">CMS dashboard</p>
            <h1>Kelola konten tanpa edit SQL atau redeploy</h1>
            <p>
              Perubahan tersimpan di Supabase. Konten berstatus Published langsung tersedia untuk
              website publik setelah cache pengguna diperbarui.
            </p>
          </div>
          <div className="admin-stats" aria-label="Ringkasan konten">
            <article>
              <strong>{totals.total}</strong>
              <span>Total konten</span>
            </article>
            <article>
              <strong>{totals.published}</strong>
              <span>Published</span>
            </article>
            <article>
              <strong>{totals.review}</strong>
              <span>Perlu review</span>
            </article>
            <article>
              <strong>{totals.draft}</strong>
              <span>Draft</span>
            </article>
            <article>
              <strong>{totals.pendingRequests}</strong>
              <span>Request aktif</span>
            </article>
          </div>
        </section>

        {error && <div className="admin-alert admin-alert--error">{error}</div>}
        {notice && <div className="admin-alert admin-alert--success">{notice}</div>}

        <nav className="admin-tabs" aria-label="Jenis konten CMS">
          {entityOrder.map((key) => (
            <button
              type="button"
              key={key}
              className={entity === key ? "is-active" : ""}
              onClick={() => setEntity(key)}
            >
              {definitions[key].title}
              <span>{data?.[key].length ?? 0}</span>
            </button>
          ))}
        </nav>

        <section className="admin-workspace">
          <aside className="admin-list-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>{definition.title}</h2>
                <p>{definition.description}</p>
              </div>
              {entity !== "bird_requests" && (
                <Button onClick={newRecord} className="gap-2">
                  <Plus className="h-4 w-4" /> Baru
                </Button>
              )}
            </div>

            <label className="admin-search">
              <Search className="h-4 w-4" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari konten…"
              />
            </label>

            <div className="admin-record-list">
              {loading && <AdminLoading label="Memuat konten…" compact />}
              {!loading && filteredRecords.length === 0 && (
                <p className="admin-empty">Belum ada data yang cocok.</p>
              )}
              {filteredRecords.map((record) => (
                <button
                  type="button"
                  key={record.id}
                  className={String(draft.id) === record.id && !isNew ? "is-active" : ""}
                  onClick={() => selectRecord(record)}
                >
                  <span>
                    <strong>{String(record[definition.primary] ?? record.id)}</strong>
                    {definition.secondary && record[definition.secondary] != null && (
                      <small>{String(record[definition.secondary])}</small>
                    )}
                  </span>
                  <ContentBadge
                    value={String(record.content_status ?? record.status ?? "published")}
                  />
                </button>
              ))}
            </div>
          </aside>

          <section className="admin-editor-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">{isNew ? "Konten baru" : "Edit konten"}</p>
                <h2>
                  {isNew
                    ? `Tambah ${definition.singular}`
                    : String(draft[definition.primary] ?? draft.id)}
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => void refreshCurrentRecord()}
                disabled={refreshing}
                className="gap-2"
              >
                {refreshing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {refreshing ? "Memuat…" : "Muat ulang"}
              </Button>
            </div>

            <form onSubmit={save} className="admin-form">
              <div className="admin-fields">
                {definition.fields.map((field) => (
                  <AdminField
                    key={field.key}
                    field={field}
                    value={draft[field.key]}
                    birds={data?.birds ?? []}
                    disabled={!canEdit || (!isNew && field.key === "id")}
                    onChange={(value) => updateDraft(field.key, value)}
                  />
                ))}
              </div>

              {entity === "birds" && (
                <div className="admin-media-box">
                  <div>
                    <ImagePlus className="h-5 w-5" />
                    <span>
                      <strong>Upload gambar burung</strong>
                      <small>PNG, JPG, atau WebP. Maksimal 6 MB.</small>
                    </span>
                  </div>
                  <label className="admin-upload-button">
                    {uploading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    Pilih gambar
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploading || !canEdit}
                      onChange={(event) => void upload(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  {typeof draft.image_url === "string" && draft.image_url && (
                    <a
                      href={draft.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-media-preview"
                    >
                      <img src={draft.image_url} alt="Preview upload" />
                      <span>
                        <ExternalLink className="h-4 w-4" /> Buka gambar
                      </span>
                    </a>
                  )}
                </div>
              )}

              {entity === "bird_requests" && !isNew && (
                <div className="admin-request-actions">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    disabled={!canEdit}
                    onClick={createBirdDraftFromRequest}
                  >
                    <MessageCirclePlus className="h-4 w-4" />
                    Buat draft profil burung
                  </Button>
                </div>
              )}

              <AiAssistant
                entity={entity}
                action={aiAction}
                instruction={aiInstruction}
                busy={aiBusy}
                text={aiText}
                suggestion={aiSuggestion}
                onAction={changeAiAction}
                onInstruction={setAiInstruction}
                onAsk={() => void askAi()}
                canApply={canEdit && (aiAction === "draft" || aiAction === "improve")}
                canCopy={aiAction === "translate" && Boolean(aiText.trim())}
                applyNotice={aiApplyNotice}
                onApply={applyAiSuggestion}
                onCopy={() => void copyAiTranslation()}
              />

              {editorFeedback && (
                <div
                  className={`admin-editor-feedback admin-editor-feedback--${editorFeedback.tone}`}
                  role="status"
                  aria-live="polite"
                >
                  {editorFeedback.message}
                </div>
              )}

              <div className="admin-form-actions">
                {!isNew && (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 admin-delete"
                    disabled={!canEdit}
                    onClick={() => void remove()}
                  >
                    <Trash2 className="h-4 w-4" /> Hapus
                  </Button>
                )}
                <Button type="submit" disabled={saving || !canEdit} className="gap-2">
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan
                </Button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}

function AdminLogin({ onError, error }: { onError: (value: string) => void; error: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    onError("");
    try {
      await signInAdmin(email, password);
    } catch (caught) {
      onError(messageFrom(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <form className="admin-auth-card" onSubmit={submit}>
        <div className="admin-auth-brand">
          <BrandMark />
          <span>
            <strong>PetBites CMS</strong>
            <small>Admin access</small>
          </span>
        </div>
        <div>
          <p className="eyebrow">Login admin</p>
          <h1>Kelola konten PetBites</h1>
          <p>Masuk menggunakan akun Supabase Auth yang sudah didaftarkan sebagai admin.</p>
        </div>
        {error && <div className="admin-alert admin-alert--error">{error}</div>}
        <label>
          Email
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <Button type="submit" disabled={busy} className="gap-2">
          {busy ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Masuk
        </Button>
        <a href="/">← Kembali ke website</a>
      </form>
    </main>
  );
}

function AdminField({
  field,
  value,
  birds,
  disabled,
  onChange,
}: {
  field: FieldDefinition;
  value: unknown;
  birds: AdminRecord[];
  disabled?: boolean;
  onChange: (value: unknown) => void;
}) {
  const options =
    field.key === "bird_id"
      ? [
          { value: "", label: field.required ? "Pilih burung" : "Berlaku untuk semua burung" },
          ...birds.map((bird) => ({ value: bird.id, label: String(bird.name) })),
        ]
      : (field.options ?? []);

  if (field.type === "checkbox") {
    return (
      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "textarea" || field.type === "lines") {
    return (
      <label className="admin-field admin-field--wide">
        <span>{field.label}</span>
        <textarea
          required={field.required}
          disabled={disabled}
          value={field.type === "lines" ? linesToText(value) : String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(event) =>
            onChange(field.type === "lines" ? textToLines(event.target.value) : event.target.value)
          }
          rows={field.type === "lines" ? 5 : 4}
        />
        {field.help && <small>{field.help}</small>}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="admin-field">
        <span>{field.label}</span>
        <select
          value={String(value ?? "")}
          required={field.required}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="admin-field">
      <span>{field.label}</span>
      <Input
        type={field.type === "number" ? "number" : "text"}
        step={field.key === "grams" ? "0.01" : field.type === "number" ? "1" : undefined}
        required={field.required}
        disabled={disabled}
        value={String(value ?? "")}
        placeholder={field.placeholder}
        onChange={(event) =>
          onChange(field.type === "number" ? Number(event.target.value) : event.target.value)
        }
      />
    </label>
  );
}

function AiAssistant({
  entity,
  action,
  instruction,
  busy,
  text,
  suggestion,
  onAction,
  onInstruction,
  onAsk,
  canApply,
  canCopy,
  applyNotice,
  onApply,
  onCopy,
}: {
  entity: AdminEntity;
  action: AiAction;
  instruction: string;
  busy: boolean;
  text: string;
  suggestion: Record<string, unknown> | null;
  onAction: (action: AiAction) => void;
  onInstruction: (value: string) => void;
  onAsk: () => void;
  canApply: boolean;
  canCopy: boolean;
  applyNotice: string;
  onApply: () => void;
  onCopy: () => void;
}) {
  return (
    <section className="admin-ai-box">
      <div className="admin-ai-heading">
        <div>
          <Bot className="h-5 w-5" />
          <span>
            <strong>AI Content Assistant</strong>
            <small>AI hanya membuat draft. Review manusia tetap wajib.</small>
          </span>
        </div>
        <span className="admin-ai-entity">{definitions[entity].title}</span>
      </div>
      <div className="admin-ai-controls">
        <select value={action} onChange={(event) => onAction(event.target.value as AiAction)}>
          <option value="draft">Buat draft</option>
          <option value="improve">Perbaiki isi</option>
          <option value="translate">Buat versi Inggris dari isi ini</option>
          <option value="review">Cek bagian isi yang perlu diperbaiki</option>
        </select>
        <Input
          value={instruction}
          onChange={(event) => onInstruction(event.target.value)}
          placeholder="Instruksi tambahan, opsional…"
        />
        <Button type="button" onClick={onAsk} disabled={busy} className="gap-2">
          {busy ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Jalankan AI
        </Button>
      </div>
      <p className="admin-ai-action-help">{aiActionHelp(action)}</p>
      {(text || suggestion) && (
        <div className="admin-ai-result">
          {text && <p>{text}</p>}
          {suggestion && <pre>{JSON.stringify(suggestion, null, 2)}</pre>}
          <div className="admin-ai-result-actions">
            {suggestion && canApply && (
              <Button type="button" variant="outline" onClick={onApply} className="gap-2">
                <Pencil className="h-4 w-4" /> Terapkan ke draft
              </Button>
            )}
            {canCopy && (
              <Button type="button" variant="outline" onClick={onCopy} className="gap-2">
                <Copy className="h-4 w-4" /> Salin versi Inggris
              </Button>
            )}
          </div>
          {action === "review" && (
            <p className="admin-ai-apply-notice">
              Hasil pemeriksaan hanya menjadi panduan. AI tidak mengubah form atau menyimpan data.
            </p>
          )}
          {action === "translate" && (
            <p className="admin-ai-apply-notice">
              Terjemahan tidak menimpa isi Indonesia karena database belum memiliki kolom bahasa
              Inggris.
            </p>
          )}
          {applyNotice && (
            <p className="admin-ai-apply-notice" role="status" aria-live="polite">
              {applyNotice}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function aiActionHelp(action: AiAction) {
  switch (action) {
    case "draft":
      return "Membuat isi awal untuk field yang masih kosong. Hasilnya bisa diterapkan ke form lalu disimpan manual.";
    case "improve":
      return "Merapikan tulisan yang sudah ada tanpa mengubah ID, relasi burung, status publikasi, atau sumber.";
    case "translate":
      return "Membuat salinan bahasa Inggris sebagai preview. Hasilnya tidak menimpa konten bahasa Indonesia.";
    case "review":
      return "Memeriksa kelengkapan dan risiko isi. Hasilnya berupa catatan, bukan perubahan otomatis pada form.";
  }
}

const AI_EDITABLE_FIELDS: Record<AdminEntity, ReadonlySet<string>> = {
  birds: new Set(["name", "emoji", "scientific_name", "description"]),
  bird_foods: new Set(["name", "category", "benefits", "note"]),
  toxic_entries: new Set(["name", "status", "explanation"]),
  portion_rules: new Set(["size", "condition", "grams", "teaspoon", "morning", "evening"]),
  recipes: new Set(["title", "purpose", "ingredients", "steps"]),
  bird_requests: new Set(["bird_name", "local_name", "scientific_name", "admin_notes", "status"]),
};

function sanitizeAiSuggestion(entity: AdminEntity, suggestion: Record<string, unknown>) {
  const allowed = AI_EDITABLE_FIELDS[entity];
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(suggestion)) {
    if (!allowed.has(key) || value === undefined) continue;

    if (key === "benefits" || key === "ingredients" || key === "steps") {
      result[key] = normalizeStringArray(value);
      continue;
    }

    if (key === "grams") {
      const grams = Number(value);
      if (Number.isFinite(grams) && grams > 0) result[key] = grams;
      continue;
    }

    if (key === "category" && (value === "main" || value === "extra")) {
      result[key] = value;
      continue;
    }

    if (key === "status" && entity === "toxic_entries") {
      if (value === "safe" || value === "caution" || value === "toxic") result[key] = value;
      continue;
    }

    if (key === "status" && entity === "bird_requests") {
      if (
        value === "pending" ||
        value === "reviewing" ||
        value === "rejected" ||
        value === "duplicate"
      ) {
        result[key] = value;
      }
      continue;
    }

    if (key === "size") {
      if (value === "Kecil" || value === "Standar" || value === "Besar") result[key] = value;
      continue;
    }

    if (key === "condition") {
      if (value === "Harian" || value === "Mabung" || value === "Ternak") result[key] = value;
      continue;
    }

    if (typeof value === "string") result[key] = value.trim();
  }

  return result;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function valuesEqual(left: unknown, right: unknown) {
  if (Object.is(left, right)) return true;
  if (left === null || right === null) return false;
  if (typeof left !== "object" || typeof right !== "object") return false;

  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

function ContentBadge({ value }: { value: string }) {
  return <span className={`admin-status admin-status--${value}`}>{value}</span>;
}

function AdminLoading({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={`admin-loading ${compact ? "admin-loading--compact" : ""}`}>
      <LoaderCircle className="h-5 w-5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

function AdminMessage({
  title,
  copy,
  onSignOut,
}: {
  title: string;
  copy: string;
  onSignOut: () => void;
}) {
  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <Database className="h-9 w-9 text-primary" />
        <h1>{title}</h1>
        <p>{copy}</p>
        <Button onClick={onSignOut}>Keluar</Button>
      </section>
    </main>
  );
}

function recordToDraft(record: AdminRecord): AdminRecord {
  const draft: AdminRecord = { ...record };

  // Tidak semua tabel CMS memiliki kolom source_urls. Jangan menambahkan
  // field virtual ini ke request pengguna karena akan ikut terkirim saat Simpan.
  if ("source_urls" in record) {
    draft.source_urls = Array.isArray(record.source_urls) ? record.source_urls : [];
  }

  if ("benefits" in record) {
    draft.benefits = Array.isArray(record.benefits) ? record.benefits : [];
  }
  if ("ingredients" in record) {
    draft.ingredients = Array.isArray(record.ingredients) ? record.ingredients : [];
  }
  if ("steps" in record) {
    draft.steps = Array.isArray(record.steps) ? record.steps : [];
  }

  return draft;
}

function prepareRecord(entity: AdminEntity, draft: AdminRecord, requireId = true): AdminRecord {
  const record = { ...draft };
  if (entity === "bird_requests") {
    if (requireId && !record.id) throw new Error("ID request tidak ditemukan.");
    if (record.local_name === "") record.local_name = null;
    if (record.scientific_name === "") record.scientific_name = null;
    if (record.contact === "") record.contact = null;
    if (record.admin_notes === "") record.admin_notes = null;
    return record;
  }

  const label = String(record.name ?? record.title ?? "");
  const birdPrefix = entity === "birds" ? "" : String(record.bird_id ?? "");
  if (!record.id && label) record.id = slugify([birdPrefix, label].filter(Boolean).join("-"));
  if (requireId && !record.id) throw new Error("ID/slug wajib diisi.");

  if (entity === "toxic_entries" && !record.bird_id) record.bird_id = null;
  if (record.image_url === "") record.image_url = null;
  if (record.note === "") record.note = null;
  record.sort_order = Number(record.sort_order ?? 0);
  if (entity === "portion_rules") record.grams = Number(record.grams ?? 0);
  record.source_urls = normalizeStringArray(record.source_urls);
  if (entity === "bird_foods") record.benefits = normalizeStringArray(record.benefits);
  if (entity === "recipes") {
    record.ingredients = normalizeStringArray(record.ingredients);
    record.steps = normalizeStringArray(record.steps);
  }
  return record;
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value))
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  if (typeof value !== "string") return [];
  return textToLines(value);
}

function linesToText(value: unknown) {
  if (Array.isArray(value)) return value.join("\n");
  return String(value ?? "");
}

function textToLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function messageFrom(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String(error.message);
  return "Terjadi kesalahan yang tidak diketahui.";
}
