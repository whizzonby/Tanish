import Link from "next/link";
import { JobPostingForm } from "@/components/admin/job-posting-form";
import { createJob } from "@/app/admin/actions/jobs";

export default function AdminNewJobPage() {
  return (
    <div className="max-w-4xl">
      <Link href="/admin/jobs" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Careers
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy-950">New job posting</h1>
      <div className="mt-8">
        <JobPostingForm action={createJob} />
      </div>
    </div>
  );
}
