import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Life Coaching",
  description:
    "One-on-one and group life coaching with Taniesha Linton Flemmings. Book a session.",
};

const introDefaults = {
  title: "Clear your mind. Choose your next move.",
  body: "Coaching with Taniesha starts with the same idea behind everything she builds: clarity comes from clearing what's in the way. Sessions are practical, honest, and built around where you actually are — not a one-size-fits-all script.",
  imageUrl: "/images/portrait-2.jpg",
};

export default async function CoachingPage() {
  const [block, coachingServices] = await Promise.all([
    prisma.contentBlock.findUnique({ where: { key: "coaching_intro" } }),
    prisma.service.findMany({
      where: { category: "COACHING", isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const intro = {
    title: block?.title || introDefaults.title,
    body: block?.body || introDefaults.body,
    imageUrl: block?.imageUrl || introDefaults.imageUrl,
  };

  return (
    <>
      <section className="bg-navy-950 text-cream-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-400">
              Life Coaching
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              {intro.title}
            </h1>
            <p className="mt-6 max-w-lg text-cream-100/80">{intro.body}</p>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-950/40">
            <Image
              src={intro.imageUrl}
              alt="Taniesha Linton Flemmings coaching"
              fill
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
            Coaching packages
          </h2>
          <p className="mt-4 text-navy-800/70">
            Choose a package below to see what&apos;s included and book a time.
          </p>
        </div>
        {coachingServices.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coachingServices.map((service) => (
              <Link
                key={service.id}
                href={`/coaching/${service.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-navy-800/10 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-100">
                  <Image
                    src={service.imageUrl || "/images/portrait-3.jpg"}
                    alt={service.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-lg font-semibold text-navy-950">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm text-navy-800/70">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                      {service.requiresQuote || service.priceFromCents == null
                        ? "Contact for pricing"
                        : `From ${formatPrice(service.priceFromCents)}`}
                    </p>
                    <span className="text-xs font-semibold text-navy-900 group-hover:underline">
                      Learn more &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-navy-800/20 bg-cream-100 p-10 text-center text-sm text-navy-800/60">
            Coaching packages will be managed from the admin dashboard — check back
            soon, or reach out below to ask about availability now.
          </div>
        )}
      </section>
    </>
  );
}
