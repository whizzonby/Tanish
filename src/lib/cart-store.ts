import type { CartItem } from "@/lib/cart-types";

const STORAGE_KEY = "caringtouchreno.cart";

const EMPTY_CART: CartItem[] = [];

let items: CartItem[] = EMPTY_CART;
let hydrated = false;
const listeners = new Set<() => void>();

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function emit() {
  persist();
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Lazily hydrates from localStorage on first client read, so server-rendered
// snapshots (always []) match the client's first render and avoid a mismatch.
export function getSnapshot(): CartItem[] {
  if (!hydrated) {
    items = loadFromStorage();
    hydrated = true;
  }
  return items;
}

// Must return a stable reference — a fresh [] literal here would fail
// React's equality check on every call and trigger an infinite render loop.
export function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

export function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  const existing = items.find((i) => i.variantId === item.variantId);
  items = existing
    ? items.map((i) => (i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i))
    : [...items, { ...item, quantity }];
  emit();
}

export function removeItem(variantId: string) {
  items = items.filter((i) => i.variantId !== variantId);
  emit();
}

export function setQuantity(variantId: string, quantity: number) {
  items =
    quantity <= 0
      ? items.filter((i) => i.variantId !== variantId)
      : items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i));
  emit();
}

export function clear() {
  items = [];
  emit();
}
