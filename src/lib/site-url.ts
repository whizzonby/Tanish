// Absolute base URL for redirect-based payment callbacks (PayPal/WiPay require
// fully-qualified URLs). Set NEXT_PUBLIC_SITE_URL in production; falls back to
// localhost for dev.
export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
