"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["Pembayaran jasa", "Penjualan langsung", "Penjualan lainnya"];

export function AdminFinancialEntryForm({ today, umkm }: { today: string; umkm: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/admin/financial-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "income", category: data.get("category"), description: data.get("description"), amountIdr: Number(data.get("amountIdr")),
          date: data.get("date"), paymentMethod: data.get("paymentMethod"), evidenceUrl: data.get("evidenceUrl"), umkmId: data.get("umkmId"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Penjualan gagal disimpan.");
      form.reset();
      const dateInput = form.elements.namedItem("date") as HTMLInputElement | null;
      if (dateInput) dateInput.value = today;
      setMessage("Penjualan tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Penjualan gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <label className="text-xs font-semibold text-slate-700">Kategori penjualan
      <select name="category" required className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3">
        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
    </label>
    <label className="text-xs font-semibold text-slate-700">UMKM terkait
      <select name="umkmId" defaultValue="" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3">
        <option value="">Penjualan umum Forkom</option>{umkm.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <label className="text-xs font-semibold text-slate-700">Metode pembayaran
      <select name="paymentMethod" required defaultValue="cash" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3">
        <option value="cash">Tunai</option><option value="bank_transfer">Transfer bank</option><option value="qris">QRIS</option><option value="marketplace">Marketplace</option><option value="other">Lainnya/tidak diketahui</option>
      </select>
    </label>
    <label className="text-xs font-semibold text-slate-700">Nominal (Rp)
      <input name="amountIdr" required type="number" min="1" step="1" placeholder="100000" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3" />
    </label>
    <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Keterangan
      <input name="description" required maxLength={240} placeholder="Contoh: pembayaran jasa desain logo" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3" />
    </label>
    <label className="text-xs font-semibold text-slate-700">Tanggal penjualan
      <input name="date" required type="date" defaultValue={today} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3" />
    </label>
    <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Tautan bukti pembayaran (opsional)
      <input name="evidenceUrl" type="url" maxLength={1000} placeholder="https://..." className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3" />
    </label>
    <div className="flex items-end gap-3">
      <button disabled={saving} className="h-11 rounded-xl bg-forest-800 px-5 text-xs font-bold text-white disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan penjualan"}</button>
    </div>
    {message && <p role="status" className="text-xs text-slate-600 sm:col-span-2 lg:col-span-4">{message}</p>}
  </form>;
}
