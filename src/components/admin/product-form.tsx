import { ImageUploadField } from "@/components/admin/image-upload-field";
import { ProductVariantsEditor, type VariantRow } from "@/components/admin/product-variants-editor";

type ProductWithVariants = {
  id: string;
  slug: string;
  type: string;
  name: string;
  description: string;
  longDescription: string | null;
  images: unknown;
  isActive: boolean;
  comingSoon: boolean;
  variants: {
    id: string;
    label: string;
    sku: string;
    priceCents: number;
    stock: number | null;
    isDigital: boolean;
    downloadUrl: string | null;
  }[];
};

export function ProductForm({
  action,
  product,
}: {
  action: (formData: FormData) => void;
  product?: ProductWithVariants;
}) {
  const initialVariants: VariantRow[] = (product?.variants ?? []).map((v) => ({
    id: v.id,
    label: v.label,
    sku: v.sku,
    priceDollars: (v.priceCents / 100).toFixed(2),
    stock: v.stock == null ? "" : String(v.stock),
    isDigital: v.isDigital,
    downloadUrl: v.downloadUrl ?? "",
  }));

  const images = Array.isArray(product?.images) ? (product?.images as string[]) : [];

  return (
    <form action={action} className="space-y-6 rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="type">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={product?.type ?? "DECOR"}
            className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900"
          >
            <option value="BOOK">Book</option>
            <option value="DECOR">Interior Decor</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="description">
          Short description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={2}
          defaultValue={product?.description}
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="longDescription">
          Full description (product page)
        </label>
        <textarea
          id="longDescription"
          name="longDescription"
          rows={4}
          defaultValue={product?.longDescription ?? ""}
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
        />
      </div>

      <ImageUploadField name="imageUrl" label="Product photo" defaultValue={images[0]} />

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4 rounded border-navy-800/30"
          />
          Active (visible in the store)
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input
            type="checkbox"
            name="comingSoon"
            defaultChecked={product?.comingSoon ?? false}
            className="h-4 w-4 rounded border-navy-800/30"
          />
          Coming soon (visible, not purchasable yet)
        </label>
      </div>

      <div className="border-t border-navy-800/10 pt-6">
        <ProductVariantsEditor initialVariants={initialVariants} />
      </div>

      <button
        type="submit"
        className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
      >
        Save product
      </button>
    </form>
  );
}
