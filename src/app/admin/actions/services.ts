"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import type { Brand, PriceType, ServiceCategory } from "@prisma/client";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function revalidatePublicPages() {
  revalidatePath("/coaching");
  revalidatePath("/cleaning");
  revalidatePath("/construction-renovation");
  revalidatePath("/admin/services");
}

function readServiceForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ServiceCategory;
  const brand = String(formData.get("brand") ?? "") as Brand;
  const priceType = String(formData.get("priceType") ?? "QUOTE") as PriceType;
  const priceFromDollars = String(formData.get("priceFromDollars") ?? "").trim();
  const requiresQuote = formData.get("requiresQuote") === "on";
  const isActive = formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  return {
    name,
    description,
    category,
    brand,
    priceType,
    priceFromCents: priceFromDollars ? Math.round(Number(priceFromDollars) * 100) : null,
    requiresQuote,
    isActive,
    sortOrder,
    imageUrl: imageUrl || null,
  };
}

export async function createService(formData: FormData) {
  await requireAdmin();
  const data = readServiceForm(formData);
  if (!data.name) throw new Error("Name is required");

  const baseSlug = slugify(data.name);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.service.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  await prisma.service.create({ data: { ...data, slug } });
  revalidatePublicPages();
  redirect("/admin/services");
}

export async function updateService(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing service id");

  const data = readServiceForm(formData);
  await prisma.service.update({ where: { id }, data });
  revalidatePublicPages();
  redirect("/admin/services");
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing service id");

  await prisma.service.delete({ where: { id } });
  revalidatePublicPages();
  redirect("/admin/services");
}
