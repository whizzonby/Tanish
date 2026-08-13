import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteService } from "@/app/admin/actions/services";
import { formatPrice } from "@/lib/format";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy-950">Services</h1>
          <p className="mt-1 text-sm text-navy-800/60">
            Coaching packages and Caring Touch Reno services shown on the site.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-navy-800"
        >
          Add service
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-800/10 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-navy-800/10 text-left text-xs uppercase tracking-wide text-navy-800/50">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-navy-800/5 last:border-0">
                <td className="px-5 py-3 font-medium text-navy-950">{service.name}</td>
                <td className="px-5 py-3 text-navy-800/70">{service.category}</td>
                <td className="px-5 py-3 text-navy-800/70">
                  {service.requiresQuote || service.priceFromCents == null
                    ? "Quote on request"
                    : `From ${formatPrice(service.priceFromCents)}`}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      service.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-navy-800/5 text-navy-800/50"
                    }`}
                  >
                    {service.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/services/${service.id}`}
                      className="text-sm font-semibold text-gold-600 hover:text-gold-500"
                    >
                      Edit
                    </Link>
                    <form action={deleteService}>
                      <input type="hidden" name="id" value={service.id} />
                      <button
                        type="submit"
                        className="text-sm font-semibold text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-navy-800/50">
                  No services yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
