import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { Service } from "@prisma/client";

const categories = ["COACHING", "CLEANING", "CONSTRUCTION", "RENOVATION"] as const;
const brands = ["PERSONAL", "CARING_TOUCH"] as const;
const priceTypes = ["FIXED", "HOURLY", "QUOTE"] as const;

export function ServiceForm({
  action,
  service,
}: {
  action: (formData: FormData) => void;
  service?: Service;
}) {
  return (
    <form action={action} className="space-y-6 rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
      {service && <input type="hidden" name="id" value={service.id} />}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={service?.name}
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={service?.description}
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={service?.category ?? "COACHING"}
            className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="brand">
            Brand
          </label>
          <select
            id="brand"
            name="brand"
            required
            defaultValue={service?.brand ?? "PERSONAL"}
            className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === "PERSONAL" ? "Personal (coaching)" : "Caring Touch Reno"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="priceType">
            Price type
          </label>
          <select
            id="priceType"
            name="priceType"
            defaultValue={service?.priceType ?? "QUOTE"}
            className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          >
            {priceTypes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="priceFromDollars">
            Price from (USD, optional)
          </label>
          <input
            id="priceFromDollars"
            name="priceFromDollars"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              service?.priceFromCents != null ? (service.priceFromCents / 100).toFixed(2) : ""
            }
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="sortOrder">
            Sort order
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={service?.sortOrder ?? 0}
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input
            type="checkbox"
            name="requiresQuote"
            defaultChecked={service?.requiresQuote ?? true}
            className="h-4 w-4 rounded border-navy-800/30"
          />
          Requires a quote (no fixed price shown)
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={service?.isActive ?? true}
            className="h-4 w-4 rounded border-navy-800/30"
          />
          Active (visible on the site)
        </label>
      </div>

      <ImageUploadField name="imageUrl" label="Image (optional)" defaultValue={service?.imageUrl} />

      <button
        type="submit"
        className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
      >
        Save service
      </button>
    </form>
  );
}
