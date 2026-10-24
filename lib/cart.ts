export type CartItem = { productSlug: string; productName: string; variantId: string; variantLabel: string; unitPrice: number; quantity: number };

export const CART_KEY = "kepuharjo-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { const value = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("kepuharjo-cart-updated"));
}

export async function persistCartToDatabase(items: CartItem[]) {
  try {
    const response = await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })) }), cache: "no-store" });
    if (!response.ok) return items;
    const result = await response.json().catch(() => null) as { items?: CartItem[] } | null;
    return Array.isArray(result?.items) ? result.items : items;
  } catch {
    return items;
  }
}

export async function hydrateCartFromDatabase(localItems: CartItem[]) {
  try {
    const response = await fetch("/api/cart", { cache: "no-store" });
    if (response.status === 401 || !response.ok) return localItems;
    const result = await response.json().catch(() => null) as { items?: CartItem[] } | null;
    const serverItems = Array.isArray(result?.items) ? result.items : [];
    const merged = new Map(serverItems.map((item) => [item.variantId, item]));
    for (const item of localItems) {
      const existing = merged.get(item.variantId);
      merged.set(item.variantId, existing ? { ...item, quantity: Math.max(existing.quantity, item.quantity) } : item);
    }
    return persistCartToDatabase(Array.from(merged.values()));
  } catch {
    return localItems;
  }
}
