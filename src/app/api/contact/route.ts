import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/mailtrap";
import { contactNotificationEmail } from "@/lib/email-templates";
import { getSiteSettings } from "@/lib/site-settings";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.email || !body?.message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { subject, html } = contactNotificationEmail({
    name: body.name,
    email: body.email,
    subject: body.subject,
    message: body.message,
  });
  const settings = await getSiteSettings();
  await sendTransactionalEmail({ to: settings.email, subject, html });

  return NextResponse.json({ ok: true });
}
