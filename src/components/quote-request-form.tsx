"use client";

import { useState, type FormEvent } from "react";

export type QuoteServiceOption = {
  name: string;
  category: "cleaning" | "construction" | "renovation";
};

export function QuoteRequestForm({
  serviceOptions,
  defaultCategory,
  contactEmail,
}: {
  serviceOptions: QuoteServiceOption[];
  defaultCategory: "cleaning" | "construction" | "renovation";
  contactEmail: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [category, setCategory] = useState<string>(defaultCategory);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const payload = { ...Object.fromEntries(form.entries()), category };

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-navy-800/10 bg-white p-8 text-center shadow-sm">
        <p className="font-serif text-xl font-semibold text-navy-950">
          Quote request received
        </p>
        <p className="mt-2 text-sm text-navy-800/70">
          Thank you — the Caring Touch Reno team will follow up shortly. Feel free to
          email photos of the property to{" "}
          <a href={`mailto:${contactEmail}`} className="text-gold-600 underline">
            {contactEmail}
          </a>{" "}
          to help us scope the job.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-5 rounded-2xl border border-navy-800/10 bg-white p-8 shadow-sm sm:grid-cols-2"
    >
      <Field label="Full name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" type="tel" required />
      <Field label="Property address" name="address" />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="serviceType">
          Service needed
        </label>
        <select
          id="serviceType"
          name="serviceType"
          required
          defaultValue=""
          onChange={(e) => {
            const selected = serviceOptions.find((o) => o.name === e.target.value);
            setCategory(selected?.category ?? defaultCategory);
          }}
          className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        >
          <option value="">Select a service</option>
          {serviceOptions.map((option) => (
            <option key={option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <Field label="Budget range (optional)" name="budgetRange" placeholder="e.g. $1,000 - $3,000" />

      <div className="sm:col-span-2">
        <label
          className="mb-1.5 block text-sm font-medium text-navy-900"
          htmlFor="projectDescription"
        >
          Tell us about the job
        </label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          required
          rows={4}
          className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800 disabled:opacity-60 sm:w-auto"
        >
          {status === "loading" ? "Sending…" : "Request a quote"}
        </button>
        {status === "error" && (
          <p className="mt-2 text-xs text-red-500">Something went wrong — please try again.</p>
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
