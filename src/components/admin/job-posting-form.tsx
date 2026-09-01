import { employmentTypeLabels, employmentTypes, jobStatuses } from "@/lib/jobs";
import type { JobPosting } from "@prisma/client";

function toDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export function JobPostingForm({
  action,
  job,
}: {
  action: (formData: FormData) => void;
  job?: JobPosting;
}) {
  return (
    <form
      action={action}
      className="space-y-6 rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm"
    >
      {job && <input type="hidden" name="id" value={job.id} />}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="title">
          Job title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={job?.title}
          placeholder="Part-Time Cleaner"
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
        {job && (
          <p className="mt-1 text-xs text-navy-800/50">
            URL: /careers/{job.slug} (slug doesn&apos;t change when you edit the title)
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="department">
            Department / team (optional)
          </label>
          <input
            id="department"
            name="department"
            defaultValue={job?.department ?? ""}
            placeholder="Cleaning"
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={job?.location ?? "Kingston, Jamaica"}
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-navy-900"
            htmlFor="employmentType"
          >
            Employment type
          </label>
          <select
            id="employmentType"
            name="employmentType"
            defaultValue={job?.employmentType ?? "PART_TIME"}
            className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          >
            {employmentTypes.map((t) => (
              <option key={t} value={t}>
                {employmentTypeLabels[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-navy-900"
            htmlFor="compensation"
          >
            Pay / compensation (optional)
          </label>
          <input
            id="compensation"
            name="compensation"
            defaultValue={job?.compensation ?? ""}
            placeholder="Competitive hourly rate"
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="summary">
          Summary (shown on the careers list and at the top of the posting)
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          required
          defaultValue={job?.summary}
          placeholder="Join the Caring Touch Reno team and help us keep spaces clean, safe and welcoming."
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ListField
          name="responsibilities"
          label="What you'll do"
          defaultValue={job?.responsibilities}
          placeholder={"Clean and sanitize offices and facilities\nSweep, mop, vacuum and dust\nEmpty bins and dispose of waste"}
        />
        <ListField
          name="requirements"
          label="What we're looking for"
          defaultValue={job?.requirements}
          placeholder={"Reliable, punctual and detail-oriented\nAble to work independently\nAvailable for part-time shifts"}
        />
        <ListField
          name="benefits"
          label="What we offer"
          defaultValue={job?.benefits}
          placeholder={"Flexible schedules\nCompetitive pay\nSupportive team"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={job?.status ?? "DRAFT"}
            className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          >
            {jobStatuses.map((s) => (
              <option key={s} value={s}>
                {s === "DRAFT"
                  ? "Draft (hidden from site)"
                  : s === "OPEN"
                    ? "Open (accepting applications)"
                    : "Closed (visible, applications disabled)"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="closesAt">
            Closing date (optional)
          </label>
          <input
            id="closesAt"
            name="closesAt"
            type="date"
            defaultValue={toDateInput(job?.closesAt)}
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
      >
        Save job posting
      </button>
    </form>
  );
}

function ListField({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={6}
        defaultValue={(defaultValue ?? []).join("\n")}
        placeholder={placeholder}
        className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
      />
      <p className="mt-1 text-xs text-navy-800/50">One item per line.</p>
    </div>
  );
}
