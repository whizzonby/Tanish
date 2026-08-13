import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ServiceCategory } from "@prisma/client";
import { sendTransactionalEmail } from "@/lib/mailtrap";
import { quoteNotificationEmail } from "@/lib/email-templates";
import { getSiteSettings } from "@/lib/site-settings";

const categoryMap: Record<string, ServiceCategory> = {
  cleaning: "CLEANING",
  construction: "CONSTRUCTION",
  renovation: "RENOVATION",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.email || !body?.projectDescription || !body?.category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const category = categoryMap[body.category];
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const quote = await prisma.quoteRequest.create({
    data: {
      category,
      customerName: body.name,
      email: body.email,
      phone: body.phone || null,
      address: body.address || null,
      projectDescription: body.projectDescription,
      budgetRange: body.budgetRange || null,
    },
  });

  const { subject, html } = quoteNotificationEmail({
    customerName: quote.customerName,
    email: quote.email,
    phone: quote.phone,
    category: quote.category,
    projectDescription: quote.projectDescription,
  });
  const settings = await getSiteSettings();
  await sendTransactionalEmail({ to: settings.email, subject, html });

  return NextResponse.json({ ok: true });
}
