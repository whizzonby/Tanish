import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Taniesha Linton Flemmings and Caring Touch Reno Construction Ltd.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
      <div className="text-center">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">Contact</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold text-navy-950 sm:text-5xl">
          Let&apos;s talk
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-navy-800/70">
          Coaching, cleaning, construction, decor, or press — reach out and we&apos;ll
          make sure it gets to the right place.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6 text-sm text-navy-800/80">
          <div>
            <p className="font-serif text-lg font-semibold text-navy-950">Email</p>
            <a href={`mailto:${settings.email}`} className="text-gold-600 hover:underline">
              {settings.email}
            </a>
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-navy-950">Phone</p>
            <a href={`tel:${settings.phone}`} className="text-gold-600 hover:underline">
              {settings.phone}
            </a>
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-navy-950">Based in</p>
            <p>{settings.location}</p>
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-navy-950">Looking for a quote?</p>
            <p>
              Visit{" "}
              <a href="/cleaning" className="text-gold-600 hover:underline">
                Cleaning
              </a>{" "}
              or{" "}
              <a href="/construction-renovation" className="text-gold-600 hover:underline">
                Construction &amp; Renovation
              </a>{" "}
              for a dedicated quote request form.
            </p>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
