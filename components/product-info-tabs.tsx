"use client";

import { useState } from "react";
import { ClipboardList, FileText } from "lucide-react";

type ProductInfoTabsProps = {
  isService: boolean;
  intro: string;
  description: string;
  handling: string;
  purchaseSummary: string[];
  producerProfile?: {
    ownerName: string;
    businessType: string;
    nib: string;
    halalPermit: string;
    sppirt: string;
    narrative: string;
  };
};

export function ProductInfoTabs({ isService, intro, description, handling, purchaseSummary, producerProfile }: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "purchase">("description");

  return <section id="informasi-produk" className="mt-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
    <div role="tablist" aria-label="Informasi produk" className="flex overflow-x-auto border-b border-slate-200 px-4 sm:px-6">
      <button type="button" role="tab" aria-selected={activeTab === "description"} onClick={() => setActiveTab("description")} className={`inline-flex min-h-14 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-bold transition ${activeTab === "description" ? "border-forest-800 text-forest-800" : "border-transparent text-slate-500 hover:text-forest-800"}`}>
        <FileText size={15} />{isService ? "Deskripsi Layanan" : "Deskripsi Barang"}
      </button>
      <button type="button" role="tab" aria-selected={activeTab === "purchase"} onClick={() => setActiveTab("purchase")} className={`inline-flex min-h-14 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-bold transition ${activeTab === "purchase" ? "border-forest-800 text-forest-800" : "border-transparent text-slate-500 hover:text-forest-800"}`}>
        <ClipboardList size={15} />Ringkasan Pembelian
      </button>
    </div>
    <div role="tabpanel" className="min-h-28 p-6 sm:p-7">
      {activeTab === "description" ? <div className="space-y-4 text-sm leading-7 text-slate-600">
        <p>{intro}</p>
        <p>{description || (isService ? "Belum ada deskripsi untuk layanan ini." : "Belum ada deskripsi untuk barang ini.")}</p>
        {producerProfile && <section className="rounded-xl border border-forest-700/10 bg-white p-4"><h3 className="text-xs font-bold text-forest-900">Informasi usaha</h3><dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">{[["Pemilik usaha", producerProfile.ownerName], ["Jenis produk/jasa", producerProfile.businessType], ["NIB", producerProfile.nib], ["Halal", producerProfile.halalPermit], ["SPP-IRT", producerProfile.sppirt], ["Narasi profil", producerProfile.narrative]].map(([label, value]) => <div key={label}><dt className="font-bold text-forest-800">{label}</dt><dd className="mt-1 whitespace-pre-line leading-5 text-slate-600">{value || "—"}</dd></div>)}</dl></section>}
        <div className="rounded-xl bg-[#f5f8f4] p-4 text-forest-950"><p className="mb-1 text-xs font-bold text-forest-800">Catatan pemenuhan</p>{handling}</div>
      </div> : <div className="space-y-4 text-sm leading-6 text-slate-600">
        {purchaseSummary.map((item, index) => <p key={index} className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-forest-700" />{item}</p>)}
      </div>}
    </div>
  </section>;
}
