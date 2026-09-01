import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { employmentTypeLabels } from "@/lib/jobs";
import { JobApplicationForm } from "@/components/job-application-form";

export const revalidate = 60;

export async function generateStaticParams() {
  const jobs = await prisma.jobPosting.findMany({
    where: { status: { in: ["OPEN", "CLOSED"] } },
    select: { slug: true },
  });
  return jobs.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata(
  props: PageProps<"/careers/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const job = await prisma.jobPosting.findUnique({ where: { slug } });
  if (!job) return {};
  return { title: `${job.title} — Careers`, description: job.summary };
}

export default async function JobPostingPage(props: PageProps<"/careers/[slug]">) {
  const { slug } = await props.params;
  const [job, settings] = await Promise.all([
    prisma.jobPosting.findUnique({ where: { slug } }),
    getSiteSettings(),
  ]);

  if (!job || job.status === "DRAFT") notFound();

  const open = job.status === "OPEN";

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <Link href="/careers" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; All openings
      </Link>

      <header className="mt-6">
        <h1 className="font-serif text-4xl font-semibold text-navy-950 sm:text-5xl">
          {job.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className="rounded-full bg-cream-200 px-3 py-1 text-navy-800">
            {employmentTypeLabels[job.employmentType]}
          </span>
          <span className="rounded-full bg-cream-200 px-3 py-1 text-navy-800">
            {job.location}
          </span>
          {job.department && (
            <span className="rounded-full bg-cream-200 px-3 py-1 text-navy-800">
              {job.department}
            </span>
          )}
          {job.compensation && (
            <span className="rounded-full bg-cream-200 px-3 py-1 text-navy-800">
              {job.compensation}
            </span>
          )}
        </div>
        <p className="mt-6 text-lg text-navy-800/80">{job.summary}</p>
        {job.closesAt && open && (
          <p className="mt-3 text-sm text-navy-800/50">
            Applications close{" "}
            {job.closesAt.toLocaleDateString("en-US", { dateStyle: "long" })}.
          </p>
        )}
      </header>

      {job.responsibilities.length > 0 && (
        <Section title="What you'll do" items={job.responsibilities} />
      )}
      {job.requirements.length > 0 && (
        <Section title="What we're looking for" items={job.requirements} />
      )}
      {job.benefits.length > 0 && (
        <Section title="What we offer" items={job.benefits} />
      )}

      <section id="apply" className="mt-14 scroll-mt-24 border-t border-navy-800/10 pt-10">
        <h2 className="font-serif text-2xl font-semibold text-navy-950">
          {open ? "Apply for this position" : "This position is closed"}
        </h2>
        {open ? (
          <>
            <p className="mt-2 text-sm text-navy-800/70">
              Fill in the form below. You can also call or WhatsApp us at{" "}
              <a href={`tel:${settings.phone}`} className="text-gold-600 hover:underline">
                {settings.phone}
              </a>
              .
            </p>
            <div className="mt-8">
              <JobApplicationForm
                jobId={job.id}
                jobTitle={job.title}
                contactEmail={settings.email}
              />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-navy-800/70">
            We&apos;re no longer accepting applications for this role. See our{" "}
            <Link href="/careers" className="text-gold-600 hover:underline">
              current openings
            </Link>
            .
          </p>
        )}
      </section>
    </article>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-semibold text-navy-950">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-navy-800/80">
            <span aria-hidden className="mt-1 text-gold-600">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
