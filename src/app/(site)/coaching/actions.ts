"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/mailtrap";
import { bookingConfirmationEmail } from "@/lib/email-templates";

export async function createBooking(input: {
  serviceId: string;
  startAtIso: string;
  durationMin: number;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { serviceId, startAtIso, durationMin, name, email, phone, notes } = input;

  if (!serviceId || !startAtIso || !name || !email) {
    return { ok: false, error: "Missing required fields." };
  }

  const startAt = new Date(startAtIso);
  if (Number.isNaN(startAt.getTime()) || startAt.getTime() < Date.now()) {
    return { ok: false, error: "That time is no longer available." };
  }
  const endAt = new Date(startAt.getTime() + durationMin * 60000);

  try {
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        startAt,
        endAt,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || null,
        notes: notes || null,
      },
      include: { service: true },
    });

    const { subject, html } = bookingConfirmationEmail({
      customerName: booking.customerName,
      serviceName: booking.service.name,
      startAt: booking.startAt,
    });
    await sendTransactionalEmail({ to: booking.customerEmail, subject, html });

    revalidatePath("/coaching");
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, error: "That time slot was just booked — please choose another." };
    }
    throw err;
  }
}
