import type { Metadata } from "next";
import { isPayPalConfigured } from "@/lib/payments/paypal";
import { isWiPayConfigured } from "@/lib/payments/wipay";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-navy-950 sm:text-4xl">Checkout</h1>
      <div className="mt-10">
        <CheckoutForm paypalEnabled={isPayPalConfigured()} wipayEnabled={isWiPayConfigured()} />
      </div>
    </section>
  );
}
