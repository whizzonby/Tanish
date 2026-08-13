import { prisma } from "@/lib/prisma";
import { sendCampaign, updateSubscriber, deleteSubscriber } from "@/app/admin/actions/newsletter";
import { isMailtrapConfigured } from "@/lib/mailtrap";

const subscriberStatuses = ["SUBSCRIBED", "UNSUBSCRIBED", "PENDING_CONFIRMATION"] as const;

export default async function AdminNewsletterPage() {
  const [subscribers, campaigns] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: "desc" } }),
    prisma.newsletterCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const subscribedCount = subscribers.filter((s) => s.status === "SUBSCRIBED").length;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-navy-950">Newsletter</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        {subscribedCount} subscribed of {subscribers.length} total.
      </p>

      {!isMailtrapConfigured() && (
        <p className="mt-4 rounded-lg bg-gold-100 px-4 py-2.5 text-sm text-gold-600">
          Mailtrap isn&apos;t configured yet — campaigns and confirmation emails will
          log to the server console instead of actually sending. Add
          MAILTRAP_API_TOKEN and MAILTRAP_SENDER_EMAIL to enable real sending.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-navy-950">Compose a campaign</h2>
          <form action={sendCampaign} className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                required
                className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="bodyHtml">
                Body (HTML)
              </label>
              <textarea
                id="bodyHtml"
                name="bodyHtml"
                required
                rows={10}
                placeholder="<p>Hi there,</p><p>...</p>"
                className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 font-mono text-sm text-navy-900"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-navy-800"
            >
              Send to {subscribedCount} subscriber{subscribedCount === 1 ? "" : "s"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-navy-950">Past campaigns</h2>
          <div className="mt-4 space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-lg border border-navy-800/10 p-3 text-sm">
                <p className="font-medium text-navy-950">{c.subject}</p>
                <p className="text-xs text-navy-800/50">
                  {c.status} &middot; {c.recipientCount ?? 0} recipients
                  {c.sentAt && ` · ${c.sentAt.toLocaleDateString("en-US", { dateStyle: "medium" })}`}
                </p>
              </div>
            ))}
            {campaigns.length === 0 && (
              <p className="text-sm text-navy-800/50">No campaigns sent yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-800/10 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-navy-800/10 text-left text-xs uppercase tracking-wide text-navy-800/50">
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Subscribed</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id} className="border-b border-navy-800/5 last:border-0">
                <td colSpan={5} className="p-0">
                  <form
                    action={updateSubscriber}
                    className="grid grid-cols-[1fr_170px_120px_140px_auto] items-center gap-3 px-5 py-2.5"
                  >
                    <input type="hidden" name="id" value={sub.id} />
                    <input
                      name="email"
                      defaultValue={sub.email}
                      className="rounded-lg border border-navy-800/15 px-2.5 py-1.5 text-sm text-navy-950"
                    />
                    <select
                      name="status"
                      defaultValue={sub.status}
                      className="rounded-lg border border-navy-800/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-900"
                    >
                      {subscriberStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <span className="text-navy-800/70">{sub.source ?? "—"}</span>
                    <span className="text-xs text-navy-800/50">
                      {sub.subscribedAt.toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </span>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="submit"
                        className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-cream-50 hover:bg-navy-800"
                      >
                        Save
                      </button>
                      <button
                        type="submit"
                        formAction={deleteSubscriber}
                        className="text-xs font-semibold text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-navy-800/50">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
