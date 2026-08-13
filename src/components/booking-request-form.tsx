"use client";

import { useState, type FormEvent } from "react";

export function BookingRequestForm({
  serviceId,
  serviceName,
}: {
  serviceId?: string;
  serviceName?: string;
} = {}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const payload = { ...Object.fromEntries(form.entries()), serviceId, serviceName };

    try {
      const res = await fetch("/api/bookings/request", {
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
          Request received
        </p>
        <p className="mt-2 text-sm text-navy-800/70">
          Thank you — Taniesha will follow up by email to confirm your session time.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-5 rounded-2xl border border-navy-800/10 bg-white p-8 shadow-sm sm:grid-cols-2"
    >
      {serviceName && (
        <p className="text-sm font-medium text-navy-900 sm:col-span-2">
          Requesting: {serviceName}
        </p>
      )}
      <Field label="Full name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" type="tel" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preferred date" name="preferredDate" type="date" />
        <Field label="Preferred time" name="preferredTime" type="time" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="message">
          What would you like to focus on?
        </label>
        <textarea
          id="message"
          name="message"
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
          {status === "loading" ? "Sending…" : "Request a session"}
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
