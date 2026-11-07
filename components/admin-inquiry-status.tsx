"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const labels: Record<string, string> = { new: "Baru", contacted: "Sudah dihubungi", quoted: "Penawaran dikirim", completed: "Selesai", cancelled: "Dibatalkan" };

export function AdminInquiryStatus({ inquiryId, initialStatus }: { inquiryId: string; initialStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async (nextStatus: string) => {
    setStatus(nextStatus); setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Status gagal diperbarui.");
      setMessage("Tersimpan"); router.refresh();
    } catch (error) { setStatus(initialStatus); setMessage(error instanceof Error ? error.message : "Status gagal diperbarui."); }
    finally { setSaving(false); }
  };
  return <div className="min-w-[150px]"><select aria-label="Perbarui status permintaan jasa" disabled={saving} value={status} onChange={(event) => void save(event.target.value)} className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px]">{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{message && <p role="status" className="mt-1 text-[9px] text-muted">{message}</p>}</div>;
}
