import type { Metadata } from "next";
import Link from "next/link";
import { CoachingApplicationForm } from "@/components/coaching-application-form";

export const metadata: Metadata = {
  title: "Business Coaching Application",
  description: "Apply to work with Taniesha Linton-Flemmings on your business goals.",
};

export default function CoachingApplicationPage() {
  return (
    <>
      <section className="overflow-hidden bg-navy-950 text-cream-50">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
          <Link href="/coaching" className="text-sm text-cream-100/60 hover:text-gold-400">
            &larr; Back to coaching
          </Link>
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
                Tell us where your business is—and where you want it to go.
              </h1>
            </div>
            <p className="max-w-md border-l border-gold-500/50 pl-5 text-sm leading-7 text-cream-100/75">
              This application helps Taniesha understand your business, current challenges, and
              the support you need before deciding whether the programme is the right fit.
            </p>
          </div>
        </div>
      </section>

      <main className="bg-cream-50">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
          <div className="mb-10 max-w-3xl text-sm leading-7 text-navy-800/70">
            <p>
              Please provide complete and accurate information. Completing this application does
              not guarantee acceptance into the coaching programme or approval for business funding.
              Every application is reviewed individually.
            </p>
          </div>
          <CoachingApplicationForm />
        </div>
      </main>
    </>
  );
}
