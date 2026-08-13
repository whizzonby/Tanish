import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrdersController,
  PaypalExperienceUserAction,
} from "@paypal/paypal-server-sdk";
import { getSiteUrl } from "@/lib/site-url";

export function isPayPalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function getClient() {
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    environment: process.env.PAYPAL_ENV === "live" ? Environment.Production : Environment.Sandbox,
  });
}

// Redirect-based flow (no PayPal JS SDK / buttons): create the order, send the
// customer to the returned approval link, then capture on our own return_url.
export async function createPayPalOrder(order: {
  orderNumber: string;
  totalCents: number;
}): Promise<{ approveUrl: string; paypalOrderId: string }> {
  const ordersController = new OrdersController(getClient());

  const { result } = await ordersController.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          referenceId: order.orderNumber,
          customId: order.orderNumber,
          amount: {
            currencyCode: "USD",
            value: (order.totalCents / 100).toFixed(2),
          },
        },
      ],
      paymentSource: {
        paypal: {
          experienceContext: {
            returnUrl: `${getSiteUrl()}/api/payments/paypal/callback`,
            cancelUrl: `${getSiteUrl()}/checkout?cancelled=1`,
            userAction: PaypalExperienceUserAction.PayNow,
          },
        },
      },
    },
  });

  const approveLink = result.links?.find((l) => l.rel === "approve" || l.rel === "payer-action");
  if (!approveLink?.href || !result.id) {
    throw new Error("PayPal did not return an approval link");
  }

  return { approveUrl: approveLink.href, paypalOrderId: result.id };
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const ordersController = new OrdersController(getClient());
  const { result } = await ordersController.captureOrder({ id: paypalOrderId });
  return result;
}
