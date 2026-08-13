import type { Metadata } from "next";
import Image from "next/image";
import { QuoteRequestForm } from "@/components/quote-request-form";
import { siteConfig } from "@/lib/site-config";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Construction & Renovation",
  description:
    "Construction, renovation, and property transformation services from Caring Touch Reno Construction Ltd, Jamaica.",
};

const introDefaults = {
  title: "Construction & Renovation",
  body: "From full builds to room-by-room renovations, we transform properties across Jamaica with the same care behind everything Taniesha does.",
  imageUrl: "/images/construction-2.jpg",
};

const gallery = [
  { src: "/images/construction-1.jpg", alt: "Renovated interior with vaulted wood ceiling" },
  { src: "/images/construction-2.jpg", alt: "Sunroom renovation with skylights" },
  { src: "/images/interior-2.jpg", alt: "Finished living room after renovation" },
];

export default async function ConstructionRenovationPage() {
  const [block, services, settings] = await Promise.all([
    prisma.contentBlock.findUnique({ where: { key: "construction_intro" } }),
    prisma.service.findMany({
      where: { category: { in: ["CONSTRUCTION", "RENOVATION"] }, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getSiteSettings(),
  ]);

  const intro = {
    title: block?.title || introDefaults.title,
    body: block?.body || introDefaults.body,
    imageUrl: block?.imageUrl || introDefaults.imageUrl,
  };

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-cream-50">
        <div className="absolute inset-0">
          <Image src={intro.imageUrl} alt="" fill sizes="100vw" className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/85 to-navy-950/60" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
          <div className="mx-auto mb-6 flex items-center justify-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt={siteConfig.brandName}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="font-serif text-lg font-semibold">{siteConfig.brandName}</span>
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            {intro.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-cream-100/80">{intro.body}</p>
          <a
            href="#quote"
            className="mt-8 inline-flex items-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
          >
            Request a Quote
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <h2 className="text-center font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
          What we offer
        </h2>
        {services.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm"
              >
                <h3 className="font-serif text-lg font-semibold text-navy-950">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-navy-800/70">{service.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {service.requiresQuote || service.priceFromCents == null
                    ? "Quote on request"
                    : `From ${formatPrice(service.priceFromCents)}`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-navy-800/20 bg-cream-100 p-10 text-center text-sm text-navy-800/60">
            Our full service list is being finalized — reach out below and we&apos;ll
            help scope your project.
          </div>
        )}
      </section>

      <section className="bg-cream-200/60">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
            Recent transformations
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-navy-800/70">
            A preview of the kind of spaces we build and renovate — Taniesha&apos;s
            own project photos will replace this gallery via the admin CMS.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {gallery.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="quote" className="scroll-mt-24 bg-cream-100">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
              Request a construction or renovation quote
            </h2>
            <p className="mt-4 text-navy-800/70">
              Share your project details and we&apos;ll follow up to schedule a site
              visit.
            </p>
          </div>
          <div className="mt-10">
            <QuoteRequestForm
              defaultCategory="construction"
              contactEmail={settings.email}
              serviceOptions={
                services.length > 0
                  ? services.map((s) => ({
                      name: s.name,
                      category: s.category === "RENOVATION" ? ("renovation" as const) : ("construction" as const),
                    }))
                  : [{ name: "General Construction & Renovation", category: "construction" as const }]
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
