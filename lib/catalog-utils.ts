export const catalogImagePlaceholder = "/placeholder-product.svg";

export function formatRupiah(value: number | null) {
  if (value === null) return "Harga menyesuaikan";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value).replace("IDR", "Rp");
}
