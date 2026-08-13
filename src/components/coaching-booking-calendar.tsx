"use client";

import { useMemo, useState } from "react";
import { createBooking } from "@/app/(site)/coaching/actions";

export type SlotOption = {
  serviceId: string;
  serviceName: string;
  startAtIso: string;
  durationMin: number;
  dateLabel: string;
  timeLabel: string;
};

export function CoachingBookingCalendar({ slots }: { slots: SlotOption[] }) {
  const [availableSlots, setAvailableSlots] = useState(slots);
  const [selected, setSelected] = useState<SlotOption | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, SlotOption[]>();
    for (const slot of availableSlots) {
      const list = map.get(slot.dateLabel) ?? [];
      list.push(slot);
      map.set(slot.dateLabel, list);
    }
    return Array.from(map.entries());
  }, [availableSlots]);

  const visibleDays = grouped.slice(0, 10);

  async function onConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    setStatus("loading");
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await createBooking({
      serviceId: selected.serviceId,
      startAtIso: selected.startAtIso,
      durationMin: selected.durationMin,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      notes: String(form.get("notes") ?? ""),
    });

    if (result.ok) {
      setStatus("done");
      setAvailableSlots((prev) => prev.filter((s) => s.startAtIso !== selected.startAtIso));
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  if (status === "done" && selected) {
    return (
      <div className="rounded-2xl border border-navy-800/10 bg-white p-8 text-center shadow-sm">
        <p className="font-serif text-xl font-semibold text-navy-950">Session booked</p>
        <p className="mt-2 text-sm text-navy-800/70">
          You&apos;re confirmed for {selected.dateLabel} at {selected.timeLabel}. A
          confirmation email is on its way.
        </p>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-800/20 bg-white p-8 text-center text-navy-800/60">
        No open times in the next few weeks — please check back soon.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {visibleDays.map(([dateLabel, daySlots]) => (
          <div key={dateLabel}>
            <p className="mb-2 text-sm font-semibold text-navy-950">{dateLabel}</p>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((slot) => (
                <button
                  key={slot.startAtIso}
                  type="button"
                  onClick={() => {
                    setSelected(slot);
                    setStatus("idle");
                    setError(null);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected?.startAtIso === slot.startAtIso
                      ? "border-navy-900 bg-navy-900 text-cream-50"
                      : "border-navy-800/20 text-navy-800 hover:border-navy-800/40"
                  }`}
                >
                  {slot.timeLabel}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <form
          onSubmit={onConfirm}
          className="mt-8 grid gap-4 border-t border-navy-800/10 pt-6 sm:grid-cols-2"
        >
          <p className="text-sm font-medium text-navy-900 sm:col-span-2">
            Confirming {selected.serviceName} — {selected.dateLabel} at {selected.timeLabel}
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="booking-name">
              Full name
            </label>
            <input
              id="booking-name"
              name="name"
              required
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="booking-email">
              Email
            </label>
            <input
              id="booking-email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="booking-phone">
              Phone (optional)
            </label>
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="booking-notes">
              What would you like to focus on? (optional)
            </label>
            <textarea
              id="booking-notes"
              name="notes"
              rows={3}
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800 disabled:opacity-60 sm:w-auto"
            >
              {status === "loading" ? "Booking…" : "Confirm booking"}
            </button>
            {status === "error" && error && (
              <p className="mt-2 text-xs text-red-500">{error}</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
