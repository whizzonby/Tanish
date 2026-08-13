import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { updateOrderStatus } from "@/app/admin/actions/orders";
import type { OrderStatus } from "@prisma/client";

const allStatuses: OrderStatus[] = [
  "PENDING_PAYMENT",
  "COD_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default async function AdminOrderDetailPage(
  props: PageProps<"/admin/orders/[id]">
) {
  const { id } = await props.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const shipping = order.shippingAddress as Record<string, string> | null;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy-950">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-navy-800/60">
            Placed {order.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <form action={updateOrderStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={order.id} />
          <select
            name="status"
            defaultValue={order.status}
            className="rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm font-semibold text-navy-900"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-navy-800"
          >
            Update
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-navy-800/10 bg-white p-5">
          <p className="font-serif text-sm font-semibold text-navy-950">Customer</p>
          <p className="mt-2 text-sm text-navy-800/70">{order.customerName}</p>
          <p className="text-sm text-navy-800/70">{order.email}</p>
          {order.phone && <p className="text-sm text-navy-800/70">{order.phone}</p>}
        </div>
        <div className="rounded-2xl border border-navy-800/10 bg-white p-5">
          <p className="font-serif text-sm font-semibold text-navy-950">Payment</p>
          <p className="mt-2 text-sm text-navy-800/70">Method: {order.paymentMethod}</p>
          <p className="text-sm text-navy-800/70">Reference: {order.paymentRef ?? "—"}</p>
          <p className="text-sm text-navy-800/70">Currency: {order.currency}</p>
        </div>
        {shipping && (
          <div className="rounded-2xl border border-navy-800/10 bg-white p-5 sm:col-span-2">
            <p className="font-serif text-sm font-semibold text-navy-950">Shipping address</p>
            <p className="mt-2 text-sm text-navy-800/70">
              {[
                shipping.line1,
                shipping.line2,
                shipping.city,
                shipping.region,
                shipping.postalCode,
                shipping.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-navy-800/10 bg-white p-5">
        <p className="font-serif text-sm font-semibold text-navy-950">Items</p>
        <div className="mt-3 divide-y divide-navy-800/10">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2.5 text-sm">
              <span className="text-navy-900">
                {item.nameSnapshot} × {item.quantity}
              </span>
              <span className="font-semibold text-navy-950">
                {formatPrice(item.priceSnapshot * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-navy-800/10 pt-3 text-sm">
          <div className="flex justify-between text-navy-800/70">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-navy-800/70">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between font-semibold text-navy-950">
            <span>Total</span>
            <span className="text-gold-600">{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
