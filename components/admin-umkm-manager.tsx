"use client";

import { ImagePlus, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AdminFloatingPanel } from "@/components/admin-floating-panel";
import { AdminToast } from "@/components/admin-toast";

type ManagedUmkm = {
  id: string; name: string; description: string | null; isPublished: boolean; productCount: number; profileImage: string;
  ownerName: string; businessType: string; nib: string; halalPermit: string; sppirt: string;
  ktp: string; address: string; instagram: string;
};
const blank = {
  name: "", description: "", ownerName: "", businessType: "", nib: "", halalPermit: "", sppirt: "", profileImage: "",
  ktp: "", address: "", instagram: "", isPublished: false,
};

export function AdminUmkmManager({ initialItems }: { initialItems: ManagedUmkm[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);
  useEffect(() => setItems(initialItems), [initialItems]);
  const set = (key: keyof typeof blank, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const edit = (item: ManagedUmkm) => {
    setEditingId(item.id); setOpen(true);
    setForm({ name: item.name, description: item.description || "", ownerName: item.ownerName, businessType: item.businessType, nib: item.nib, halalPermit: item.halalPermit, sppirt: item.sppirt, profileImage: item.profileImage || "", ktp: item.ktp, address: item.address, instagram: item.instagram, isPublished: item.isPublished });
  };
  const reset = () => { setEditingId(null); setOpen(false); setForm(blank); setMessage(""); };
  const chooseProfileImage = (file?: File) => {
    setMessage("");
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setMessage("Foto profil harus JPG, PNG, atau WEBP."); return; }
    if (file.size > 4 * 1024 * 1024) { setMessage("Ukuran foto maksimal 4 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => set("profileImage", typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => setMessage("Foto gagal dibaca. Silakan pilih ulang.");
    reader.readAsDataURL(file);
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setMessage("Menyimpan data...");
    try {
      const response = await fetch(editingId ? `/api/admin/umkm/${editingId}` : "/api/admin/umkm", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return setMessage(result.error || `Profil gagal disimpan (HTTP ${response.status}).`);
      setMessage("Data berhasil disimpan."); router.refresh();
    } catch { setMessage("Koneksi ke server gagal. Periksa koneksi lalu coba lagi."); }
  };
  const confirmDeactivate = async () => {
    const id = pendingDeactivateId; if (!id) return; setPendingDeactivateId(null);
    try {
      const response = await fetch(`/api/admin/umkm/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(result.error || `Profil belum dapat dinonaktifkan (HTTP ${response.status}).`); return; }
      setItems((current) => current.map((item) => item.id === id ? { ...item, isPublished: false } : item));
      setMessage("Profil UMKM berhasil dinonaktifkan.");
    } catch { setMessage("Koneksi ke server gagal. Periksa koneksi lalu coba lagi."); }
  };
  return <>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-display text-xl font-bold">Kelola profil UMKM</h2><p className="mt-1 text-xs text-muted">Alamat usaha tampil di storefront. KTP hanya terlihat admin.</p></div><button onClick={() => { reset(); setOpen(true); }} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white hover:bg-forest-700"><Plus size={14} className="mr-2" />Tambah UMKM</button></div>
      {open && <AdminFloatingPanel open={open} title={editingId ? "Edit profil UMKM" : "Tambah UMKM"} onClose={reset}><form onSubmit={submit} className="grid gap-3 rounded-2xl bg-[#f5f8f4] p-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="text-[10px] font-bold">Foto profil UMKM<div className="mt-1.5 flex flex-wrap items-center gap-3">{form.profileImage && <img src={form.profileImage} alt="Pratinjau foto profil UMKM" className="h-24 w-24 rounded-xl border border-slate-200 bg-white object-cover" />}<label className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-bold"><ImagePlus size={14} className="mr-2" />{form.profileImage ? "Ganti foto" : "Pilih foto"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => chooseProfileImage(event.target.files?.[0])} /></label>{form.profileImage && <button type="button" onClick={() => set("profileImage", "")} className="inline-flex min-h-10 items-center rounded-xl border border-red-200 bg-white px-3 text-[10px] font-bold text-red-700"><Trash2 size={13} className="mr-2" />Hapus foto</button>}</div></label><p className="mt-1 text-[10px] font-normal text-muted">JPG, PNG, atau WEBP, maksimal 4 MB.</p></div>
        <Field label="Nama usaha" value={form.name} onChange={(v) => set("name", v)} required />
        <Field label="Nama pemilik usaha" value={form.ownerName} onChange={(v) => set("ownerName", v)} /><Field label="Jenis produk/jasa" value={form.businessType} onChange={(v) => set("businessType", v)} />
        <Field label="NIB" value={form.nib} onChange={(v) => set("nib", v)} /><Field label="Sertifikat halal" value={form.halalPermit} onChange={(v) => set("halalPermit", v)} /><Field label="SPP-IRT" value={form.sppirt} onChange={(v) => set("sppirt", v)} />
        <Field label="KTP (admin saja)" value={form.ktp} onChange={(v) => set("ktp", v)} /><Field label="Alamat usaha (tampil di storefront)" value={form.address} onChange={(v) => set("address", v)} />
        <Field label="Instagram publik" value={form.instagram} onChange={(v) => set("instagram", v)} />
        <label className="text-[10px] font-bold sm:col-span-2">Narasi profil<textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:border-forest-700" /></label>
        <label className="flex items-center gap-2 text-[10px] font-bold sm:col-span-2"><input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />Tampilkan profil pada storefront</label>
        <div className="flex gap-2 sm:col-span-2"><button className="inline-flex min-h-10 items-center rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white"><Save size={14} className="mr-2" />Simpan</button><button type="button" onClick={reset} className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold"><X size={14} className="mr-2" />Batal</button></div>
      </form></AdminFloatingPanel>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.length === 0 ? <p className="rounded-xl bg-slate-50 p-6 text-center text-xs text-muted sm:col-span-2 lg:col-span-3">Belum ada data UMKM.</p> : items.map((item) => <article key={item.id} className="rounded-xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><div><strong className="block text-sm">{item.name}</strong></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${item.isPublished ? "bg-green-100 text-forest-800" : "bg-slate-100 text-slate-600"}`}>{item.isPublished ? "Tayang" : "Draft"}</span></div><p className="mt-4 line-clamp-2 text-xs leading-5 text-muted">{item.description || "—"}</p><p className="mt-3 text-[10px] text-muted">{item.productCount} produk/jasa · {item.ownerName || "—"}</p><div className="mt-4 flex gap-2"><button onClick={() => edit(item)} className="inline-flex items-center rounded-lg border border-slate-200 px-2 py-1.5 text-[9px] font-bold"><Pencil size={12} className="mr-1" />Edit</button><button onClick={() => setPendingDeactivateId(item.id)} className="rounded-lg border border-red-200 px-2 py-1.5 text-[9px] font-bold text-red-700">Nonaktifkan</button></div></article>)}</div>
    </section><AdminToast message={message} onClose={() => setMessage("")} /><ConfirmDialog open={Boolean(pendingDeactivateId)} title="Nonaktifkan profil UMKM?" description="Produk dan histori transaksi tidak dihapus, tetapi profil tidak lagi ditampilkan sebagai aktif." confirmLabel="Nonaktifkan" onCancel={() => setPendingDeactivateId(null)} onConfirm={() => void confirmDeactivate()} />
  </>;
}

function Field({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  return <label className="text-[10px] font-bold">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-forest-700" /></label>;
}
