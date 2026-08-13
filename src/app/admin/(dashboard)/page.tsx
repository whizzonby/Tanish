import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [newQuotes, upcomingBookings, subscribers, activeServices] = await Promise.all([
    prisma.quoteRequest.count({ where: { status: "NEW" } }),
    prisma.booking.count({ where: { status: "CONFIRMED", startAt: { gte: new Date() } } }),
    prisma.newsletterSubscriber.count({ where: { status: "SUBSCRIBED" } }),
    prisma.service.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: "New quote requests", value: newQuotes, href: "/admin/quotes" },
    { label: "Upcoming coaching bookings", value: upcomingBookings, href: "/admin/bookings" },
    { label: "Newsletter subscribers", value: subscribers, href: "/admin/newsletter" },
    { label: "Active services", value: activeServices, href: "/admin/services" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-navy-950">Dashboard</h1>
      <p className="mt-1 text-sm text-navy-800/60">A quick look at what needs attention.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-navy-800/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-semibold text-navy-950">{stat.value}</p>
            <p className="mt-1 text-sm text-navy-800/60">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-navy-800/10 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-navy-950">Getting started</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-navy-800/70">
          <li>Edit homepage, about, and sub-brand copy under <strong>Content</strong>.</li>
          <li>Add coaching packages and cleaning/construction services under <strong>Services</strong>.</li>
          <li>Set weekly coaching availability under <strong>Coaching Bookings</strong> so clients can book instantly.</li>
          <li>Follow up on incoming <strong>Quote Requests</strong> from the cleaning and construction pages.</li>
        </ul>
      </div>
    </div>
  );
}
