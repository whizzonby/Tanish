"use client";

import { useState } from "react";

export type AvailabilityRow = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMin: number;
  isActive: boolean;
};

const days = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const durations = [30, 45, 60, 90, 120];

function emptyRow(): AvailabilityRow {
  return { dayOfWeek: 1, startTime: "10:00", endTime: "14:00", slotDurationMin: 60, isActive: true };
}

export function AvailabilityRulesEditor({ initialRules }: { initialRules: AvailabilityRow[] }) {
  const [rules, setRules] = useState<AvailabilityRow[]>(initialRules);

  function update(index: number, patch: Partial<AvailabilityRow>) {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRules((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRules((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input type="hidden" name="availabilityRulesJson" value={JSON.stringify(rules)} />
      <p className="mb-1 text-sm font-medium text-navy-900">Weekly availability</p>
      <p className="mb-3 text-xs text-navy-800/60">
        Choose the days and hours this service can be booked. Customers will see open time
        slots on the calendar based on this schedule.
      </p>
      {rules.length === 0 && (
        <p className="mb-3 rounded-lg bg-cream-100 px-3 py-2 text-xs text-navy-800/60">
          No availability set — this service will show a &quot;request a time&quot; form
          instead of a live calendar until you add at least one day below.
        </p>
      )}
      <div className="space-y-3">
        {rules.map((rule, i) => (
          <div
            key={i}
            className="grid grid-cols-2 items-center gap-3 rounded-lg border border-navy-800/10 p-3 sm:grid-cols-6"
          >
            <select
              value={rule.dayOfWeek}
              onChange={(e) => update(i, { dayOfWeek: Number(e.target.value) })}
              className="col-span-2 rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm sm:col-span-2"
            >
              {days.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={rule.startTime}
              onChange={(e) => update(i, { startTime: e.target.value })}
              className="rounded-lg border border-navy-800/15 px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={rule.endTime}
              onChange={(e) => update(i, { endTime: e.target.value })}
              className="rounded-lg border border-navy-800/15 px-3 py-2 text-sm"
            />
            <select
              value={rule.slotDurationMin}
              onChange={(e) => update(i, { slotDurationMin: Number(e.target.value) })}
              className="rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm"
            >
              {durations.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-xs text-navy-800">
                <input
                  type="checkbox"
                  checked={rule.isActive}
                  onChange={(e) => update(i, { isActive: e.target.checked })}
                  className="h-3.5 w-3.5"
                />
                Active
              </label>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-xs font-semibold text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-3 text-sm font-semibold text-gold-600 hover:text-gold-500"
      >
        + Add a day
      </button>
    </div>
  );
}
