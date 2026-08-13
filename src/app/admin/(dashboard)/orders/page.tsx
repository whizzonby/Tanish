import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

const statusStyles: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  COD_PENDING: "bg-gold-100 text-gold-600",
  PENDING_PAYMENT: "bg-navy-800/5 text-navy-800/60",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
  REFUNDED: "bg-red-50 text-red-600",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-navy-950">Orders</h1>
      <p className="mt-1 text-sm text-navy-800/60">Store orders from checkout.</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-800/10 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-navy-800/10 text-left text-xs uppercase tracking-wide text-navy-800/50">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-navy-800/5 last:border-0">
                <td className="px-5 py-3 font-medium text-navy-950">
                  <Link href={`/admin/orders/${order.id}`} className="hover:text-gold-600">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-navy-800/70">
                  {order.customerName}
                  <br />
                  <span className="text-xs text-navy-800/50">{order.email}</span>
                </td>
                <td className="px-5 py-3 text-navy-800/70">{order.items.length}</td>
                <td className="px-5 py-3 font-semibold text-navy-950">{formatPrice(order.totalCents)}</td>
                <td className="px-5 py-3 text-navy-800/70">{order.paymentMethod}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusStyles[order.status] ?? "bg-navy-800/5 text-navy-800/60"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-navy-800/50">
                  {order.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-navy-800/50">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
