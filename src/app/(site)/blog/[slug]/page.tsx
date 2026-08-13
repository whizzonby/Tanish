import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";

// Falls back to this window if an admin edit's on-demand revalidation
// (revalidatePath) doesn't reach this page for any reason — e.g. content
// written directly via a script (seeding, migrations) rather than the admin
// UI, which bypasses revalidatePath entirely.
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return {};
  return { title: post.title, description: post.excerpt ?? undefined };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") notFound();

  const html = renderMarkdown(post.content);

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <Link href="/blog" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Blog
      </Link>

      <header className="mt-6">
        {post.publishedAt && (
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">
            {post.publishedAt.toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>
        )}
        <h1 className="mt-3 font-serif text-4xl font-semibold text-navy-950 sm:text-5xl">
          {post.title}
        </h1>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-navy-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-sm">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="prose prose-stone mt-10 max-w-none prose-headings:font-serif prose-headings:text-navy-950 prose-a:text-gold-600"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
