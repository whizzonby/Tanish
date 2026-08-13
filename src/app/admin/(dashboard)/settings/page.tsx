import { getSiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "@/app/admin/actions/settings";

export default async function AdminSettingsPage(
  props: PageProps<"/admin/settings">
) {
  const settings = await getSiteSettings();
  const { saved } = await props.searchParams;

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold text-navy-950">Settings</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Contact info and social links shown across the site (header, footer, contact
        page, and quote/order confirmations).
      </p>

      {saved && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">
          Saved.
        </p>
      )}

      <form
        action={updateSiteSettings}
        className="mt-8 space-y-6 rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="email">
              Contact email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={settings.email}
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={settings.phone}
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={settings.location}
            className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
          />
        </div>

        <div className="grid gap-4 border-t border-navy-800/10 pt-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="instagram">
              Instagram URL
            </label>
            <input
              id="instagram"
              name="instagram"
              type="url"
              defaultValue={settings.instagram}
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="facebook">
              Facebook URL
            </label>
            <input
              id="facebook"
              name="facebook"
              type="url"
              defaultValue={settings.facebook}
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
