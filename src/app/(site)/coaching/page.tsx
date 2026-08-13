import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { computeAvailableSlots } from "@/lib/coaching-slots";
import { BookingRequestForm } from "@/components/booking-request-form";
import { CoachingBookingCalendar, type SlotOption } from "@/components/coaching-booking-calendar";

export const metadata: Metadata = {
  title: "Life Coaching",
  description:
    "One-on-one and group life coaching with Taniesha Linton Flemmings. Book a session.",
};

// Available slots are computed relative to wall-clock time, so this page needs
// to refresh periodically even without an explicit admin/booking action.
export const revalidate = 300;

const introDefaults = {
  title: "Clear your mind. Choose your next move.",
  body: "Coaching with Taniesha starts with the same idea behind everything she builds: clarity comes from clearing what's in the way. Sessions are practical, honest, and built around where you actually are — not a one-size-fits-all script.",
  imageUrl: "/images/portrait-2.jpg",
};

export default async function CoachingPage() {
  const [block, coachingServices] = await Promise.all([
    prisma.contentBlock.findUnique({ where: { key: "coaching_intro" } }),
    prisma.service.findMany({
      where: { category: "COACHING", isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { availabilityRules: true },
    }),
  ]);

  const intro = {
    title: block?.title || introDefaults.title,
    body: block?.body || introDefaults.body,
    imageUrl: block?.imageUrl || introDefaults.imageUrl,
  };

  const serviceIds = coachingServices.map((s) => s.id);
  const hasAvailability = coachingServices.some((s) => s.availabilityRules.length > 0);

  const slotOptions: SlotOption[] = [];
  if (hasAvailability) {
    const existingBookings = await prisma.booking.findMany({
      where: { serviceId: { in: serviceIds }, status: "CONFIRMED" },
      select: { serviceId: true, startAt: true },
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

    for (const service of coachingServices) {
      const bookingsForService = existingBookings.filter((b) => b.serviceId === service.id);
      const slots = computeAvailableSlots(service.availabilityRules, bookingsForService);
      for (const slot of slots.slice(0, 40)) {
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
    slotOptions.sort((a, b) => a.startAtIso.localeCompare(b.startAtIso));
  }

  return (
    <>
      <section className="bg-navy-950 text-cream-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-400">
              Life Coaching
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              {intro.title}
            </h1>
            <p className="mt-6 max-w-lg text-cream-100/80">{intro.body}</p>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-950/40">
            <Image
              src={intro.imageUrl}
              alt="Taniesha Linton Flemmings coaching"
              fill
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
            Coaching packages
          </h2>
        </div>
        {coachingServices.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coachingServices.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm"
              >
                <h3 className="font-serif text-lg font-semibold text-navy-950">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-navy-800/70">{service.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {service.requiresQuote || service.priceFromCents == null
                    ? "Contact for pricing"
                    : `From ${formatPrice(service.priceFromCents)}`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-navy-800/20 bg-cream-100 p-10 text-center text-sm text-navy-800/60">
            Coaching packages will be managed from the admin dashboard — check back
            soon, or reach out below to ask about availability now.
          </div>
        )}
      </section>

      {/* Booking */}
      <section id="book" className="scroll-mt-24 bg-cream-200/60">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">
              Book a session
            </h2>
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
              <BookingRequestForm />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
