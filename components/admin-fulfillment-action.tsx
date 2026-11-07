"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ShipmentStatus = "pending" | "packed" | "shipped" | "delivered" | "returned";

export function AdminFulfillmentAction({ orderId, paymentStatus, shipmentStatus, courier: initialCourier, trackingNumber: initialTracking }: { orderId: string; paymentStatus: string; shipmentStatus: ShipmentStatus; courier: string; trackingNumber: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(shipmentStatus === "pending" ? "packed" : shipmentStatus === "packed" ? "shipped" : shipmentStatus === "shipped" ? "delivered" : shipmentStatus);
  const [courier, setCourier] = useState(initialCourier);
  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shipmentStatus: status, courier, trackingNumber }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Perubahan gagal disimpan.");
      setMessage("Tersimpan"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Perubahan gagal disimpan."); }
    finally { setSaving(false); }
  };
  if (paymentStatus !== "paid") return <span className="text-[10px] text-muted">Menunggu pembayaran valid</span>;
  if (shipmentStatus === "delivered" || shipmentStatus === "returned") return <span className="text-[10px] font-semibold text-forest-800">Selesai</span>;
  return <div className="min-w-[220px] space-y-1.5">
    <select aria-label="Status pengiriman berikutnya" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px]">
      {shipmentStatus === "pending" && <option value="packed">Siapkan pesanan</option>}
      {shipmentStatus === "packed" && <option value="shipped">Kirim pesanan</option>}
      {shipmentStatus === "shipped" && <option value="delivered">Tandai diterima</option>}
    </select>
    {(status === "shipped" || shipmentStatus === "shipped") && <><input aria-label="Kurir" value={courier} onChange={(event) => setCourier(event.target.value)} placeholder="Kurir" className="h-8 w-full rounded-lg border border-slate-200 px-2 text-[10px]" /><input aria-label="Nomor resi" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Nomor resi" className="h-8 w-full rounded-lg border border-slate-200 px-2 text-[10px]" /></>}
    <button type="button" disabled={saving} onClick={() => void save()} className="rounded-lg bg-forest-800 px-2.5 py-1.5 text-[9px] font-bold text-white disabled:opacity-50">{saving ? "Menyimpan…" : "Simpan"}</button>
    {message && <p role="status" className="max-w-[220px] text-[9px] text-muted">{message}</p>}
  </div>;
}
