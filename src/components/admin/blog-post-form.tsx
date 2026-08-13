import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { BlogPost } from "@prisma/client";

export function BlogPostForm({
  action,
  post,
}: {
  action: (formData: FormData) => void;
  post?: BlogPost;
}) {
  return (
    <form action={action} className="space-y-6 rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={post?.title}
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
        />
        {post && (
          <p className="mt-1 text-xs text-navy-800/50">
            URL: /blog/{post.slug} (slug doesn&apos;t change when you edit the title)
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="excerpt">
          Excerpt (shown on the blog list)
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="content">
          Content (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={16}
          defaultValue={post?.content}
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 font-mono text-sm text-navy-900"
        />
      </div>

      <ImageUploadField name="coverImage" label="Cover image" defaultValue={post?.coverImage} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="tags">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={post?.tags.join(", ")}
          placeholder="decluttering, mindset, home"
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={post?.status ?? "DRAFT"}
          className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
      >
        Save post
      </button>
    </form>
  );
}
