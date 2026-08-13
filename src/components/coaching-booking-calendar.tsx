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

function dateKey(iso: string) {
  // America/Jamaica has no DST (fixed UTC-5), so a straight UTC-5 shift is safe.
  const d = new Date(new Date(iso).getTime() - 5 * 60 * 60 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function monthKey(key: string) {
  return key.slice(0, 7);
}

export function CoachingBookingCalendar({ slots }: { slots: SlotOption[] }) {
  const [availableSlots, setAvailableSlots] = useState(slots);
  const [selected, setSelected] = useState<SlotOption | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, SlotOption[]>();
    for (const slot of availableSlots) {
      const key = dateKey(slot.startAtIso);
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    }
    return map;
  }, [availableSlots]);

  const months = useMemo(() => {
    const keys = Array.from(new Set(Array.from(slotsByDay.keys()).map(monthKey))).sort();
    return keys.slice(0, 2);
  }, [slotsByDay]);

  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const activeMonth = months[activeMonthIndex] ?? months[0];

  const calendarWeeks = useMemo(() => {
    if (!activeMonth) return [];
    const [year, month] = activeMonth.split("-").map(Number);
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const startWeekday = firstOfMonth.getUTCDay();

    const cells: (string | null)[] = Array(startWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(`${activeMonth}-${String(day).padStart(2, "0")}`);
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [activeMonth]);

  const monthLabel = activeMonth
    ? new Date(`${activeMonth}-01T12:00:00Z`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

  const daySlots = selectedDay ? (slotsByDay.get(selectedDay) ?? []) : [];

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
      <div className="flex items-center justify-between">
        <p className="font-serif text-lg font-semibold text-navy-950">{monthLabel}</p>
        {months.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={activeMonthIndex === 0}
              onClick={() => setActiveMonthIndex((i) => Math.max(0, i - 1))}
              className="rounded-full border border-navy-800/15 px-3 py-1 text-xs font-medium text-navy-800 disabled:opacity-30"
            >
              &larr;
            </button>
            <button
              type="button"
              disabled={activeMonthIndex === months.length - 1}
              onClick={() => setActiveMonthIndex((i) => Math.min(months.length - 1, i + 1))}
              className="rounded-full border border-navy-800/15 px-3 py-1 text-xs font-medium text-navy-800 disabled:opacity-30"
            >
              &rarr;
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-navy-800/50">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {calendarWeeks.flat().map((day, i) => {
          if (!day) return <div key={i} />;
          const has = slotsByDay.has(day);
          const dayNum = Number(day.slice(-2));
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              disabled={!has}
              onClick={() => {
                setSelectedDay(day);
                setSelected(null);
                setStatus("idle");
                setError(null);
              }}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-navy-900 text-cream-50"
                  : has
                    ? "bg-cream-100 text-navy-900 hover:bg-gold-100"
                    : "text-navy-800/25"
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="mt-6 border-t border-navy-800/10 pt-6">
          <p className="mb-2 text-sm font-semibold text-navy-950">
            Available times —{" "}
            {new Date(`${selectedDay}T12:00:00Z`).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </p>
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
      )}

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
