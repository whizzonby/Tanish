import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/app/admin/actions/products";

export default async function AdminEditProductPage(
  props: PageProps<"/admin/products/[id]">
) {
  const { id } = await props.params;
  const product = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/products" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Products
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy-950">Edit product</h1>
      <div className="mt-8">
        <ProductForm action={updateProduct} product={product} />
      </div>
    </div>
  );
}
