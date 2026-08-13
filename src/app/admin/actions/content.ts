"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function updateContentBlock(formData: FormData) {
  await requireAdmin();

  const key = String(formData.get("key") ?? "");
  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "");

  if (!key) throw new Error("Missing content block key");

  await prisma.contentBlock.upsert({
    where: { key },
    update: { title, body, imageUrl: imageUrl || null },
    create: { key, title, body, imageUrl: imageUrl || null },
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/coaching");
  revalidatePath("/cleaning");
  revalidatePath("/construction-renovation");

  redirect("/admin/content?saved=" + key);
}
