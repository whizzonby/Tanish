"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import type { ApplicationStatus } from "@prisma/client";

export async function updateApplicationStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ApplicationStatus;
  if (!id || !status) throw new Error("Missing application id or status");

  await prisma.jobApplication.update({ where: { id }, data: { status } });
  revalidatePath("/admin/applications");
}

export async function saveApplicationNotes(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing application id");
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.jobApplication.update({
    where: { id },
    data: { notes: notes || null },
  });
  revalidatePath("/admin/applications");
}

export async function deleteApplication(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing application id");

  await prisma.jobApplication.delete({ where: { id } });
  revalidatePath("/admin/applications");
}
