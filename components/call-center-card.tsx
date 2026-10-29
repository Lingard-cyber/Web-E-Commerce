"use client";

import { ChevronDown, ExternalLink, Headphones, PhoneCall } from "lucide-react";
import { useState } from "react";
import { orderingContacts, orderingWhatsappUrl } from "@/lib/ordering-contacts";

export function CallCenterCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-lg backdrop-blur-sm">
      <div className="relative h-28 overflow-hidden sm:h-32"><img src="/call-center.jpg" alt="Petugas call center Forkom UMKM Kepuharjo" className="h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-forest-950/35 to-transparent" /><div className="absolute bottom-3 left-4 flex items-center gap-2 text-[10px] font-bold text-white sm:left-5"><span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-forest-950"><PhoneCall size={14} /></span>Siap membantu pertanyaan Anda</div></div>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/10 sm:px-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-forest-950"><Headphones size={19} /></span>
        <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-[.14em] text-accent">Hubungi Forkom</span><span className="mt-1 block text-xs text-white/70">{open ? "Hubungi kami melalui WhatsApp" : "Klik untuk menampilkan nomor"}</span></span>
        <ChevronDown size={18} className={`shrink-0 text-white/70 transition-transform duration-300 ${open ? "rotate-180 text-accent" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="mx-4 mb-4 space-y-2 sm:mx-5">{orderingContacts.map((contact) => <a key={contact.number} href={orderingWhatsappUrl(contact.number, "Halo, saya ingin bertanya tentang produk atau jasa Forkom UMKM Kepuharjo.")} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-accent/40 bg-forest-950/70 px-4 py-3 hover:border-accent"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-green-500/20 text-accent"><PhoneCall size={15} /></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-white/60">{contact.label}</span><span className="block text-sm font-bold text-white">{contact.display}</span></span><ExternalLink size={14} className="shrink-0 text-accent" /></a>)}</div>
        </div>
      </div>
    </div>
  );
}
