"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const isDark = variant === "dark";

  if (status === "done") {
    return (
      <p className={isDark ? "text-sm text-gold-300" : "text-sm text-navy-700"}>
        You&apos;re on the list — welcome! Watch your inbox for updates.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={
          isDark
            ? "w-full rounded-full border border-cream-100/25 bg-navy-800 px-4 py-2.5 text-sm text-cream-50 placeholder:text-cream-100/50 focus:border-gold-400 focus:outline-none"
            : "w-full rounded-full border border-navy-800/20 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/40 focus:border-gold-500 focus:outline-none"
        }
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={
          isDark
            ? "shrink-0 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
            : "shrink-0 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800 disabled:opacity-60"
        }
      >
        {status === "loading" ? "Joining…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-500 sm:absolute">Something went wrong — please try again.</p>
      )}
    </form>
  );
}
