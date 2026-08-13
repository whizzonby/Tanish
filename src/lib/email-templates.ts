import { siteConfig } from "@/lib/site-config";
import { formatPrice } from "@/lib/format";

function wrapper(bodyHtml: string) {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #141c2e;">
      <div style="background:#0c1526; padding:24px 32px;">
        <span style="color:#e8d19b; font-size:13px; letter-spacing:0.2em; text-transform:uppercase;">${siteConfig.personalName}</span>
      </div>
      <div style="padding:32px; background:#ffffff;">
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px; background:#faf7f0; color:#6b7280; font-size:12px;">
        ${siteConfig.brandName} &middot; ${siteConfig.domain}
      </div>
    </div>
  `;
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  customerName: string;
  totalCents: number;
  paymentMethod: string;
  items: {
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    isDigital?: boolean;
    downloadUrl?: string | null;
  }[];
}) {
  const itemRows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;">${item.nameSnapshot} &times; ${item.quantity}</td><td style="padding:6px 0; text-align:right;">${formatPrice(item.priceSnapshot * item.quantity)}</td></tr>`
    )
    .join("");

  const paymentNote =
    order.paymentMethod === "COD"
      ? "We'll be in touch to arrange payment on delivery or pickup."
      : "Your payment has been received — thank you!";

  const downloadItems = order.items.filter((item) => item.isDigital && item.downloadUrl);
  const downloadsSection =
    downloadItems.length > 0
      ? `
      <div style="margin:0 0 20px; padding:16px; background:#faf7f0; border-radius:8px;">
        <p style="margin:0 0 8px; font-weight:bold;">Your downloads</p>
        ${downloadItems
          .map(
            (item) =>
              `<p style="margin:4px 0;"><a href="${item.downloadUrl}" style="color:#b8860b;">Download ${item.nameSnapshot}</a></p>`
          )
          .join("")}
      </div>`
      : "";

  return {
    subject: `Order confirmed — ${order.orderNumber}`,
    html: wrapper(`
      <h1 style="font-size:22px; margin:0 0 12px;">Thank you, ${order.customerName}!</h1>
      <p style="margin:0 0 20px; color:#374151;">Your order <strong>${order.orderNumber}</strong> is confirmed. ${paymentNote}</p>
      ${downloadsSection}
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        ${itemRows}
        <tr><td style="padding-top:12px; border-top:1px solid #e5e7eb; font-weight:bold;">Total</td><td style="padding-top:12px; border-top:1px solid #e5e7eb; text-align:right; font-weight:bold;">${formatPrice(order.totalCents)}</td></tr>
      </table>
    `),
  };
}

export function bookingConfirmationEmail(booking: {
  customerName: string;
  serviceName: string;
  startAt: Date;
}) {
  const when = booking.startAt.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Jamaica",
  });

  return {
    subject: `Session confirmed — ${booking.serviceName}`,
    html: wrapper(`
      <h1 style="font-size:22px; margin:0 0 12px;">You're booked, ${booking.customerName}!</h1>
      <p style="margin:0; color:#374151;">Your <strong>${booking.serviceName}</strong> session is confirmed for:</p>
      <p style="margin:12px 0; font-size:16px; font-weight:bold;">${when}</p>
      <p style="margin:0; color:#374151;">Reach out if anything changes.</p>
    `),
  };
}

export function quoteNotificationEmail(quote: {
  customerName: string;
  email: string;
  phone?: string | null;
  category: string;
  projectDescription: string;
}) {
  return {
    subject: `New quote request — ${quote.category}`,
    html: wrapper(`
      <h1 style="font-size:20px; margin:0 0 12px;">New quote request</h1>
      <p style="margin:0 0 4px;"><strong>${quote.customerName}</strong> (${quote.email}${quote.phone ? `, ${quote.phone}` : ""})</p>
      <p style="margin:0 0 12px; color:#6b7280;">Category: ${quote.category}</p>
      <p style="margin:0; color:#374151; white-space:pre-wrap;">${quote.projectDescription}</p>
    `),
  };
}

export function contactNotificationEmail(contact: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  return {
    subject: `New contact form message${contact.subject ? `: ${contact.subject}` : ""}`,
    html: wrapper(`
      <h1 style="font-size:20px; margin:0 0 12px;">New message from the site</h1>
      <p style="margin:0 0 12px;"><strong>${contact.name}</strong> (${contact.email})</p>
      <p style="margin:0; color:#374151; white-space:pre-wrap;">${contact.message}</p>
    `),
  };
}
