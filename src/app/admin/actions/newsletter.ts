"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { sendBulkEmail } from "@/lib/mailtrap";
import type { SubscriberStatus } from "@prisma/client";

export async function sendCampaign(formData: FormData) {
  await requireAdmin();

  const subject = String(formData.get("subject") ?? "").trim();
  const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();
  if (!subject || !bodyHtml) throw new Error("Subject and body are required");

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: "SUBSCRIBED" },
    select: { email: true },
  });

  const campaign = await prisma.newsletterCampaign.create({
    data: { subject, bodyHtml, status: "SENDING", recipientCount: subscribers.length },
  });

  const { sent } = await sendBulkEmail({
    recipients: subscribers.map((s) => s.email),
    subject,
    html: bodyHtml,
  });

  await prisma.newsletterCampaign.update({
    where: { id: campaign.id },
    data: { status: "SENT", sentAt: new Date(), recipientCount: sent },
  });

  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter");
}

export async function updateSubscriber(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const status = String(formData.get("status") ?? "") as SubscriberStatus;
  if (!id || !email || !status) throw new Error("Missing subscriber id, email, or status");

  await prisma.newsletterSubscriber.update({ where: { id }, data: { email, status } });
  revalidatePath("/admin/newsletter");
}

export async function deleteSubscriber(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing subscriber id");

  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/admin/newsletter");
}
