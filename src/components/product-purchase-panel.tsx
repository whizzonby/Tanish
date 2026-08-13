"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart/cart-context";

type Variant = {
  id: string;
  label: string;
  priceCents: number;
  isDigital: boolean;
  stock: number | null;
};

type Product = {
  slug: string;
  name: string;
  image: string;
  comingSoon: boolean;
  variants: Variant[];
};

export function ProductPurchasePanel({
  product,
  contactEmail,
}: {
  product: Product;
  contactEmail: string;
}) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((v) => v.id === variantId)!;
  const outOfStock = !variant.isDigital && variant.stock !== null && variant.stock <= 0;

  function onAddToCart() {
    addItem({
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: variant.label,
      priceCents: variant.priceCents,
      image: product.image,
      isDigital: variant.isDigital,
    });
    setAdded(true);
  }

  return (
    <div>
      {product.variants.length > 1 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-navy-900">Format</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariantId(v.id);
                  setAdded(false);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  v.id === variantId
                    ? "border-navy-900 bg-navy-900 text-cream-50"
                    : "border-navy-800/20 text-navy-800 hover:border-navy-800/40"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="font-serif text-3xl font-semibold text-navy-950">
        {formatPrice(variant.priceCents)}
      </p>

      {product.comingSoon ? (
        <p className="mt-6 rounded-xl border border-dashed border-navy-800/20 bg-cream-100 p-4 text-sm text-navy-800/70">
          This item is coming soon to the store. Reach out via{" "}
          <a href={`mailto:${contactEmail}`} className="text-gold-600 underline">
            {contactEmail}
          </a>{" "}
          to be notified when it&apos;s available.
        </p>
      ) : outOfStock ? (
        <p className="mt-6 rounded-xl border border-dashed border-navy-800/20 bg-cream-100 p-4 text-sm text-navy-800/70">
          This item is currently out of stock.
        </p>
      ) : (
        <div className="mt-6">
          {added ? (
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm font-medium text-green-700">Added to cart.</p>
              <Link
                href="/cart"
                className="inline-flex items-center rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-navy-800"
              >
                View Cart
              </Link>
              <button
                type="button"
                onClick={onAddToCart}
                className="text-sm font-semibold text-gold-600 hover:text-gold-500"
              >
                Add another
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAddToCart}
              className="inline-flex w-full items-center justify-center rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800 sm:w-auto"
            >
              Add to Cart — {variant.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
