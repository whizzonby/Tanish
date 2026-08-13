"use client";

import { useSyncExternalStore } from "react";
import * as cartStore from "@/lib/cart-store";

export function useCart() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  return {
    items,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    setQuantity: cartStore.setQuantity,
    clear: cartStore.clear,
    totalCents: items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    totalCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}
