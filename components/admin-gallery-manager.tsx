"use client";

import { Eye, EyeOff, Images, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { GalleryImageRecord } from "@/lib/gallery-db";

type GalleryForm = { src: string; title: string; alt: string; sortOrder: string; isPublished: boolean; file: File | null };
const blankForm: GalleryForm = { src: "", title: "", alt: "", sortOrder: "0", isPublished: true, file: null };

export function AdminGalleryManager({ initialItems }: { initialItems: GalleryImageRecord[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<GalleryImageRecord | null>(null);
  const set = (key: keyof GalleryForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const edit = (item: GalleryImageRecord) => { setEditingId(item.id); setOpen(true); setMessage(""); setForm({ src: item.src, title: item.title, alt: item.alt, sortOrder: String(item.sortOrder), isPublished: item.isPublished, file: null }); };
  const reset = () => { setEditingId(null); setOpen(false); setForm(blankForm); setMessage(""); };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setMessage(""); try { const file = form.file; const payload = file ? new FormData() : JSON.stringify({ src: form.src, title: form.title, alt: form.alt, sortOrder: Number(form.sortOrder) || 0, isPublished: form.isPublished }); if (file && payload instanceof FormData) { payload.append("file", file); payload.append("src", form.src); payload.append("title", form.title); payload.append("alt", form.alt); payload.append("sortOrder", String(Number(form.sortOrder) || 0)); payload.append("isPublished", String(form.isPublished)); } const response = await fetch(editingId ? `/api/admin/gallery/${editingId}` : "/api/admin/gallery", { method: editingId ? "PATCH" : "POST", headers: file ? undefined : { "Content-Type": "application/json" }, body: payload }); const result = await response.json().catch(() => ({})); if (!response.ok) return setMessage(result.error || "Foto belum tersimpan."); window.location.reload(); } catch { setMessage("Koneksi ke server gagal. Periksa koneksi lalu coba lagi."); } };
  const remove = async (item: GalleryImageRecord) => {
    setPendingDelete(item);
  };
  const confirmRemove = async () => {
    const item = pendingDelete;
    if (!item) return;
    setPendingDelete(null);
    const response = await fetch(`/api/admin/gallery/${item.id}`, { method: "DELETE" });
    if (!response.ok) { const result = await response.json().catch(() => ({})); setMessage(result.error || "Foto belum dapat dihapus."); return; }
    setItems((current) => current.filter((value) => value.id !== item.id));
  };

  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-display text-xl font-bold">Kelola foto galeri</h2><p className="mt-1 text-sm text-muted">Atur foto, judul, teks alternatif, urutan tampil, dan status publikasi galeri storefront.</p></div><button type="button" onClick={() => { reset(); setOpen(true); }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest-800 px-4 text-xs font-bold text-white hover:bg-forest-700"><Plus size={16} className="mr-2" />Tambah foto</button></div>
    {open && <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl bg-[#f5f8f4] p-4 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">Upload foto<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal" /><span className="mt-1 block text-xs font-normal text-muted">JPG, PNG, WEBP, atau GIF. Maksimal 6 MB. File akan disimpan sebagai data foto di database.{editingId && " Pilih file baru hanya jika ingin mengganti foto."}</span></label><Field label="Judul foto" value={form.title} onChange={(value) => set("title", value)} placeholder="Contoh: Kegiatan UMKM" required /><Field label="Teks alternatif" value={form.alt} onChange={(value) => set("alt", value)} placeholder="Deskripsi singkat isi foto" required /><Field label="Urutan tampil" value={form.sortOrder} onChange={(value) => set("sortOrder", value)} type="number" placeholder="1" /><label className="flex items-center gap-2 text-sm font-bold sm:col-span-2"><input type="checkbox" checked={form.isPublished} onChange={(event) => set("isPublished", event.target.checked)} />Tampilkan di storefront</label><div className="flex flex-wrap gap-2 sm:col-span-2"><button className="inline-flex min-h-10 items-center rounded-xl bg-forest-800 px-4 text-xs font-bold text-white"><Save size={15} className="mr-2" />Simpan foto</button><button type="button" onClick={reset} className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold"><X size={15} className="mr-2" />Batal</button></div>{message && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 sm:col-span-2">{message}</p>}</form>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.length === 0 ? <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-muted sm:col-span-2 lg:col-span-3">Belum ada foto galeri.</p> : items.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white"><div className="relative aspect-[4/3] overflow-hidden bg-[#e8f1eb]"><img src={item.src} alt={item.alt} className="h-full w-full object-cover" /> <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.isPublished ? "bg-green-100 text-forest-800" : "bg-slate-100 text-slate-600"}`}>{item.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}{item.isPublished ? "Tayang" : "Disembunyikan"}</span></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-bold text-ink">{item.title}</h3><p className="mt-1 text-xs text-muted">Urutan {item.sortOrder}</p></div><Images size={18} className="shrink-0 text-forest-700" /></div><p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{item.alt}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => edit(item)} className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-bold"><Pencil size={13} className="mr-1.5" />Edit</button><button type="button" onClick={() => remove(item)} className="inline-flex min-h-9 items-center rounded-lg border border-red-200 px-3 text-xs font-bold text-red-700"><Trash2 size={13} className="mr-1.5" />Hapus</button></div></div></article>)}</div>
    <ConfirmDialog open={Boolean(pendingDelete)} title="Hapus foto galeri?" description={pendingDelete ? `Foto “${pendingDelete.title}” akan dihapus dari galeri.` : ""} confirmLabel="Hapus foto" onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmRemove()} />
  </section>;
}

function Field({ label, value, onChange, placeholder, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="text-sm font-bold text-ink">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-forest-700" /></label>;
}
