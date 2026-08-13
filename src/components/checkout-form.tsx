"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";

type PaymentMethod = "PAYPAL" | "WIPAY" | "COD";

export function CheckoutForm({
  paypalEnabled,
  wipayEnabled,
}: {
  paypalEnabled: boolean;
  wipayEnabled: boolean;
}) {
  const { items, totalCents, clear } = useCart();
  const hasPhysicalItems = items.some((i) => !i.isDigital);
  const defaultMethod: PaymentMethod = paypalEnabled ? "PAYPAL" : wipayEnabled ? "WIPAY" : "COD";
  const [method, setMethod] = useState<PaymentMethod>(defaultMethod);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-800/20 bg-white p-10 text-center text-navy-800/60">
        Your cart is empty.{" "}
        <Link href="/store" className="font-semibold text-gold-600 hover:underline">
          Go to the store
        </Link>
        .
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      customer: {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
      },
      shippingAddress: {
        line1: String(form.get("addressLine1") ?? ""),
        line2: String(form.get("addressLine2") ?? ""),
        city: String(form.get("city") ?? ""),
        region: String(form.get("region") ?? ""),
        postalCode: String(form.get("postalCode") ?? ""),
        country: String(form.get("country") ?? ""),
      },
      paymentMethod: method,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      clear();
      window.location.href = data.redirectUrl;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone" name="phone" type="tel" />
        </div>

        <div className="space-y-4 border-t border-navy-800/10 pt-6">
          <p className="text-sm font-semibold text-navy-900">
            {hasPhysicalItems ? "Shipping address" : "Address (optional)"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address line 1" name="addressLine1" required={hasPhysicalItems} />
            <Field label="Address line 2 (optional)" name="addressLine2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" name="city" required={hasPhysicalItems} />
            <Field label="Parish / Region" name="region" />
            <Field label="Postal code" name="postalCode" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Country" name="country" required={hasPhysicalItems} />
          </div>
        </div>

        <div className="space-y-3 border-t border-navy-800/10 pt-6">
          <p className="text-sm font-semibold text-navy-900">Payment method</p>
          {paypalEnabled && (
            <PaymentOption
              id="paypal"
              label="PayPal"
              description="Pay securely with your PayPal account or card."
              checked={method === "PAYPAL"}
              onChange={() => setMethod("PAYPAL")}
            />
          )}
          {wipayEnabled && (
            <PaymentOption
              id="wipay"
              label="WiPay"
              description="Caribbean card checkout (JMD/USD)."
              checked={method === "WIPAY"}
              onChange={() => setMethod("WIPAY")}
            />
          )}
          <PaymentOption
            id="cod"
            label="Cash on Delivery"
            description="Pay when your order arrives or is completed."
            checked={method === "COD"}
            onChange={() => setMethod("COD")}
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800 disabled:opacity-60"
        >
          {status === "loading" ? "Placing order…" : `Place order — ${formatPrice(totalCents)}`}
        </button>
        {status === "error" && error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      <div className="h-fit rounded-2xl border border-navy-800/10 bg-cream-100 p-6">
        <p className="font-serif text-lg font-semibold text-navy-950">Order summary</p>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.variantId} className="flex items-center gap-3 text-sm">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                {item.image && (
                  <Image src={item.image} alt={item.productName} fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-navy-950">{item.productName}</p>
                <p className="text-xs text-navy-800/60">
                  {item.variantLabel} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-navy-900">
                {formatPrice(item.priceCents * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-navy-800/10 pt-4 text-sm font-semibold text-navy-950">
          <div className="flex justify-between">
            <span>Total</span>
            <span className="text-gold-600">{formatPrice(totalCents)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
        checked ? "border-navy-900 bg-cream-100" : "border-navy-800/15"
      }`}
    >
      <input
        id={id}
        type="radio"
        name="paymentMethod"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4"
      />
      <span>
        <span className="block text-sm font-semibold text-navy-950">{label}</span>
        <span className="block text-xs text-navy-800/60">{description}</span>
      </span>
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
      />
    </div>
  );
}
