import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { siteConfig } from "@/lib/site-config";
import { prisma } from "@/lib/prisma";

const heroDefaults = {
  body: "Life coach, author, and founder of Caring Touch Reno Construction Ltd. Taniesha helps people and properties go from cluttered to transformed — one intentional space at a time.",
  imageUrl: "/images/hero-portrait.jpg",
};

const pillars = [
  {
    title: "Life Coaching",
    description:
      "One-on-one and group coaching to help you declutter your mind, set direction, and build a life that feels as good as it looks.",
    href: "/coaching",
    cta: "Book a session",
  },
  {
    title: "Caring Touch Reno",
    description:
      "Residential & commercial cleaning, construction, and renovation across Jamaica — built on the same care she brings to coaching.",
    href: "/cleaning",
    cta: "Request a quote",
  },
  {
    title: "The Store",
    description:
      "Her book Declutter: Your Way to Success, plus a curated edit of interior decor pieces for a home that supports your goals.",
    href: "/store",
    cta: "Shop now",
  },
  {
    title: "The Blog",
    description:
      "Notes on decluttering, discipline, home transformation, and building a life and business with intention.",
    href: "/blog",
    cta: "Read the blog",
  },
];

export default async function Home() {
  const heroBlock = await prisma.contentBlock.findUnique({ where: { key: "hero" } });
  const hero = {
    body: heroBlock?.body || heroDefaults.body,
    imageUrl: heroBlock?.imageUrl || heroDefaults.imageUrl,
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-cream-50">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-400">
              {siteConfig.personalName}
            </p>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Clean Spaces.
              <br />
              Clear Mind.
              <br />
              <span className="text-gold-400">Successful Life.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-cream-100/80">{hero.body}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/coaching"
                className="inline-flex items-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
              >
                Book a Coaching Session
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center rounded-full border border-cream-50/25 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:border-gold-400 hover:text-gold-300"
              >
                Shop the Store
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="absolute -bottom-6 -left-6 h-full w-full rounded-[2rem] border border-gold-400/40" />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-950/40">
              <Image
                src={hero.imageUrl}
                alt={siteConfig.personalName}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
            One brand, four ways to bring order and beauty into your life
          </h2>
          <p className="mt-4 text-navy-800/70">
            Every part of what Taniesha builds — in the mind and in the home — traces
            back to one idea: a clear space creates room for a successful life.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="flex flex-col justify-between rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm shadow-navy-950/5 transition-shadow hover:shadow-md"
            >
              <div>
                <h3 className="font-serif text-xl font-semibold text-navy-950">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-800/70">
                  {pillar.description}
                </p>
              </div>
              <Link
                href={pillar.href}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 transition-colors hover:text-gold-500"
              >
                {pillar.cta}
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Book feature */}
      <section className="bg-cream-200/60">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="mx-auto w-full max-w-xs lg:mx-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-2xl shadow-navy-950/20">
              <Image
                src="/images/book-cover.png"
                alt="Declutter: Your Way to Success by Taniesha Linton Flemmings"
                fill
                sizes="(min-width: 1024px) 320px, 80vw"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">
              Now Available
            </p>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
              Declutter: Your Way to Success
            </h2>
            <p className="mt-5 max-w-lg text-navy-800/75">
              A practical guide to clearing physical and mental clutter so you can
              build the life, home, and business you actually want. Available in
              hardcover and ebook.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/store/declutter-your-way-to-success"
                className="inline-flex items-center rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
              >
                Get the Book
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-navy-900 text-cream-50">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-16 text-center lg:px-8">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            Join the newsletter
          </h2>
          <p className="max-w-xl text-cream-100/75">
            Practical tips on decluttering your mind and your home, new blog posts,
            and first access to store drops — no spam, ever.
          </p>
          <NewsletterForm variant="dark" />
        </div>
      </section>
    </>
  );
}
