import { Hand, MessageCircle, Smartphone } from "lucide-react";

const demoPhone = "6281234567890";
const displayPhone = "+62 812-3456-7890";
const message = encodeURIComponent("Halo Kepuharjo Market, saya ingin bertanya tentang produk.");

export function WhatsAppFloat() {
  return <a href={`https://wa.me/${demoPhone}?text=${message}`} target="_blank" rel="noreferrer" className="group fixed bottom-5 left-5 z-30 hidden items-end gap-2 sm:flex" aria-label={`Hubungi WhatsApp ${displayPhone}`}><span className="pointer-events-none mb-2 max-w-48 rounded-2xl rounded-bl-sm border border-green-100 bg-white px-4 py-3 text-[10px] leading-4 text-forest-950 opacity-0 shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:opacity-100"><strong className="block text-[11px]">Butuh bantuan?</strong><span className="text-muted">Chat dummy: {displayPhone}</span></span><span className="relative grid h-16 w-16 place-items-center rounded-[22px] bg-[#25D366] shadow-[0_12px_28px_rgba(37,211,102,.3)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-105"><span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-[#25D366] shadow-md"><MessageCircle size={14} fill="currentColor" /></span><span className="animate-phone-float relative text-white"><Hand size={38} strokeWidth={1.4} className="animate-hand-wave absolute -bottom-3 -left-6" /><Smartphone size={30} strokeWidth={1.8} className="relative rotate-[12deg]" /></span></span></a>;
}
