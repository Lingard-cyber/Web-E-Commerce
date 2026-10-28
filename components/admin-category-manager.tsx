"use client";

import { useRouter } from "next/navigation";
import { Plus, Save } from "lucide-react";
import { FormEvent, useState } from "react";

type Category = { id: string; name: string; slug: string; description: string | null; sortOrder: number; status: "coming_soon" | "published"; productCount: number };

export function AdminCategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState<Category["status"]>("coming_soon");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, sortOrder: Number(sortOrder), status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || "Kategori belum dapat disimpan.");
        return;
      }
      setCategories((current) => [...current, { ...result.category, productCount: 0 }].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)));
      setName("");
      setSlug("");
      setDescription("");
      setSortOrder("0");
      setStatus("coming_soon");
      setMessage("Kategori berhasil ditambahkan.");
      router.refresh();
    } catch {
      setMessage("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Plus size={18} />Tambah kategori</h2>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-xs font-bold">Nama kategori<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Kerajinan bambu" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Slug (opsional)<input maxLength={120} value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Otomatis dari nama" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Deskripsi<textarea maxLength={1000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Jelaskan isi kategori" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Urutan tampil<input required min={0} max={9999} type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>
        <label className="block text-xs font-bold">Status kategori<select value={status} onChange={(event) => setStatus(event.target.value as Category["status"])} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-forest-700"><option value="coming_soon">Coming soon</option><option value="published">Publikasikan sekarang</option></select><span className="mt-1.5 block text-[10px] font-normal leading-4 text-muted">Coming soon hanya tampil sebagai informasi dan belum membuka katalog.</span></label>
        <button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-4 text-xs font-bold text-white hover:bg-forest-700 disabled:opacity-50"><Save size={15} />{saving ? "Menyimpan..." : "Simpan kategori"}</button>
        {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{message}</p>}
      </form>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-bold">Daftar kategori</h2>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="border-b border-slate-100 uppercase tracking-wide text-muted"><tr><th className="pb-3">Kategori</th><th className="pb-3">Status tampil</th><th className="pb-3">Urutan</th><th className="pb-3">Entri</th></tr></thead><tbody className="divide-y divide-slate-100">{categories.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-muted">Belum ada kategori.</td></tr> : categories.map((category) => <tr key={category.id}><td className="py-3 pr-3"><strong className="block">{category.name}</strong><span className="text-[10px] text-muted">{category.slug}</span>{category.description && <p className="mt-1 max-w-md text-[11px] text-muted">{category.description}</p>}</td><td className="py-3"><select value={category.status} disabled={updatingId === category.id} onChange={(event) => void updateStatus(category, event.target.value as Category["status"])} className={`rounded-lg border px-2.5 py-2 text-[10px] font-bold outline-none ${category.status === "published" ? "border-green-200 bg-green-50 text-forest-800" : "border-amber-200 bg-amber-50 text-amber-800"}`} aria-label={`Status tampil kategori ${category.name}`}><option value="coming_soon">Coming soon</option><option value="published">Dipublikasikan</option></select></td><td className="py-3">{category.sortOrder}</td><td className="py-3">{category.productCount}</td></tr>)}</tbody></table></div>
    </section>
  </div>;
}
