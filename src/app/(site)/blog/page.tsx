import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewsletterForm } from "@/components/newsletter-form";

// Falls back to this window if an admin edit's on-demand revalidation
// (revalidatePath) doesn't reach this page for any reason — e.g. content
// written directly via a script (seeding, migrations) rather than the admin
// UI, which bypasses revalidatePath entirely.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on decluttering, coaching, and building a life with intention.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  if (posts.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">Blog</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold text-navy-950 sm:text-5xl">
          New writing is on its way
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-navy-800/70">
          Taniesha is working on the first posts — notes on decluttering, discipline,
          home transformation, and building a life and business with intention. Join
          the newsletter to know the moment new writing goes live.
        </p>
        <div className="mt-10 flex justify-center">
          <NewsletterForm />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
      <div className="text-center">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">Blog</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold text-navy-950 sm:text-5xl">
          Notes on Clarity
        </h1>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-navy-800/10 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {post.coverImage && (
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-200">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              {post.publishedAt && (
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {post.publishedAt.toLocaleDateString("en-US", { dateStyle: "medium" })}
                </p>
              )}
              <h2 className="mt-2 font-serif text-lg font-semibold text-navy-950">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 line-clamp-3 text-sm text-navy-800/70">{post.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
