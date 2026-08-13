"use client";

import { useState } from "react";

export type VariantRow = {
  id?: string;
  label: string;
  sku: string;
  priceDollars: string;
  stock: string;
  isDigital: boolean;
};

export function ProductVariantsEditor({ initialVariants }: { initialVariants: VariantRow[] }) {
  const [variants, setVariants] = useState<VariantRow[]>(
    initialVariants.length > 0
      ? initialVariants
      : [{ label: "", sku: "", priceDollars: "", stock: "", isDigital: false }]
  );

  function update(index: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function addRow() {
    setVariants((prev) => [...prev, { label: "", sku: "", priceDollars: "", stock: "", isDigital: false }]);
  }

  function removeRow(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />
      <p className="mb-2 text-sm font-medium text-navy-900">Variants</p>
      <div className="space-y-3">
        {variants.map((variant, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 rounded-lg border border-navy-800/10 p-3 sm:grid-cols-6">
            <input
              placeholder="Label (e.g. Hardcover)"
              value={variant.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="col-span-2 rounded-lg border border-navy-800/15 px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              placeholder="SKU"
              value={variant.sku}
              onChange={(e) => update(i, { sku: e.target.value })}
              className="rounded-lg border border-navy-800/15 px-3 py-2 text-sm"
            />
            <input
              placeholder="Price USD"
              type="number"
              min="0"
              step="0.01"
              value={variant.priceDollars}
              onChange={(e) => update(i, { priceDollars: e.target.value })}
              className="rounded-lg border border-navy-800/15 px-3 py-2 text-sm"
            />
            <input
              placeholder="Stock (blank = unlimited)"
              type="number"
              min="0"
              value={variant.stock}
              onChange={(e) => update(i, { stock: e.target.value })}
              disabled={variant.isDigital}
              className="rounded-lg border border-navy-800/15 px-3 py-2 text-sm disabled:bg-cream-100"
            />
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-xs text-navy-800">
                <input
                  type="checkbox"
                  checked={variant.isDigital}
                  onChange={(e) => update(i, { isDigital: e.target.checked })}
                  className="h-3.5 w-3.5"
                />
                Digital
              </label>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-3 text-sm font-semibold text-gold-600 hover:text-gold-500"
      >
        + Add variant
      </button>
    </div>
  );
}
