import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/order-number";
import { decrementStockForOrder, sendOrderConfirmation } from "@/lib/orders";
import { isPayPalConfigured, createPayPalOrder } from "@/lib/payments/paypal";
import { isWiPayConfigured, createWiPayCheckout } from "@/lib/payments/wipay";

type CheckoutBody = {
  items: { variantId: string; quantity: number }[];
  customer: { name: string; email: string; phone?: string };
  shippingAddress?: Record<string, string>;
  paymentMethod: "PAYPAL" | "WIPAY" | "COD";
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutBody | null;

  if (!body?.items?.length || !body.customer?.name || !body.customer?.email || !body.paymentMethod) {
    return NextResponse.json({ error: "Missing required checkout fields" }, { status: 400 });
  }

  if (body.paymentMethod === "PAYPAL" && !isPayPalConfigured()) {
    return NextResponse.json({ error: "PayPal isn't available right now" }, { status: 400 });
  }
  if (body.paymentMethod === "WIPAY" && !isWiPayConfigured()) {
    return NextResponse.json({ error: "WiPay isn't available right now" }, { status: 400 });
  }

  const variantIds = body.items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  if (variants.length !== new Set(variantIds).size) {
    return NextResponse.json({ error: "One or more items are no longer available" }, { status: 400 });
  }

  let subtotalCents = 0;
  const orderItemsData: {
    variantId: string;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    isDigital: boolean;
  }[] = [];

  for (const line of body.items) {
    const variant = variants.find((v) => v.id === line.variantId);
    if (!variant || !variant.product.isActive || variant.product.comingSoon) {
      return NextResponse.json({ error: "One or more items are no longer available" }, { status: 400 });
    }
    if (line.quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }
    if (!variant.isDigital && variant.stock !== null && variant.stock < line.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for ${variant.product.name} (${variant.label})` },
        { status: 400 }
      );
    }
    subtotalCents += variant.priceCents * line.quantity;
    orderItemsData.push({
      variantId: variant.id,
      nameSnapshot: `${variant.product.name} — ${variant.label}`,
      priceSnapshot: variant.priceCents,
      quantity: line.quantity,
      isDigital: variant.isDigital,
    });
  }

  // TODO: replace with real shipping-rate logic once Taniesha decides on
  // domestic/international rates for physical decor items.
  const shippingCents = 0;
  const totalCents = subtotalCents + shippingCents;

  const orderNumber = generateOrderNumber();
  const isCod = body.paymentMethod === "COD";

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: body.customer.name,
      email: body.customer.email,
      phone: body.customer.phone || null,
      shippingAddress: body.shippingAddress ?? undefined,
      status: isCod ? "COD_PENDING" : "PENDING_PAYMENT",
      paymentMethod: body.paymentMethod,
      subtotalCents,
      shippingCents,
      totalCents,
      items: { create: orderItemsData },
    },
  });

  if (isCod) {
    await decrementStockForOrder(order.id);
    await sendOrderConfirmation(order.id);
    return NextResponse.json({ redirectUrl: `/store/order/${order.orderNumber}` });
  }

  try {
    if (body.paymentMethod === "PAYPAL") {
      const { approveUrl, paypalOrderId } = await createPayPalOrder({
        orderNumber: order.orderNumber,
        totalCents: order.totalCents,
      });
      await prisma.order.update({ where: { id: order.id }, data: { paymentRef: paypalOrderId } });
      return NextResponse.json({ redirectUrl: approveUrl });
    }

    if (body.paymentMethod === "WIPAY") {
      const { url, transactionId } = await createWiPayCheckout({
        orderNumber: order.orderNumber,
        totalCents: order.totalCents,
        customerEmail: order.email,
        customerName: order.customerName,
      });
      await prisma.order.update({ where: { id: order.id }, data: { paymentRef: transactionId } });
      return NextResponse.json({ redirectUrl: url });
    }
  } catch (err) {
    console.error("[checkout] payment initiation failed", err);
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ error: "Could not start payment — please try again" }, { status: 502 });
  }

  return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
}
