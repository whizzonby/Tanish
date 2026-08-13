import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Store",
  description: "Shop Declutter: Your Way to Success and curated interior decor pieces.",
};

export default async function StorePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="text-center">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">Store</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold text-navy-950 sm:text-5xl">
          Books &amp; Interior Decor
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-navy-800/70">
          Start with the book, then bring the same clarity home with a curated edit
          of decor pieces.
        </p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const images = Array.isArray(product.images) ? (product.images as string[]) : [];
          const lowestPrice = Math.min(...product.variants.map((v) => v.priceCents));
          return (
            <Link
              key={product.slug}
              href={`/store/${product.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-navy-800/10 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-200">
                {images[0] && (
                  <Image
                    src={images[0]}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                {product.comingSoon && (
                  <span className="absolute left-3 top-3 rounded-full bg-navy-950/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-300">
                    Coming soon
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-serif text-lg font-semibold text-navy-950">
                  {product.name}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-sm text-navy-800/70">
                  {product.description}
                </p>
                <p className="mt-4 text-sm font-semibold text-gold-600">
                  From {formatPrice(lowestPrice)}
                </p>
              </div>
            </Link>
          );
        })}
        {products.length === 0 && (
          <p className="col-span-full text-center text-navy-800/50">
            The store is being stocked — check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
