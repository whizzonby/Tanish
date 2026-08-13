import Image from "next/image";
import type { Metadata } from "next";
import { NewsletterForm } from "@/components/newsletter-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Taniesha Linton Flemmings — life coach, author, and founder of Caring Touch Reno Construction Ltd.",
};

const defaults = {
  title: "A clear space, a clear mind, a life worth building",
  body: [
    "Taniesha Linton Flemmings has spent her career believing the same thing, in every room she's ever worked in: the space around you shapes the life you're able to live. That belief shows up differently depending on the day — sometimes it's a coaching session helping a client clear the mental clutter standing between them and their next move. Sometimes it's a full renovation crew transforming a property into a home someone is proud of. And sometimes it's as simple as a spotless, cared-for space that lets a family breathe again.",
    "That throughline is what led her to found Caring Touch Reno Construction Ltd, a Jamaica-based cleaning, construction, and renovation company built on the same care she brings to one-on-one coaching. It's also what led her to write Declutter: Your Way to Success — a book born from watching, again and again, how much a cleared space changes what people believe is possible for themselves.",
    "Today, Taniesha works across all of it: coaching clients toward clarity, leading her team on cleaning and renovation projects across Jamaica, curating interior pieces that help a house feel like a home, and writing about what she's learned along the way. Different rooms, same mission — clean spaces, clear minds, successful lives.",
  ],
  imageUrl: "/images/portrait-3.jpg",
};

export default async function AboutPage() {
  const block = await prisma.contentBlock.findUnique({ where: { key: "about_bio" } });
  const title = block?.title || defaults.title;
  const paragraphs = block?.body ? block.body.split(/\n\n+/) : defaults.body;
  const imageUrl = block?.imageUrl || defaults.imageUrl;

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -bottom-5 -right-5 h-full w-full rounded-[2rem] border border-gold-400/50" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl shadow-navy-950/20">
              <Image
                src={imageUrl}
                alt="Taniesha Linton Flemmings"
                fill
                sizes="(min-width: 1024px) 384px, 90vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">
              About Taniesha
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-navy-950 sm:text-5xl">
              {title}
            </h1>

            <div className="mt-6 space-y-5 text-navy-800/80 leading-relaxed">
              {paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream-200/60">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-8">
          <h2 className="font-serif text-2xl font-semibold text-navy-950 sm:text-3xl">
            Want the story delivered to your inbox?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-navy-800/70">
            Join the newsletter for reflections on decluttering, discipline, and
            building a life with intention.
          </p>
          <div className="mt-8 flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
