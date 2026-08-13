import Image from "next/image";
import Link from "next/link";
import { primaryNav, siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-settings";
import { NewsletterForm } from "@/components/newsletter-form";

export async function SiteFooter() {
  const settings = await getSiteSettings();

  return (
    <footer className="bg-navy-950 text-cream-100">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.jpg"
                alt={siteConfig.brandName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-serif text-lg font-semibold">{siteConfig.personalName}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-cream-100/70">
              {siteConfig.tagline}
            </p>
          </div>

          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold-400">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream-100/80">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-gold-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold-400">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream-100/80">
              <li>{settings.location}</li>
              <li>
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-gold-300">
                  {settings.email}
                </a>
              </li>
              <li>
                <a href={`tel:${settings.phone}`} className="transition-colors hover:text-gold-300">
                  {settings.phone}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream-100/70 transition-colors hover:text-gold-300"
                >
                  Instagram
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream-100/70 transition-colors hover:text-gold-300"
                >
                  Facebook
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold-400">
              Stay in the Loop
            </h3>
            <p className="mt-4 text-sm text-cream-100/70">
              Coaching tips, new blog posts, and store drops — straight to your inbox.
            </p>
            <div className="mt-4">
              <NewsletterForm variant="dark" />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream-100/10 pt-8 text-xs text-cream-100/50 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.
          </p>
          <p>{siteConfig.domain}</p>
        </div>
      </div>
    </footer>
  );
}
