import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/store/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage(props: PageProps<"/store/[slug]">) {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });
  if (!product || !product.isActive) notFound();

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const settings = await getSiteSettings();

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl shadow-xl shadow-navy-950/15">
          {images[0] && (
            <Image
              src={images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 448px, 90vw"
              className="object-cover"
            />
          )}
        </div>

        <div>
          <h1 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-navy-800/75">
            {product.longDescription ?? product.description}
          </p>

          <div className="mt-8">
            <ProductPurchasePanel
              contactEmail={settings.email}
              product={{
                slug: product.slug,
                name: product.name,
                image: images[0] ?? "",
                comingSoon: product.comingSoon,
                variants: product.variants.map((v) => ({
                  id: v.id,
                  label: v.label,
                  priceCents: v.priceCents,
                  isDigital: v.isDigital,
                  stock: v.stock,
                })),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
