"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Archive, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

type CategoryEntry = { id: string; name: string; productType: "product" | "service"; publishStatus: string; umkmName: string | null };
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [pendingEntry, setPendingEntry] = useState<{ categoryId: string; entry: CategoryEntry } | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
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
        setMessage(result.error || "Kategori belum dapat disimpan.");
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
        setMessage(result.error || "Status kategori belum dapat diperbarui.");
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
        setMessage(result.error || "Kategori belum dapat dihapus.");
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
        setMessage(result.error || "Entri belum dapat diarsipkan.");
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
      <div className={`overflow-hidden transition-all duration-300 ease-out ${showForm ? "mt-5 max-h-[1100px] opacity-100" : "max-h-0 opacity-0"}`}>
      <form onSubmit={submit} className="space-y-4 border-t border-slate-100 pt-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">{editingId ? <Pencil size={18} /> : <Plus size={18} />}{editingId ? "Edit kategori" : "Tambah kategori"}</h3>
        <label className="block text-xs font-bold">Nama kategori<input required maxLength={120} value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Contoh: Kerajinan bambu" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Slug (opsional)<input maxLength={120} value={form.slug} onChange={(event) => setField("slug", event.target.value)} placeholder="Otomatis dari nama" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Deskripsi<textarea maxLength={1000} rows={4} value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="Jelaskan isi kategori" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Urutan tampil<input required min={0} max={9999} type="number" value={form.sortOrder} onChange={(event) => setField("sortOrder", event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Status kategori<select value={form.status} onChange={(event) => setField("status", event.target.value as Category["status"])} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-forest-700"><option value="coming_soon">Coming soon</option><option value="published">Publikasikan sekarang</option></select><span className="mt-1.5 block text-[10px] font-normal leading-4 text-muted">Coming soon tetap terlihat sebagai kartu informasi, tetapi katalog belum bisa dibuka pelanggan.</span></label>
        <div className="flex flex-wrap gap-2"><button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-4 text-xs font-bold text-white hover:bg-forest-700 disabled:opacity-50"><Save size={15} />{saving ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Simpan kategori"}</button>{editingId && <button type="button" onClick={() => resetForm()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold"><X size={15} />Batal edit</button>}</div>
      </form>
      </div>
      {message && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{message}</p>}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-xl font-bold">Daftar kategori</h2><p className="mt-1 text-xs text-muted">Atur status, edit data, atau hapus kategori yang belum dipakai.</p></div><span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-forest-800">{categories.length} kategori</span></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-slate-100 uppercase tracking-wide text-muted"><tr><th className="pb-3">Kategori</th><th className="pb-3">Status tampil</th><th className="pb-3">Urutan</th><th className="pb-3">Entri</th><th className="pb-3">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{categories.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-muted">Belum ada kategori.</td></tr> : categories.map((category) => <tr key={category.id}><td className="py-3 pr-3"><strong className="block">{category.name}</strong><span className="text-[10px] text-muted">{category.slug}</span>{category.description && <p className="mt-1 max-w-md text-[11px] text-muted">{category.description}</p>}</td><td className="py-3"><select value={category.status} disabled={updatingId === category.id} onChange={(event) => void updateStatus(category, event.target.value as Category["status"])} className={`rounded-lg border px-2.5 py-2 text-[10px] font-bold outline-none ${category.status === "published" ? "border-green-200 bg-green-50 text-forest-800" : "border-amber-200 bg-amber-50 text-amber-800"}`} aria-label={`Status tampil kategori ${category.name}`}><option value="coming_soon">Coming soon</option><option value="published">Dipublikasikan</option></select></td><td className="py-3">{category.sortOrder}</td><td className="py-3">{category.productCount}</td><td className="py-3"><div className="flex gap-2"><button type="button" onClick={() => startEdit(category)} className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-bold hover:border-forest-700 hover:text-forest-800"><Pencil size={12} className="mr-1" />Edit</button><button type="button" disabled={deletingId === category.id} onClick={() => void removeCategory(category)} className="inline-flex items-center rounded-lg border border-red-200 px-2.5 py-2 text-[10px] font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={12} className="mr-1" />{deletingId === category.id ? "Menghapus..." : "Hapus"}</button></div></td></tr>)}</tbody></table></div>
    </section>
    <ConfirmDialog open={Boolean(pendingDelete)} title="Hapus kategori?" description={pendingDelete ? `Kategori “${pendingDelete.name}” akan dihapus. Kategori yang sudah dipakai produk atau jasa tidak dapat dihapus.` : ""} confirmLabel="Hapus kategori" loading={Boolean(deletingId)} onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmRemoveCategory()} />
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold">Entri dalam kategori</h2>
      <p className="mt-1 text-xs text-muted">Lihat produk atau jasa pada setiap kategori. Entri dapat diarsipkan agar tidak tampil di katalog.</p>
      <div className="mt-4 space-y-2">{categories.map((category) => <details key={category.id} className="group rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-bold hover:bg-slate-50"><span>{category.name}</span><span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] text-forest-800">{category.entries.length} entri</span></summary>
        {category.entries.length === 0 ? <p className="border-t border-slate-100 px-4 py-3 text-xs text-muted">Belum ada produk atau jasa di kategori ini.</p> : <div className="divide-y divide-slate-100 border-t border-slate-100">{category.entries.map((entry) => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><p className="text-xs font-semibold">{entry.name}</p><p className="mt-1 text-[10px] text-muted">{entry.productType === "service" ? "Jasa/Layanan" : "Produk"}{entry.umkmName ? ` · ${entry.umkmName}` : " · Belum dipetakan"}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${entry.publishStatus === "published" ? "bg-green-50 text-forest-800" : entry.publishStatus === "archived" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-800"}`}>{entry.publishStatus.replaceAll("_", " ")}</span>{entry.publishStatus !== "archived" && <button type="button" disabled={archivingId === entry.id} onClick={() => setPendingEntry({ categoryId: category.id, entry })} className="inline-flex items-center rounded-lg border border-red-200 px-2.5 py-1.5 text-[10px] font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Archive size={12} className="mr-1" />Arsipkan</button>}</div></div>)}</div>}
      </details>)}</div>
    </section>
    <ConfirmDialog open={Boolean(pendingEntry)} title="Arsipkan entri?" description={pendingEntry ? `${pendingEntry.entry.name} akan dihapus dari katalog aktif. Riwayat transaksi tetap disimpan.` : ""} confirmLabel="Arsipkan entri" loading={Boolean(archivingId)} onCancel={() => setPendingEntry(null)} onConfirm={() => void archiveEntry()} />
  </div>;
}
