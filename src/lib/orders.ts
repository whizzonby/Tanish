import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/mailtrap";
import { orderConfirmationEmail } from "@/lib/email-templates";

// Stock is only decremented once an order is a firm commitment (COD) or
// payment has actually been confirmed (PayPal capture / WiPay verified
// callback) — not at PENDING_PAYMENT creation, so abandoned online-payment
// attempts don't hold inventory hostage.
export async function decrementStockForOrder(orderId: string) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: { variant: true },
  });

  for (const item of items) {
    if (item.variant.stock === null) continue; // unlimited/digital
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: Math.max(0, item.variant.stock - item.quantity) },
    });
  }
}

export async function sendOrderConfirmation(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: true } } },
  });
  if (!order) return;

  const { subject, html } = orderConfirmationEmail({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    totalCents: order.totalCents,
    paymentMethod: order.paymentMethod,
    items: order.items.map((item) => ({
      nameSnapshot: item.nameSnapshot,
      priceSnapshot: item.priceSnapshot,
      quantity: item.quantity,
      isDigital: item.isDigital,
      downloadUrl: item.variant.downloadUrl,
    })),
  });

  await sendTransactionalEmail({ to: order.email, subject, html });
}

export async function markOrderPaid(orderId: string, paymentRef: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", paymentRef },
  });
  await decrementStockForOrder(orderId);
  await sendOrderConfirmation(orderId);
}
