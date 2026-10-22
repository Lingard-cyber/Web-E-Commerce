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
