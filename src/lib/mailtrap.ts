import { MailtrapClient } from "mailtrap";
import { siteConfig } from "@/lib/site-config";

// Mailtrap separates transactional and bulk sending by host/stream, not by a
// body field — send.api.mailtrap.io vs bulk.api.mailtrap.io, selected here
// via the SDK's `bulk` client option. Reference: Mailtrap Email Sending API
// docs (docs.mailtrap.io/developers/email-sending), researched August 2026.
const BATCH_CHUNK_SIZE = 500; // Mailtrap's max requests per /api/batch call

export function isMailtrapConfigured() {
  return Boolean(process.env.MAILTRAP_API_TOKEN && process.env.MAILTRAP_SENDER_EMAIL);
}

function sender() {
  return { email: process.env.MAILTRAP_SENDER_EMAIL!, name: siteConfig.personalName };
}

function transactionalClient() {
  return new MailtrapClient({ token: process.env.MAILTRAP_API_TOKEN! });
}

function bulkClient() {
  return new MailtrapClient({ token: process.env.MAILTRAP_API_TOKEN!, bulk: true });
}

// Errors are caught and logged rather than thrown — a failed notification
// email should never fail the order/booking/quote it's attached to.
export async function sendTransactionalEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!isMailtrapConfigured()) {
    console.log(`[mailtrap:disabled] would send transactional email to ${to}: ${subject}`);
    return;
  }

  try {
    await transactionalClient().send({
      from: sender(),
      to: [{ email: to }],
      subject,
      html,
      category: "Transactional",
    });
  } catch (err) {
    console.error("[mailtrap] transactional send failed", err);
  }
}

export async function sendBulkEmail({
  recipients,
  subject,
  html,
}: {
  recipients: string[];
  subject: string;
  html: string;
}): Promise<{ sent: number }> {
  if (!isMailtrapConfigured()) {
    console.log(`[mailtrap:disabled] would send bulk email to ${recipients.length} recipients: ${subject}`);
    return { sent: 0 };
  }
  if (recipients.length === 0) return { sent: 0 };

  const client = bulkClient();
  let sent = 0;

  for (let i = 0; i < recipients.length; i += BATCH_CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_CHUNK_SIZE);
    try {
      const result = await client.batchSend({
        base: { from: sender(), subject, html, category: "Newsletter" },
        requests: chunk.map((email) => ({ to: [{ email }] })),
      });
      sent += result.responses.filter((r) => r.success).length;
    } catch (err) {
      console.error("[mailtrap] bulk batch send failed", err);
    }
  }

  return { sent };
}
