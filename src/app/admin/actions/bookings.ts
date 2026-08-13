"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@prisma/client";

export async function createAvailabilityRule(formData: FormData) {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") ?? "");
  const dayOfWeek = Number(formData.get("dayOfWeek") ?? -1);
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const slotDurationMin = Number(formData.get("slotDurationMin") ?? 60) || 60;

  if (!serviceId || dayOfWeek < 0 || !startTime || !endTime) {
    throw new Error("Missing availability rule fields");
  }

  await prisma.availabilityRule.create({
    data: { serviceId, dayOfWeek, startTime, endTime, slotDurationMin },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/coaching");
}

export async function deleteAvailabilityRule(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing rule id");

  await prisma.availabilityRule.delete({ where: { id } });
  revalidatePath("/admin/bookings");
  revalidatePath("/coaching");
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as BookingStatus;
  if (!id || !status) throw new Error("Missing booking id or status");

  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bookings");
  revalidatePath("/coaching");
}
