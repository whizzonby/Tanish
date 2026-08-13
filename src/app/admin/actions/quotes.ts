"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import type { QuoteStatus } from "@prisma/client";

export async function updateQuoteStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as QuoteStatus;
  if (!id || !status) throw new Error("Missing quote id or status");

  await prisma.quoteRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/quotes");
}
