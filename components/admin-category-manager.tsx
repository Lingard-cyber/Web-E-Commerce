"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Archive, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AdminFloatingPanel } from "@/components/admin-floating-panel";
import { AdminToast } from "@/components/admin-toast";

type CategoryEntry = { id: string; name: string; slug: string; description: string | null; productType: "ready_stock" | "fresh_preorder" | "service"; publishStatus: string; umkmName: string | null };
type Category = { id: string; name: string; slug: string; description: string | null; sortOrder: number; status: "coming_soon" | "published"; productCount: number; entries: CategoryEntry[] };
type CategoryForm = { name: string; slug: string; description: string; sortOrder: string; status: Category["status"] };

const emptyForm: CategoryForm = { name: "", slug: "", description: "", sortOrder: "0", status: "coming_soon" };

function sorted(items: Category[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function AdminCategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openEntryCategoryId, setOpenEntryCategoryId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [pendingEntry, setPendingEntry] = useState<{ categoryId: string; entry: CategoryEntry } | null>(null);
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<{ categoryId: string; entry: CategoryEntry } | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [entrySelection, setEntrySelection] = useState<Record<string, string>>({});
  const [movingEntryId, setMovingEntryId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<{ categoryId: string; entry: CategoryEntry } | null>(null);
  const [entryForm, setEntryForm] = useState({ name: "", slug: "", description: "", productType: "ready_stock" as CategoryEntry["productType"], publishStatus: "draft" });
  const [savingEntry, setSavingEntry] = useState(false);
  const [message, setMessage] = useState("");

  const setField = <K extends keyof CategoryForm>(field: K, value: CategoryForm[K]) => setForm((current) => ({ ...current, [field]: value }));

  const resetForm = (clearMessage = true) => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    if (clearMessage) setMessage("");
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setShowForm(true);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setShowForm(true);
    setForm({ name: category.name, slug: category.slug, description: category.description || "", sortOrder: String(category.sortOrder), status: category.status });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const editing = Boolean(editingId);
    try {
      const response = await fetch(editing ? `/api/admin/categories/${editingId}` : "/api/admin/categories", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || `Kategori gagal disimpan (HTTP ${response.status}).`);
        return;
      }
      if (editing) {
        setCategories((current) => sorted(current.map((item) => item.id === editingId ? { ...item, ...result.category, productCount: item.productCount } : item)));
        setMessage("Perubahan kategori berhasil disimpan.");
      } else {
        setCategories((current) => sorted([...current, { ...result.category, productCount: 0, entries: [] }]));
        setMessage("Kategori berhasil ditambahkan.");
      }
      resetForm(false);
      router.refresh();
    } catch {
      setMessage("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(category: Category, nextStatus: Category["status"]) {
    if (category.status === nextStatus) return;
    setUpdatingId(category.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || `Status kategori gagal diperbarui (HTTP ${response.status}).`);
        return;
      }
      setCategories((current) => current.map((item) => item.id === category.id ? { ...item, status: nextStatus } : item));
      setMessage(`Status ${category.name} diubah menjadi ${nextStatus === "published" ? "Dipublikasikan" : "Coming soon"}.`);
      router.refresh();
    } catch {
      setMessage("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeCategory(category: Category) {
    setPendingDelete(category);
  }

  async function confirmRemoveCategory() {
    const category = pendingDelete;
    if (!category) return;
    setPendingDelete(null);
    setDeletingId(category.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || `Kategori gagal dihapus (HTTP ${response.status}).`);
        return;
      }
      setCategories((current) => current.filter((item) => item.id !== category.id));
      if (editingId === category.id) resetForm(false);
      setMessage(`Kategori ${category.name} berhasil dihapus.`);
      router.refresh();
    } catch {
      setMessage("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  async function archiveEntry() {
    const pending = pendingEntry;
    if (!pending) return;
    setArchivingId(pending.entry.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${pending.entry.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || `Entri gagal diarsipkan (HTTP ${response.status}).`);
        return;
      }
      setCategories((current) => current.map((category) => category.id === pending.categoryId
        ? { ...category, entries: category.entries.map((entry) => entry.id === pending.entry.id ? { ...entry, publishStatus: "archived" } : entry) }
        : category));
      setPendingEntry(null);
      setMessage(`${pending.entry.name} diarsipkan dari katalog. Riwayat transaksi tetap disimpan.`);
      router.refresh();
    } catch {
      setMessage("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setArchivingId(null);
    }
  }

  async function deleteEntry() {
    const pending = pendingDeleteEntry;
    if (!pending) return;
    setDeletingEntryId(pending.entry.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${pending.entry.id}?permanent=true`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || `Entri gagal dihapus (HTTP ${response.status}).`);
        setPendingDeleteEntry(null);
        return;
      }
      setCategories((current) => current.map((category) => category.id === pending.categoryId
        ? { ...category, entries: category.entries.filter((entry) => entry.id !== pending.entry.id), productCount: Math.max(0, category.productCount - 1) }
        : category));
      if (editingEntry?.entry.id === pending.entry.id) setEditingEntry(null);
      setPendingDeleteEntry(null);
      setMessage(`${pending.entry.name} berhasil dihapus permanen.`);
      router.refresh();
    } catch {
      setMessage("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setDeletingEntryId(null);
    }
  }

  async function addEntryToCategory(categoryId: string) {
    const entryId = entrySelection[categoryId];
    const sourceCategory = categories.find((category) => category.entries.some((entry) => entry.id === entryId));
    const entry = sourceCategory?.entries.find((item) => item.id === entryId);
    if (!entry || !sourceCategory || sourceCategory.id === categoryId) return;
    setMovingEntryId(entry.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${entry.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || `Entri gagal dipindahkan (HTTP ${response.status}).`);
        return;
      }
      setCategories((current) => current.map((category) => {
        const entries = category.id === categoryId ? [...category.entries, entry].sort((a, b) => a.name.localeCompare(b.name)) : category.entries.filter((item) => item.id !== entry.id);
        return { ...category, entries, productCount: entries.length };
      }));
      setEntrySelection((current) => ({ ...current, [categoryId]: "" }));
      setMessage(`${entry.name} berhasil dipindahkan ke kategori ${categories.find((category) => category.id === categoryId)?.name || "tujuan"}.`);
      router.refresh();
    } catch {
      setMessage("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setMovingEntryId(null);
    }
  }

  function startEditEntry(categoryId: string, entry: CategoryEntry) {
    setEditingEntry({ categoryId, entry });
    setEntryForm({ name: entry.name, slug: entry.slug, description: entry.description || "", productType: entry.productType, publishStatus: entry.publishStatus });
    setMessage("");
  }

  function showCategoryEntries(category: Category) {
    setShowForm(false);
    setOpenEntryCategoryId(category.id);
    requestAnimationFrame(() => document.getElementById(`category-entries-${category.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  async function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingEntry) return;
    setSavingEntry(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${editingEntry.entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryForm),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || `Data entri gagal disimpan (HTTP ${response.status}).`);
        return;
      }
      setCategories((current) => current.map((category) => ({
        ...category,
        entries: category.entries.map((entry) => entry.id === editingEntry.entry.id ? { ...entry, ...entryForm } : entry),
      })));
      setEditingEntry(null);
      setMessage(`Data ${entryForm.name} berhasil diperbarui.`);
      router.refresh();
    } catch {
      setMessage("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setSavingEntry(false);
    }
  }

  return <div className="mt-6 space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Pengelolaan database</p>
          <h2 className="mt-1 font-display text-xl font-bold">Kategori katalog</h2>
          <p className="mt-1 text-xs text-muted">Data di bawah terhubung langsung dengan database dan dipakai untuk produk serta jasa.</p>
        </div>
        <button type="button" onClick={() => showForm ? resetForm() : openCreate()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-4 text-xs font-bold text-white transition hover:bg-forest-700">
          {showForm ? <X size={16} /> : <Plus size={16} />}{showForm ? "Tutup form" : "Tambah kategori"}
        </button>
      </div>
      {showForm && <AdminFloatingPanel open={showForm} title={editingId ? "Edit kategori" : "Tambah kategori"} onClose={() => resetForm()}><form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-bold">Nama kategori<input required maxLength={120} value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Contoh: Kerajinan bambu" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Slug (opsional)<input maxLength={120} value={form.slug} onChange={(event) => setField("slug", event.target.value)} placeholder="Otomatis dari nama" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Deskripsi<textarea maxLength={1000} rows={4} value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="Jelaskan isi kategori" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Urutan tampil<input required min={0} max={9999} type="number" value={form.sortOrder} onChange={(event) => setField("sortOrder", event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Status kategori<select value={form.status} onChange={(event) => setField("status", event.target.value as Category["status"])} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-forest-700"><option value="coming_soon">Coming soon</option><option value="published">Publikasikan sekarang</option></select><span className="mt-1.5 block text-[10px] font-normal leading-4 text-muted">Coming soon tetap terlihat sebagai kartu informasi, tetapi katalog belum bisa dibuka pelanggan.</span></label>
        <div className="flex flex-wrap gap-2"><button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-4 text-xs font-bold text-white hover:bg-forest-700 disabled:opacity-50"><Save size={15} />{saving ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Simpan kategori"}</button>{editingId && <><button type="button" onClick={() => { const category = categories.find((item) => item.id === editingId); if (category) showCategoryEntries(category); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-forest-800 bg-white px-4 text-xs font-bold text-forest-800"><Pencil size={14} />Edit data entri ({categories.find((item) => item.id === editingId)?.entries.length || 0})</button><button type="button" onClick={() => resetForm()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold"><X size={15} />Batal edit</button></>}</div>
      </form></AdminFloatingPanel>}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-xl font-bold">Daftar kategori</h2><p className="mt-1 text-xs text-muted">Atur status, edit data, atau hapus kategori yang belum dipakai.</p></div><span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-forest-800">{categories.length} kategori</span></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-slate-100 uppercase tracking-wide text-muted"><tr><th className="pb-3">Kategori</th><th className="pb-3">Status tampil</th><th className="pb-3">Urutan</th><th className="pb-3">Entri</th><th className="pb-3">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{categories.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-muted">Belum ada kategori.</td></tr> : categories.map((category) => <tr key={category.id}><td className="py-3 pr-3"><strong className="block">{category.name}</strong><span className="text-[10px] text-muted">{category.slug}</span>{category.description && <p className="mt-1 max-w-md text-[11px] text-muted">{category.description}</p>}</td><td className="py-3"><select value={category.status} disabled={updatingId === category.id} onChange={(event) => void updateStatus(category, event.target.value as Category["status"])} className={`rounded-lg border px-2.5 py-2 text-[10px] font-bold outline-none ${category.status === "published" ? "border-green-200 bg-green-50 text-forest-800" : "border-amber-200 bg-amber-50 text-amber-800"}`} aria-label={`Status tampil kategori ${category.name}`}><option value="coming_soon">Coming soon</option><option value="published">Dipublikasikan</option></select></td><td className="py-3">{category.sortOrder}</td><td className="py-3">{category.productCount}</td><td className="py-3"><div className="flex gap-2"><button type="button" onClick={() => startEdit(category)} className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-bold hover:border-forest-700 hover:text-forest-800"><Pencil size={12} className="mr-1" />Edit</button><button type="button" disabled={deletingId === category.id} onClick={() => void removeCategory(category)} className="inline-flex items-center rounded-lg border border-red-200 px-2.5 py-2 text-[10px] font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={12} className="mr-1" />{deletingId === category.id ? "Menghapus..." : "Hapus"}</button></div></td></tr>)}</tbody></table></div>
    </section>
    <ConfirmDialog open={Boolean(pendingDelete)} title="Hapus kategori?" description={pendingDelete ? `Kategori “${pendingDelete.name}” akan dihapus. Kategori yang sudah dipakai produk atau jasa tidak dapat dihapus.` : ""} confirmLabel="Hapus kategori" loading={Boolean(deletingId)} onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmRemoveCategory()} />
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold">Edit data entri produk/jasa</h2>
      <p className="mt-1 text-xs text-muted">Edit data entri, arsipkan agar tersembunyi dari katalog, atau hapus permanen jika belum memiliki riwayat transaksi.</p>
      <div className="mt-4 space-y-2">{categories.map((category) => <details id={`category-entries-${category.id}`} open={openEntryCategoryId === category.id} onToggle={(event) => setOpenEntryCategoryId(event.currentTarget.open ? category.id : null)} key={category.id} className="group rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-bold hover:bg-slate-50"><span>{category.name}</span><span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] text-forest-800">{category.entries.length} entri</span></summary>
        <div className="border-t border-slate-100 px-4 py-3"><div className="flex flex-wrap items-end gap-2"><label className="min-w-[240px] flex-1 text-[10px] font-bold">Tambahkan produk/jasa dari kategori lain<select value={entrySelection[category.id] || ""} onChange={(event) => setEntrySelection((current) => ({ ...current, [category.id]: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal"><option value="">Pilih produk atau jasa</option>{categories.filter((source) => source.id !== category.id).flatMap((source) => source.entries.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} ({entry.productType === "service" ? "Jasa" : "Produk"} · {source.name})</option>))}</select></label><button type="button" disabled={!entrySelection[category.id] || Boolean(movingEntryId)} onClick={() => void addEntryToCategory(category.id)} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-forest-800 px-3 text-[10px] font-bold text-white disabled:opacity-50"><Plus size={13} />{movingEntryId ? "Memindahkan..." : "Tambahkan"}</button></div></div>
        {category.entries.length === 0 ? <p className="px-4 py-3 text-xs text-muted">Belum ada produk atau jasa di kategori ini.</p> : <div className="divide-y divide-slate-100">{category.entries.map((entry) => <div key={entry.id} className="px-4 py-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold">{entry.name}</p><p className="mt-1 text-[10px] text-muted">{entry.productType === "service" ? "Jasa/Layanan" : "Produk"}{entry.umkmName ? ` · ${entry.umkmName}` : " · Belum dipetakan"} · {entry.slug}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${entry.publishStatus === "published" ? "bg-green-50 text-forest-800" : entry.publishStatus === "archived" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-800"}`}>{entry.publishStatus.replaceAll("_", " ")}</span><button type="button" onClick={() => startEditEntry(category.id, entry)} className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold"><Pencil size={12} className="mr-1" />Edit</button>{entry.publishStatus !== "archived" && <button type="button" disabled={archivingId === entry.id} onClick={() => setPendingEntry({ categoryId: category.id, entry })} className="inline-flex items-center rounded-lg border border-amber-200 px-2.5 py-1.5 text-[10px] font-bold text-amber-800 hover:bg-amber-50 disabled:opacity-50"><Archive size={12} className="mr-1" />Arsipkan</button>}<button type="button" disabled={deletingEntryId === entry.id} onClick={() => setPendingDeleteEntry({ categoryId: category.id, entry })} className="inline-flex items-center rounded-lg border border-red-200 px-2.5 py-1.5 text-[10px] font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={12} className="mr-1" />{deletingEntryId === entry.id ? "Menghapus..." : "Hapus"}</button></div></div>{editingEntry?.entry.id === entry.id && <AdminFloatingPanel open={Boolean(editingEntry)} title="Edit data entri" onClose={() => setEditingEntry(null)}><form onSubmit={saveEntry} className="grid gap-3 rounded-xl bg-[#f5f8f4] p-3 sm:grid-cols-2"><label className="text-[10px] font-bold">Nama<input required maxLength={160} value={entryForm.name} onChange={(event) => setEntryForm((current) => ({ ...current, name: event.target.value }))} className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal" /></label><label className="text-[10px] font-bold">Slug<input maxLength={160} value={entryForm.slug} onChange={(event) => setEntryForm((current) => ({ ...current, slug: event.target.value }))} className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal" /></label><label className="text-[10px] font-bold sm:col-span-2">Deskripsi<textarea maxLength={5000} rows={3} value={entryForm.description} onChange={(event) => setEntryForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal" /></label><label className="text-[10px] font-bold">Jenis<select value={entryForm.productType} onChange={(event) => setEntryForm((current) => ({ ...current, productType: event.target.value as CategoryEntry["productType"] }))} className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal"><option value="ready_stock">Produk</option><option value="fresh_preorder">Preorder</option><option value="service">Jasa/Layanan</option></select></label><label className="text-[10px] font-bold">Status entri<select value={entryForm.publishStatus} onChange={(event) => setEntryForm((current) => ({ ...current, publishStatus: event.target.value }))} className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal"><option value="draft">Draft</option><option value="pending_verification">Menunggu verifikasi</option><option value="published">Tayang</option><option value="archived">Arsip</option></select></label><div className="flex gap-2 sm:col-span-2"><button disabled={savingEntry} className="inline-flex min-h-9 items-center rounded-lg bg-forest-800 px-3 text-[10px] font-bold text-white disabled:opacity-50"><Save size={12} className="mr-1.5" />{savingEntry ? "Menyimpan..." : "Simpan perubahan"}</button><button type="button" onClick={() => setEditingEntry(null)} className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold">Batal</button></div></form></AdminFloatingPanel>}</div>)}</div>}
      </details>)}</div>
    </section>
    <ConfirmDialog open={Boolean(pendingEntry)} title="Arsipkan entri?" description={pendingEntry ? `${pendingEntry.entry.name} akan dihapus dari katalog aktif. Riwayat transaksi tetap disimpan.` : ""} confirmLabel="Arsipkan entri" loading={Boolean(archivingId)} onCancel={() => setPendingEntry(null)} onConfirm={() => void archiveEntry()} />
    <ConfirmDialog open={Boolean(pendingDeleteEntry)} title="Hapus entri permanen?" description={pendingDeleteEntry ? `${pendingDeleteEntry.entry.name} akan dihapus permanen. Data keranjang dan stok terkait ikut dibersihkan. Entri dengan riwayat pesanan atau permintaan jasa hanya dapat diarsipkan.` : ""} confirmLabel="Hapus permanen" loading={Boolean(deletingEntryId)} onCancel={() => setPendingDeleteEntry(null)} onConfirm={() => void deleteEntry()} />
    <AdminToast message={message} onClose={() => setMessage("")} />
  </div>;
}
