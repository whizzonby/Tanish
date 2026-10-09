export function formatPrice(cents: number, currency: string = "USD") {
  if (currency === "JMD") {
    // Intl renders JMD as a bare "$" (en-JM) or "JMD" (en-US); spell out JM$
    // so it can't be mistaken for US dollars next to USD prices.
    const amount = cents / 100;
    return `JM$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100
  );
}
