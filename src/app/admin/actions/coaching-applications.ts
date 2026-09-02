"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { isCoachingApplicationStatus } from "@/lib/coaching-applications";

export async function updateCoachingApplicationStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !isCoachingApplicationStatus(status)) {
    throw new Error("Invalid application id or status");
  }
  await prisma.coachingApplication.update({ where: { id }, data: { status } });
  revalidatePath("/admin/coaching-applications");
}

export async function saveCoachingApplicationNotes(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing application id");
  const notes = String(formData.get("notes") ?? "").trim();
  await prisma.coachingApplication.update({ where: { id }, data: { notes: notes || null } });
  revalidatePath("/admin/coaching-applications");
}

export async function deleteCoachingApplication(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing application id");
  await prisma.coachingApplication.delete({ where: { id } });
  revalidatePath("/admin/coaching-applications");
}
