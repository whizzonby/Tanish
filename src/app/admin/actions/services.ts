"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import type { Brand, PriceType, ServiceCategory } from "@prisma/client";
import type { AvailabilityRow } from "@/components/admin/availability-rules-editor";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function revalidatePublicPages(slug?: string) {
  revalidatePath("/coaching");
  revalidatePath("/cleaning");
  revalidatePath("/construction-renovation");
  revalidatePath("/admin/services");
  if (slug) {
    revalidatePath(`/coaching/${slug}`);
    revalidatePath(`/coaching/${slug}/book`);
  }
}

function readServiceForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const longDescription = String(formData.get("longDescription") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ServiceCategory;
  const brand = String(formData.get("brand") ?? "") as Brand;
  const priceType = String(formData.get("priceType") ?? "QUOTE") as PriceType;
  const priceFromDollars = String(formData.get("priceFromDollars") ?? "").trim();
  const requiresQuote = formData.get("requiresQuote") === "on";
  const isActive = formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const availabilityRulesJson = String(formData.get("availabilityRulesJson") ?? "[]");

  let availabilityRules: AvailabilityRow[] = [];
  try {
    availabilityRules = JSON.parse(availabilityRulesJson);
  } catch {
    availabilityRules = [];
  }

  return {
    name,
    description,
    longDescription: longDescription || null,
    category,
    brand,
    priceType,
    priceFromCents: priceFromDollars ? Math.round(Number(priceFromDollars) * 100) : null,
    requiresQuote,
    isActive,
    sortOrder,
    imageUrl: imageUrl || null,
    availabilityRules,
  };
}

async function syncAvailabilityRules(serviceId: string, rules: AvailabilityRow[]) {
  const submittedIds = new Set(rules.filter((r) => r.id).map((r) => r.id));
  const existing = await prisma.availabilityRule.findMany({ where: { serviceId } });

  for (const old of existing) {
    if (!submittedIds.has(old.id)) {
      await prisma.availabilityRule.delete({ where: { id: old.id } });
    }
  }

  for (const rule of rules) {
    const data = {
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      slotDurationMin: rule.slotDurationMin,
      isActive: rule.isActive,
    };
    if (rule.id) {
      await prisma.availabilityRule.update({ where: { id: rule.id }, data });
    } else {
      await prisma.availabilityRule.create({ data: { ...data, serviceId } });
    }
  }
}

export async function createService(formData: FormData) {
  await requireAdmin();
  const { availabilityRules, ...data } = readServiceForm(formData);
  if (!data.name) throw new Error("Name is required");

  const baseSlug = slugify(data.name);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.service.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const service = await prisma.service.create({ data: { ...data, slug } });
  await syncAvailabilityRules(service.id, availabilityRules);
  revalidatePublicPages(service.slug);
  redirect("/admin/services");
}

export async function updateService(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing service id");

  const { availabilityRules, ...data } = readServiceForm(formData);
  const service = await prisma.service.update({ where: { id }, data });
  await syncAvailabilityRules(id, availabilityRules);
  revalidatePublicPages(service.slug);
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
