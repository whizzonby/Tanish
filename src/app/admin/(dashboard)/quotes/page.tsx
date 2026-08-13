import { prisma } from "@/lib/prisma";
import { updateQuoteStatus } from "@/app/admin/actions/quotes";
import type { QuoteStatus } from "@prisma/client";

const statuses: QuoteStatus[] = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"];

export default async function AdminQuotesPage() {
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-navy-950">Quote Requests</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Cleaning, construction, and renovation quote requests from the site.
      </p>

      <div className="mt-8 space-y-4">
        {quotes.map((quote) => (
          <div key={quote.id} className="rounded-2xl border border-navy-800/10 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-serif text-lg font-semibold text-navy-950">
                  {quote.customerName}
                  <span className="ml-2 text-xs font-normal uppercase tracking-wide text-gold-600">
                    {quote.category}
                  </span>
                </p>
                <p className="text-sm text-navy-800/60">
                  {quote.email} {quote.phone ? `· ${quote.phone}` : ""}
                </p>
                {quote.address && <p className="text-sm text-navy-800/60">{quote.address}</p>}
              </div>
              <form action={updateQuoteStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={quote.id} />
                <select
                  name="status"
                  defaultValue={quote.status}
                  className="rounded-lg border border-navy-800/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-cream-50 hover:bg-navy-800"
                >
                  Update
                </button>
              </form>
            </div>
            <p className="mt-3 text-sm text-navy-800/80">{quote.projectDescription}</p>
            {quote.budgetRange && (
              <p className="mt-2 text-xs text-navy-800/50">Budget: {quote.budgetRange}</p>
            )}
            <p className="mt-3 text-xs text-navy-800/40">
              {quote.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        ))}

        {quotes.length === 0 && (
          <p className="rounded-2xl border border-dashed border-navy-800/20 bg-white p-8 text-center text-navy-800/50">
            No quote requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
