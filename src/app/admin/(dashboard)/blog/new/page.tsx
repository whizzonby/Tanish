import Link from "next/link";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { createPost } from "@/app/admin/actions/blog";

export default function AdminNewPostPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/blog" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Blog
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy-950">New post</h1>
      <div className="mt-8">
        <BlogPostForm action={createPost} />
      </div>
    </div>
  );
}
