import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/app/admin/actions/products";

export default function AdminNewProductPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/products" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Products
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy-950">Add product</h1>
      <div className="mt-8">
        <ProductForm action={createProduct} />
      </div>
    </div>
  );
}
