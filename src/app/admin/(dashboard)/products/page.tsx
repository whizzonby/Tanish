import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/app/admin/actions/products";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy-950">Products</h1>
          <p className="mt-1 text-sm text-navy-800/60">The book and interior decor catalog.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-navy-800"
        >
          Add product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-800/10 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-navy-800/10 text-left text-xs uppercase tracking-wide text-navy-800/50">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Variants</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const prices = product.variants.map((v) => v.priceCents);
              return (
                <tr key={product.id} className="border-b border-navy-800/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-navy-950">{product.name}</td>
                  <td className="px-5 py-3 text-navy-800/70">{product.type}</td>
                  <td className="px-5 py-3 text-navy-800/70">{product.variants.length}</td>
                  <td className="px-5 py-3 text-navy-800/70">
                    {prices.length > 0 ? `From ${formatPrice(Math.min(...prices))}` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`mr-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.isActive ? "bg-green-50 text-green-700" : "bg-navy-800/5 text-navy-800/50"
                      }`}
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </span>
                    {product.comingSoon && (
                      <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-600">
                        Coming soon
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm font-semibold text-gold-600 hover:text-gold-500"
                      >
                        Edit
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button type="submit" className="text-sm font-semibold text-red-500 hover:text-red-600">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-navy-800/50">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
