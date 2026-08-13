import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { updatePost } from "@/app/admin/actions/blog";

export default async function AdminEditPostPage(
  props: PageProps<"/admin/blog/[id]">
) {
  const { id } = await props.params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/blog" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Blog
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy-950">Edit post</h1>
      <div className="mt-8">
        <BlogPostForm action={updatePost} post={post} />
      </div>
    </div>
  );
}
