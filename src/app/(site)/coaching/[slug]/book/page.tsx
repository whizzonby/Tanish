import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeAvailableSlots } from "@/lib/coaching-slots";
import { BookingRequestForm } from "@/components/booking-request-form";
import { CoachingBookingCalendar, type SlotOption } from "@/components/coaching-booking-calendar";

// Available slots are computed relative to wall-clock time, so this page needs
// to refresh periodically even without an explicit admin/booking action.
export const revalidate = 300;

export async function generateMetadata(
  props: PageProps<"/coaching/[slug]/book">
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return {};
  return { title: `Book — ${service.name}` };
}

export default async function CoachingBookingPage(props: PageProps<"/coaching/[slug]/book">) {
  const { slug } = await props.params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: { availabilityRules: true },
  });
  if (!service || service.category !== "COACHING" || !service.isActive) notFound();

  const activeRules = service.availabilityRules.filter((r) => r.isActive);
  const slotOptions: SlotOption[] = [];

  if (activeRules.length > 0) {
    const existingBookings = await prisma.booking.findMany({
      where: { serviceId: service.id, status: "CONFIRMED" },
      select: { startAt: true },
    });

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "America/Jamaica",
    });
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Jamaica",
    });

    const slots = computeAvailableSlots(activeRules, existingBookings);
    for (const slot of slots.slice(0, 80)) {
      slotOptions.push({
        serviceId: service.id,
        serviceName: service.name,
        startAtIso: slot.startAt.toISOString(),
        durationMin: slot.ruleDurationMin,
        dateLabel: dateFormatter.format(slot.startAt),
        timeLabel: timeFormatter.format(slot.startAt),
      });
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <Link
        href={`/coaching/${service.slug}`}
        className="text-sm text-navy-800/60 hover:text-navy-900"
      >
        &larr; Back to {service.name}
      </Link>

      <div className="mt-6 text-center">
        <h1 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
          Book {service.name}
        </h1>
        <p className="mt-4 text-navy-800/70">
          {slotOptions.length > 0
            ? "Pick an open time below and confirm your details."
            : "Real-time calendar booking is launching soon. For now, share a few preferred times below and Taniesha will confirm your session by email."}
        </p>
      </div>

      <div className="mt-10">
        {slotOptions.length > 0 ? (
          <CoachingBookingCalendar slots={slotOptions} />
        ) : (
          <BookingRequestForm serviceId={service.id} serviceName={service.name} />
        )}
      </div>
    </section>
  );
}
