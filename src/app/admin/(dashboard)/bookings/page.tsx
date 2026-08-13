import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  createAvailabilityRule,
  deleteAvailabilityRule,
  updateBookingStatus,
} from "@/app/admin/actions/bookings";
import type { BookingStatus } from "@prisma/client";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const bookingStatuses: BookingStatus[] = ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export default async function AdminBookingsPage() {
  const [coachingServices, rules, bookings] = await Promise.all([
    prisma.service.findMany({ where: { category: "COACHING" }, orderBy: { name: "asc" } }),
    prisma.availabilityRule.findMany({
      include: { service: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.booking.findMany({
      include: { service: true },
      orderBy: { startAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-navy-950">Coaching Bookings</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Set weekly availability so clients can book coaching sessions in real time.
      </p>

      {coachingServices.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-800/20 bg-white p-8 text-center text-navy-800/60">
          You need at least one coaching service before you can set availability.{" "}
          <Link href="/admin/services/new" className="font-semibold text-gold-600 hover:underline">
            Add a coaching service
          </Link>
          .
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-navy-950">Add availability</h2>
            <form action={createAvailabilityRule} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="serviceId">
                  Coaching service
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  required
                  className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900"
                >
                  {coachingServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="dayOfWeek">
                  Day of week
                </label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  required
                  className="w-full rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 text-sm text-navy-900"
                >
                  {dayNames.map((day, i) => (
                    <option key={day} value={i}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="startTime">
                    Start time
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    required
                    defaultValue="09:00"
                    className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="endTime">
                    End time
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    required
                    defaultValue="17:00"
                    className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="slotDurationMin">
                  Session length (minutes)
                </label>
                <input
                  id="slotDurationMin"
                  name="slotDurationMin"
                  type="number"
                  min="15"
                  step="15"
                  defaultValue={60}
                  className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-cream-50 hover:bg-navy-800"
              >
                Add availability
              </button>
            </form>

            <div className="mt-6 space-y-2 border-t border-navy-800/10 pt-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg bg-cream-100 px-4 py-2.5 text-sm"
                >
                  <span>
                    <strong>{dayNames[rule.dayOfWeek]}</strong> {rule.startTime}–{rule.endTime} ·{" "}
                    {rule.service.name} · {rule.slotDurationMin}min slots
                  </span>
                  <form action={deleteAvailabilityRule}>
                    <input type="hidden" name="id" value={rule.id} />
                    <button type="submit" className="text-xs font-semibold text-red-500 hover:text-red-600">
                      Remove
                    </button>
                  </form>
                </div>
              ))}
              {rules.length === 0 && (
                <p className="text-sm text-navy-800/50">No availability set yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-navy-950">Bookings</h2>
            <div className="mt-4 space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-navy-800/10 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy-950">{booking.customerName}</p>
                      <p className="text-navy-800/60">{booking.customerEmail}</p>
                      <p className="mt-1 text-navy-800/70">
                        {booking.service.name} —{" "}
                        {booking.startAt.toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <form action={updateBookingStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={booking.id} />
                      <select
                        name="status"
                        defaultValue={booking.status}
                        className="rounded-lg border border-navy-800/15 bg-white px-2 py-1 text-xs font-semibold text-navy-900"
                      >
                        {bookingStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg bg-navy-900 px-2.5 py-1 text-xs font-semibold text-cream-50 hover:bg-navy-800"
                      >
                        Update
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="text-sm text-navy-800/50">No bookings yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
