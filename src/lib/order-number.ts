import { randomBytes } from "node:crypto";

// Short, URL-safe, human-readable order numbers (e.g. "CT-7F3K9A2Q").
// Kept short (<=16 chars incl. prefix) since WiPay's order_id field is capped
// at 16 characters for one of their supported processors.
export function generateOrderNumber() {
  const random = randomBytes(6).toString("hex").toUpperCase().slice(0, 8);
  return `CT-${random}`;
}
