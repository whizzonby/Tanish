"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
        <h1 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
          Your cart is empty
        </h1>
        <p className="mt-4 text-navy-800/70">
          Browse the store to find the book or a piece of decor.
        </p>
        <Link
          href="/store"
          className="mt-8 inline-flex items-center rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-navy-800"
        >
          Go to Store
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">Your Cart</h1>

      <div className="mt-10 divide-y divide-navy-800/10 rounded-2xl border border-navy-800/10 bg-white shadow-sm">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-4 p-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-200">
              {item.image && (
                <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif font-semibold text-navy-950">{item.productName}</p>
              <p className="text-sm text-navy-800/60">{item.variantLabel}</p>
              <p className="mt-1 text-sm font-semibold text-gold-600">{formatPrice(item.priceCents)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-navy-800/20 text-navy-800 hover:border-navy-800/40"
                aria-label="Decrease quantity"
              >
                &minus;
              </button>
              <span className="w-6 text-center text-sm font-medium text-navy-950">{item.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-navy-800/20 text-navy-800 hover:border-navy-800/40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.variantId)}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-4">
        <p className="text-lg font-semibold text-navy-950">
          Subtotal: <span className="text-gold-600">{formatPrice(totalCents)}</span>
        </p>
        <Link
          href="/checkout"
          className="inline-flex items-center rounded-full bg-navy-900 px-8 py-3.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
        >
          Proceed to Checkout
        </Link>
      </div>
    </section>
  );
}
