import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { contentBlockDefs } from "@/lib/content-blocks";

export default async function AdminContentListPage(
  props: PageProps<"/admin/content">
) {
  const { saved } = await props.searchParams;
  const blocks = await prisma.contentBlock.findMany();
  const blockByKey = new Map(blocks.map((b) => [b.key, b]));

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-navy-950">Content</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Edit the copy and photos shown on the public site.
      </p>

      {saved && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">
          Saved.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {contentBlockDefs.map((def) => {
          const block = blockByKey.get(def.key);
          return (
            <Link
              key={def.key}
              href={`/admin/content/${def.key}`}
              className="rounded-2xl border border-navy-800/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h2 className="font-serif text-lg font-semibold text-navy-950">{def.label}</h2>
              <p className="mt-1 text-sm text-navy-800/60">{def.description}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold-600">
                {block ? "Edit" : "Not set — click to add"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
