import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Order Confirmation" };

const statusMessages: Record<string, { title: string; body: string }> = {
  PAID: {
    title: "Payment received — thank you!",
    body: "Your order is confirmed. A confirmation email is on its way.",
  },
  COD_PENDING: {
    title: "Order placed — thank you!",
    body: "We'll be in touch to arrange payment on delivery or pickup.",
  },
  PENDING_PAYMENT: {
    title: "Almost there",
    body: "We're waiting to confirm your payment. This can take a moment — refresh shortly, or contact us if it doesn't update.",
  },
  CANCELLED: {
    title: "Payment didn't go through",
    body: "This order was cancelled. Please return to the store and try again, or reach out if you need help.",
  },
};

export default async function OrderConfirmationPage(
  props: PageProps<"/store/order/[orderNumber]">
) {
  const { orderNumber } = await props.params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  const message = statusMessages[order.status] ?? statusMessages.PENDING_PAYMENT;

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 lg:px-8">
      <div className="rounded-2xl border border-navy-800/10 bg-white p-8 shadow-sm">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">
          Order {order.orderNumber}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-950">{message.title}</h1>
        <p className="mt-3 text-navy-800/70">{message.body}</p>

        <div className="mt-8 divide-y divide-navy-800/10 border-t border-navy-800/10">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-navy-900">
                {item.nameSnapshot} × {item.quantity}
              </span>
              <span className="font-semibold text-navy-950">
                {formatPrice(item.priceSnapshot * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-navy-800/10 pt-4 text-base font-semibold text-navy-950">
          <span>Total</span>
          <span className="text-gold-600">{formatPrice(order.totalCents)}</span>
        </div>

        <Link
          href="/store"
          className="mt-8 inline-flex items-center rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-navy-800"
        >
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
