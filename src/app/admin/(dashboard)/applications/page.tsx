import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  applicationStatusLabels,
  applicationStatuses,
} from "@/lib/jobs";
import {
  deleteApplication,
  saveApplicationNotes,
  updateApplicationStatus,
} from "@/app/admin/actions/applications";

const statusStyles: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  REVIEWING: "bg-amber-50 text-amber-700",
  INTERVIEW: "bg-purple-50 text-purple-700",
  HIRED: "bg-green-50 text-green-700",
  REJECTED: "bg-navy-800/5 text-navy-800/50",
};

export default async function AdminApplicationsPage(
  props: PageProps<"/admin/applications">
) {
  const { job: jobFilter } = await props.searchParams;
  const jobId = typeof jobFilter === "string" ? jobFilter : undefined;

  const [jobs, applications] = await Promise.all([
    prisma.jobPosting.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.jobApplication.findMany({
      where: jobId ? { jobId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { job: { select: { title: true, slug: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-navy-950">Job Applications</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Everyone who has applied through the careers page.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip href="/admin/applications" active={!jobId} label="All postings" />
        {jobs.map((j) => (
          <FilterChip
            key={j.id}
            href={`/admin/applications?job=${j.id}`}
            active={jobId === j.id}
            label={j.title}
          />
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="rounded-2xl border border-navy-800/10 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-serif text-lg font-semibold text-navy-950">
                  {app.fullName}
                  <span
                    className={`ml-3 rounded-full px-2.5 py-1 align-middle text-xs font-semibold ${
                      statusStyles[app.status] ?? "bg-navy-800/5 text-navy-800/50"
                    }`}
                  >
                    {applicationStatusLabels[app.status]}
                  </span>
                </p>
                <p className="mt-1 text-sm text-navy-800/60">
                  Applied for <span className="font-medium">{app.job.title}</span>
                </p>
                <p className="mt-1 text-sm text-navy-800/60">
                  <a href={`mailto:${app.email}`} className="text-gold-600 hover:underline">
                    {app.email}
                  </a>{" "}
                  · <a href={`tel:${app.phone}`} className="hover:underline">{app.phone}</a>
                  {app.location ? ` · ${app.location}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <form action={updateApplicationStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={app.id} />
                  <select
                    name="status"
                    defaultValue={app.status}
                    className="rounded-lg border border-navy-800/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900"
                  >
                    {applicationStatuses.map((s) => (
                      <option key={s} value={s}>
                        {applicationStatusLabels[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-cream-50 hover:bg-navy-800"
                  >
                    Update
                  </button>
                </form>
                <form action={deleteApplication}>
                  <input type="hidden" name="id" value={app.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {app.availability && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-navy-800/40">
                    Availability
                  </dt>
                  <dd className="text-navy-800/80">{app.availability}</dd>
                </div>
              )}
              {app.experience && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-navy-800/40">
                    Experience
                  </dt>
                  <dd className="whitespace-pre-wrap text-navy-800/80">{app.experience}</dd>
                </div>
              )}
            </dl>

            {app.coverLetter && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-800/40">
                  Message
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-navy-800/80">
                  {app.coverLetter}
                </p>
              </div>
            )}

            {app.resumeUrl && (
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-gold-600 hover:text-gold-500"
              >
                Download résumé &darr;
              </a>
            )}

            <form action={saveApplicationNotes} className="mt-4 border-t border-navy-800/10 pt-4">
              <input type="hidden" name="id" value={app.id} />
              <label className="text-xs font-semibold uppercase tracking-wide text-navy-800/40">
                Private notes
              </label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={app.notes ?? ""}
                className="mt-1 w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm text-navy-900"
              />
              <button
                type="submit"
                className="mt-2 rounded-lg border border-navy-800/15 px-3 py-1.5 text-xs font-semibold text-navy-800 hover:bg-cream-100"
              >
                Save notes
              </button>
            </form>

            <p className="mt-3 text-xs text-navy-800/40">
              {app.createdAt.toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        ))}

        {applications.length === 0 && (
          <p className="rounded-2xl border border-dashed border-navy-800/20 bg-white p-8 text-center text-navy-800/50">
            No applications yet.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-navy-900 text-cream-50"
          : "border border-navy-800/15 text-navy-800/70 hover:bg-cream-100"
      }`}
    >
      {label}
    </Link>
  );
}
