"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { primaryNav, siteConfig } from "@/lib/site-config";
import { CartIcon } from "@/components/cart/cart-icon";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-800/10 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo.jpg"
            alt={siteConfig.brandName}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
            priority
          />
          <span className="hidden font-serif text-lg font-semibold tracking-tight text-navy-900 sm:block">
            {siteConfig.personalName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {primaryNav.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative">
                <button className="flex items-center gap-1 text-sm font-medium text-navy-800 transition-colors hover:text-gold-600">
                  {item.label}
                  <svg
                    aria-hidden
                    viewBox="0 0 12 12"
                    className="h-3 w-3 fill-current"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="rounded-xl border border-navy-800/10 bg-white p-2 shadow-xl shadow-navy-950/10">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-lg px-4 py-3 transition-colors hover:bg-cream-100"
                      >
                        <span className="block text-sm font-semibold text-navy-900">
                          {child.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-navy-700/70">
                          {child.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-navy-800 transition-colors hover:text-gold-600"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <CartIcon />
          <Link
            href="/coaching#book"
            className="inline-flex items-center rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
          >
            Book a Session
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartIcon />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-800/15"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-navy-900" strokeWidth="1.6">
              {open ? (
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-navy-800/10 bg-cream-50 px-6 pb-6 lg:hidden">
          <nav className="flex flex-col gap-1 pt-4">
            {primaryNav.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-base font-medium text-navy-900"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 flex flex-col border-l border-navy-800/10 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="py-2 text-sm text-navy-700"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/coaching#book"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-cream-50"
            >
              Book a Session
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
