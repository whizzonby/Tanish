import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "@/app/admin/actions/blog";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy-950">Blog</h1>
          <p className="mt-1 text-sm text-navy-800/60">Write and publish posts.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-navy-800"
        >
          New post
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-800/10 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-navy-800/10 text-left text-xs uppercase tracking-wide text-navy-800/50">
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Published</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-navy-800/5 last:border-0">
                <td className="px-5 py-3 font-medium text-navy-950">{post.title}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      post.status === "PUBLISHED"
                        ? "bg-green-50 text-green-700"
                        : "bg-navy-800/5 text-navy-800/50"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-navy-800/60">
                  {post.publishedAt
                    ? post.publishedAt.toLocaleDateString("en-US", { dateStyle: "medium" })
                    : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-sm font-semibold text-gold-600 hover:text-gold-500"
                    >
                      Edit
                    </Link>
                    <form action={deletePost}>
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit" className="text-sm font-semibold text-red-500 hover:text-red-600">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-navy-800/50">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
