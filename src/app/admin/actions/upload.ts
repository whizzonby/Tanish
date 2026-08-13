"use server";

import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export async function uploadMedia(formData: FormData): Promise<{ url: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided");
  }

  const url = await saveUploadedFile(file);
  await prisma.mediaAsset.create({ data: { url } });

  return { url };
}
