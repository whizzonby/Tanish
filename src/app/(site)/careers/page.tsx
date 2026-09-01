import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { employmentTypeLabels } from "@/lib/jobs";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join the ${siteConfig.brandName} team. Current openings in cleaning, construction, and renovation across Jamaica.`,
};

export const revalidate = 60;

export default async function CareersPage() {
  const jobs = await prisma.jobPosting.findMany({
    where: { status: { in: ["OPEN", "CLOSED"] } },
    orderBy: [{ status: "asc" }, { postedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <section className="bg-navy-950 text-cream-50">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-400">
            Join our team
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
            Careers at {siteConfig.brandName}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-cream-100/80">
            Clean spaces. Better places. Stronger community. We&apos;re always looking for
            reliable, detail-oriented people to help us keep spaces clean, safe and welcoming.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <h2 className="font-serif text-2xl font-semibold text-navy-950">Current openings</h2>

        <div className="mt-8 space-y-4">
          {jobs.map((job) => {
            const open = job.status === "OPEN";
            return (
              <Link
                key={job.id}
                href={`/careers/${job.slug}`}
                className="block rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-serif text-lg font-semibold text-navy-950">
                    {job.title}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      open ? "bg-green-50 text-green-700" : "bg-navy-800/5 text-navy-800/50"
                    }`}
                  >
                    {open ? "Accepting applications" : "Closed"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-navy-800/70">{job.summary}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {employmentTypeLabels[job.employmentType]} · {job.location}
                </p>
              </Link>
            );
          })}

          {jobs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-navy-800/20 bg-cream-100 p-10 text-center text-sm text-navy-800/60">
              There are no open positions right now. Check back soon, or send your details to{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-gold-600 underline">
                {siteConfig.email}
              </a>{" "}
              and we&apos;ll keep you in mind.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
