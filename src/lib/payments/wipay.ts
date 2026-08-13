import { createHash } from "node:crypto";
import { getSiteUrl } from "@/lib/site-url";

// Integration reference: WiPay Payments API Documentation v1.0.8 (23/12/2024),
// https://wipaycaribbean.com/WiPay-API-Documentation.pdf
//
// Sandbox credentials are fixed by WiPay regardless of the merchant's real
// account: account_number "1234567890", api_key "123".
const SANDBOX_ACCOUNT_NUMBER = "1234567890";
const SANDBOX_API_KEY = "123";

function countryCode() {
  return (process.env.WIPAY_COUNTRY_CODE || "JM").toLowerCase();
}

function environment(): "sandbox" | "live" {
  return process.env.WIPAY_ENVIRONMENT === "live" ? "live" : "sandbox";
}

function requestEndpoint() {
  return `https://${countryCode()}.wipayfinancial.com/plugins/payments/request`;
}

export function isWiPayConfigured() {
  return environment() === "sandbox" || Boolean(process.env.WIPAY_ACCOUNT_NUMBER && process.env.WIPAY_API_KEY);
}

function accountNumber() {
  return environment() === "sandbox" ? SANDBOX_ACCOUNT_NUMBER : process.env.WIPAY_ACCOUNT_NUMBER!;
}

function apiKey() {
  return environment() === "sandbox" ? SANDBOX_API_KEY : process.env.WIPAY_API_KEY!;
}

export async function createWiPayCheckout(order: {
  orderNumber: string;
  totalCents: number;
  customerEmail: string;
  customerName: string;
}): Promise<{ url: string; transactionId: string }> {
  const params = new URLSearchParams({
    account_number: accountNumber(),
    country_code: countryCode().toUpperCase(),
    currency: process.env.WIPAY_CURRENCY || "USD",
    environment: environment(),
    fee_structure: process.env.WIPAY_FEE_STRUCTURE || "customer_pay",
    method: "credit_card",
    order_id: order.orderNumber,
    origin: "caring-touch-reno-store",
    response_url: `${getSiteUrl()}/api/payments/wipay/callback`,
    total: (order.totalCents / 100).toFixed(2),
    name: order.customerName,
    email: order.customerEmail,
  });

  const res = await fetch(requestEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.message || `WiPay checkout request failed (${res.status})`);
  }

  return { url: data.url, transactionId: data.transaction_id };
}

// WiPay only returns `hash` for status=success responses:
// md5(transaction_id + original_total + api_key), no separators.
export function verifyWiPayHash({
  transactionId,
  total,
  hash,
}: {
  transactionId: string;
  total: string;
  hash: string;
}) {
  const expected = createHash("md5").update(`${transactionId}${total}${apiKey()}`).digest("hex");
  return expected === hash;
}
