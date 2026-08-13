import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { contentBlockDefs } from "@/lib/content-blocks";
import { updateContentBlock } from "@/app/admin/actions/content";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export default async function AdminContentEditPage(
  props: PageProps<"/admin/content/[key]">
) {
  const { key } = await props.params;
  const def = contentBlockDefs.find((d) => d.key === key);
  if (!def) notFound();

  const block = await prisma.contentBlock.findUnique({ where: { key } });

  return (
    <div className="max-w-2xl">
      <Link href="/admin/content" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Content
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy-950">{def.label}</h1>
      <p className="mt-1 text-sm text-navy-800/60">{def.description}</p>

      <form action={updateContentBlock} className="mt-8 space-y-6 rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
        <input type="hidden" name="key" value={key} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="title">
            Title / Headline
          </label>
          <input
            id="title"
            name="title"
            defaultValue={block?.title ?? ""}
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="body">
            Body text
          </label>
          <textarea
            id="body"
            name="body"
            rows={8}
            defaultValue={block?.body ?? ""}
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-navy-800/50">
            Separate paragraphs with a blank line.
          </p>
        </div>

        <ImageUploadField name="imageUrl" label="Photo" defaultValue={block?.imageUrl} />

        <button
          type="submit"
          className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
