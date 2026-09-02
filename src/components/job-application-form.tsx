"use client";

import { useState, type FormEvent } from "react";

export function JobApplicationForm({
  jobId,
  jobTitle,
  contactEmail,
}: {
  jobId: string;
  jobTitle: string;
  contactEmail: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    // React only guarantees currentTarget while the event handler is running.
    // Keep the form element itself before awaiting the request so the success
    // path can safely reset it afterward.
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    form.set("jobId", jobId);

    try {
      const res = await fetch("/api/careers/apply", { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(
          data?.error ??
            `Something went wrong (error ${res.status}) — please try again or email us.`
        );
        setStatus("error");
        return;
      }
      setStatus("done");
      formElement.reset();
    } catch {
      setMessage("Something went wrong — please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-navy-800/10 bg-white p-8 text-center shadow-sm">
        <p className="font-serif text-xl font-semibold text-navy-950">Application received</p>
        <p className="mt-2 text-sm text-navy-800/70">
          Thank you for applying for the <strong>{jobTitle}</strong> position. Our team will
          review your application and reach out if it&apos;s a match. Questions? Email{" "}
          <a href={`mailto:${contactEmail}`} className="text-gold-600 underline">
            {contactEmail}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-5 rounded-2xl border border-navy-800/10 bg-white p-8 shadow-sm sm:grid-cols-2"
    >
      <Field label="Full name" name="fullName" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone / WhatsApp" name="phone" type="tel" required />
      <Field label="Area you live in" name="location" placeholder="e.g. Kingston 6" />

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="availability">
          Availability
        </label>
        <input
          id="availability"
          name="availability"
          placeholder="e.g. Weekday mornings, weekends"
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="experience">
          Relevant experience (optional)
        </label>
        <textarea
          id="experience"
          name="experience"
          rows={3}
          placeholder="Tell us about any cleaning or related work you've done. Not required."
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="coverLetter">
          Why do you want to join the team? (optional)
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          rows={4}
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="resume">
          Résumé / CV (optional — PDF or Word, max 5MB)
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="block w-full text-sm text-navy-800/70 file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream-50"
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800 disabled:opacity-60 sm:w-auto"
        >
          {status === "loading" ? "Submitting…" : "Submit application"}
        </button>
        {status === "error" && message && (
          <p className="mt-2 text-xs text-red-500">{message}</p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
      />
    </div>
  );
}
