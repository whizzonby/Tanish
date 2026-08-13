"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { SITE_SETTINGS_KEY } from "@/lib/site-settings";

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const metadata = {
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    instagram: String(formData.get("instagram") ?? "").trim(),
    facebook: String(formData.get("facebook") ?? "").trim(),
  };

  await prisma.contentBlock.upsert({
    where: { key: SITE_SETTINGS_KEY },
    update: { metadata },
    create: { key: SITE_SETTINGS_KEY, metadata },
  });

  // Settings are read on nearly every page (header/footer/contact/quote/store).
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
