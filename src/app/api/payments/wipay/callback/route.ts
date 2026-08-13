import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWiPayHash } from "@/lib/payments/wipay";
import { markOrderPaid } from "@/lib/orders";
import { getSiteUrl } from "@/lib/site-url";

// WiPay GET-redirects here with the payment result as querystring params.
// See src/lib/payments/wipay.ts for the source doc reference.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteUrl = getSiteUrl();

  const status = searchParams.get("status");
  const orderId = searchParams.get("order_id");
  const transactionId = searchParams.get("transaction_id");
  const total = searchParams.get("total");
  const hash = searchParams.get("hash");

  if (!orderId) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=missing_order`);
  }

  const order = await prisma.order.findUnique({ where: { orderNumber: orderId } });
  if (!order) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=order_not_found`);
  }

  if (status === "success" && transactionId && total && hash) {
    const validHash = verifyWiPayHash({ transactionId, total, hash });
    if (!validHash) {
      console.error("[wipay-callback] hash verification failed for order", orderId);
      return NextResponse.redirect(`${siteUrl}/store/order/${order.orderNumber}?pending=1`);
    }
    await markOrderPaid(order.id, transactionId);
    return NextResponse.redirect(`${siteUrl}/store/order/${order.orderNumber}?paid=1`);
  }

  await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  return NextResponse.redirect(`${siteUrl}/store/order/${order.orderNumber}?failed=1`);
}
