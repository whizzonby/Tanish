import type { AvailabilityRule, Booking } from "@prisma/client";

export type Slot = { startAt: Date; endAt: Date; ruleDurationMin: number };

// Jamaica does not observe DST — it's fixed at UTC-5 year-round, so a hardcoded
// offset is safe here (unlike most timezones).
const JAMAICA_OFFSET = "-05:00";

export function computeAvailableSlots(
  rules: AvailabilityRule[],
  existingBookings: Pick<Booking, "startAt">[],
  { days = 56, minLeadHours = 12 }: { days?: number; minLeadHours?: number } = {}
): Slot[] {
  const bookedTimes = new Set(existingBookings.map((b) => b.startAt.getTime()));
  const now = new Date();
  const earliestAllowed = new Date(now.getTime() + minLeadHours * 60 * 60 * 1000);
  const activeRules = rules.filter((r) => r.isActive);

  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = new Date(`${dateStr}T12:00:00${JAMAICA_OFFSET}`).getUTCDay();

    for (const rule of activeRules.filter((r) => r.dayOfWeek === dayOfWeek)) {
      let cursor = new Date(`${dateStr}T${rule.startTime}:00${JAMAICA_OFFSET}`);
      const end = new Date(`${dateStr}T${rule.endTime}:00${JAMAICA_OFFSET}`);

      while (cursor.getTime() + rule.slotDurationMin * 60000 <= end.getTime()) {
        const slotEnd = new Date(cursor.getTime() + rule.slotDurationMin * 60000);
        if (cursor >= earliestAllowed && !bookedTimes.has(cursor.getTime())) {
          slots.push({ startAt: new Date(cursor), endAt: slotEnd, ruleDurationMin: rule.slotDurationMin });
        }
        cursor = slotEnd;
      }
    }
  }

  slots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  return slots;
}
