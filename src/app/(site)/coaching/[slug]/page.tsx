import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";

export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    where: { category: "COACHING", isActive: true },
    select: { slug: true },
  });
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  props: PageProps<"/coaching/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return {};
  return { title: service.name, description: service.description };
}

export default async function CoachingServicePage(props: PageProps<"/coaching/[slug]">) {
  const { slug } = await props.params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service || service.category !== "COACHING" || !service.isActive) notFound();

  const detailHtml = service.longDescription ? renderMarkdown(service.longDescription) : null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
      <Link href="/coaching" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Coaching
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl shadow-xl shadow-navy-950/15">
          <Image
            src={service.imageUrl || "/images/portrait-3.jpg"}
            alt={service.name}
            fill
            sizes="(min-width: 1024px) 448px, 90vw"
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
            {service.name}
          </h1>
          <p className="mt-4 text-navy-800/75">{service.description}</p>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-gold-600">
            {service.requiresQuote || service.priceFromCents == null
              ? "Contact for pricing"
              : `From ${formatPrice(service.priceFromCents)}`}
          </p>

          {detailHtml && (
            <div
              className="prose prose-stone mt-8 max-w-none prose-headings:font-serif prose-headings:text-navy-950 prose-a:text-gold-600"
              dangerouslySetInnerHTML={{ __html: detailHtml }}
            />
          )}

          <div className="mt-10">
            <Link
              href={`/coaching/${service.slug}/book`}
              className="inline-flex items-center rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
            >
              Book this session
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
