import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobPostingForm } from "@/components/admin/job-posting-form";
import { updateJob } from "@/app/admin/actions/jobs";

export default async function AdminEditJobPage(props: PageProps<"/admin/jobs/[id]">) {
  const { id } = await props.params;
  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/jobs" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Careers
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-navy-950">Edit job posting</h1>
        <Link
          href={`/admin/applications?job=${job.id}`}
          className="text-sm font-semibold text-gold-600 hover:text-gold-500"
        >
          View applications &rarr;
        </Link>
      </div>
      <div className="mt-8">
        <JobPostingForm action={updateJob} job={job} />
      </div>
    </div>
  );
}
