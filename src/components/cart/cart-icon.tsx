"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";

export function CartIcon({ onClick }: { onClick?: () => void }) {
  const { totalCount } = useCart();

  return (
    <Link
      href="/cart"
      onClick={onClick}
      aria-label="View cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-navy-800/15 text-navy-900 transition-colors hover:border-gold-400"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6">
        <path
          d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="21" r="1.4" />
        <circle cx="18" cy="21" r="1.4" />
      </svg>
      {totalCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-navy-950">
          {totalCount}
        </span>
      )}
    </Link>
  );
}
