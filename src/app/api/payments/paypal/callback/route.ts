import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder } from "@/lib/payments/paypal";
import { markOrderPaid } from "@/lib/orders";
import { getSiteUrl } from "@/lib/site-url";

// PayPal redirects here after the customer approves (or cancels) on their
// site. `token` is the PayPal order ID we created at checkout time.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const siteUrl = getSiteUrl();

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=missing_token`);
  }

  const order = await prisma.order.findFirst({ where: { paymentRef: token } });
  if (!order) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=order_not_found`);
  }

  try {
    const result = await capturePayPalOrder(token);
    if (result.status === "COMPLETED") {
      const captureId =
        result.purchaseUnits?.[0]?.payments?.captures?.[0]?.id ?? token;
      await markOrderPaid(order.id, captureId);
      return NextResponse.redirect(`${siteUrl}/store/order/${order.orderNumber}?paid=1`);
    }
    return NextResponse.redirect(`${siteUrl}/store/order/${order.orderNumber}?pending=1`);
  } catch (err) {
    console.error("[paypal-callback] capture failed", err);
    return NextResponse.redirect(`${siteUrl}/store/order/${order.orderNumber}?pending=1`);
  }
}
