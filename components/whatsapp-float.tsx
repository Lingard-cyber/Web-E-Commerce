import { MessageCircle } from "lucide-react";

const demoPhone = "6285600604388";
const displayPhone = "+62 856-0060-4388";
const message = encodeURIComponent("Halo Kepuharjo Market, saya ingin bertanya tentang produk.");

export function WhatsAppFloat() {
  return <a href={`https://wa.me/${demoPhone}?text=${message}`} target="_blank" rel="noreferrer" className="group fixed bottom-5 right-4 z-40 flex items-center gap-3 rounded-2xl border border-green-100 bg-white/95 p-2 pr-3 shadow-[0_12px_30px_rgba(24,66,45,.16)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:right-6" aria-label={`Hubungi WhatsApp ${displayPhone}`}><span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#25D366] bg-green-50"><img src="/hub.jpg" alt="Customer service Kepuharjo Market" className="h-full w-full object-cover" /><span className="absolute bottom-0 right-0 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-[#25D366] text-white"><MessageCircle size={9} fill="currentColor" /></span></span><span className="min-w-0 leading-tight"><strong className="block text-[11px] font-extrabold text-forest-950">Hubungi WhatsApp</strong><span className="mt-1 block text-[10px] text-muted">{displayPhone}</span></span></a>;
}
