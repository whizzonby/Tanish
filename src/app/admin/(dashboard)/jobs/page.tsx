import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteJob } from "@/app/admin/actions/jobs";
import { employmentTypeLabels } from "@/lib/jobs";

const statusStyles: Record<string, string> = {
  OPEN: "bg-green-50 text-green-700",
  DRAFT: "bg-navy-800/5 text-navy-800/50",
  CLOSED: "bg-amber-50 text-amber-700",
};

export default async function AdminJobsPage() {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy-950">Careers</h1>
          <p className="mt-1 text-sm text-navy-800/60">
            Create and manage job postings shown on the public careers page.
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-navy-800"
        >
          New job posting
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-800/10 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-navy-800/10 text-left text-xs uppercase tracking-wide text-navy-800/50">
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Applications</th>
              <th className="px-5 py-3">Closes</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-navy-800/5 last:border-0">
                <td className="px-5 py-3 font-medium text-navy-950">{job.title}</td>
                <td className="px-5 py-3 text-navy-800/60">
                  {employmentTypeLabels[job.employmentType]}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusStyles[job.status] ?? "bg-navy-800/5 text-navy-800/50"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/applications?job=${job.id}`}
                    className="font-semibold text-gold-600 hover:text-gold-500"
                  >
                    {job._count.applications}
                  </Link>
                </td>
                <td className="px-5 py-3 text-navy-800/60">
                  {job.closesAt
                    ? job.closesAt.toLocaleDateString("en-US", { dateStyle: "medium" })
                    : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="text-sm font-semibold text-gold-600 hover:text-gold-500"
                    >
                      Edit
                    </Link>
                    <form action={deleteJob}>
                      <input type="hidden" name="id" value={job.id} />
                      <button
                        type="submit"
                        className="text-sm font-semibold text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-navy-800/50">
                  No job postings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
