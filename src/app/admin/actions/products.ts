"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import type { VariantRow } from "@/components/admin/product-variants-editor";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readProductForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const longDescription = String(formData.get("longDescription") ?? "").trim();
  const type = String(formData.get("type") ?? "DECOR") as "BOOK" | "DECOR";
  const isActive = formData.get("isActive") === "on";
  const comingSoon = formData.get("comingSoon") === "on";
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const variantsJson = String(formData.get("variantsJson") ?? "[]");

  let variants: VariantRow[] = [];
  try {
    variants = JSON.parse(variantsJson);
  } catch {
    variants = [];
  }

  return {
    name,
    description,
    longDescription: longDescription || null,
    type,
    isActive,
    comingSoon,
    images: imageUrl ? [imageUrl] : [],
    variants: variants.filter((v) => v.label && v.sku),
  };
}

async function syncVariants(productId: string, variants: VariantRow[]) {
  const submittedIds = new Set(variants.filter((v) => v.id).map((v) => v.id));
  const existing = await prisma.productVariant.findMany({ where: { productId } });

  for (const old of existing) {
    if (!submittedIds.has(old.id)) {
      try {
        await prisma.productVariant.delete({ where: { id: old.id } });
      } catch {
        // Referenced by existing orders — keep it rather than fail the save.
        console.warn(`[products] could not delete variant ${old.id} (likely referenced by orders)`);
      }
    }
  }

  for (const variant of variants) {
    const data = {
      label: variant.label,
      sku: variant.sku,
      priceCents: Math.round(Number(variant.priceDollars || 0) * 100),
      stock: variant.isDigital || variant.stock === "" ? null : Number(variant.stock),
      isDigital: variant.isDigital,
    };
    if (variant.id) {
      await prisma.productVariant.update({ where: { id: variant.id }, data });
    } else {
      await prisma.productVariant.create({ data: { ...data, productId } });
    }
  }
}

function revalidateStorePages(slug?: string) {
  revalidatePath("/store");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/store/${slug}`);
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = readProductForm(formData);
  if (!data.name) throw new Error("Name is required");

  const baseSlug = slugify(data.name);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const product = await prisma.product.create({
    data: {
      slug,
      type: data.type,
      name: data.name,
      description: data.description,
      longDescription: data.longDescription,
      images: data.images,
      isActive: data.isActive,
      comingSoon: data.comingSoon,
    },
  });

  await syncVariants(product.id, data.variants);
  revalidateStorePages(product.slug);
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");

  const data = readProductForm(formData);
  const product = await prisma.product.update({
    where: { id },
    data: {
      type: data.type,
      name: data.name,
      description: data.description,
      longDescription: data.longDescription,
      images: data.images,
      isActive: data.isActive,
      comingSoon: data.comingSoon,
    },
  });

  await syncVariants(id, data.variants);
  revalidateStorePages(product.slug);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");

  const product = await prisma.product.delete({ where: { id } });
  revalidateStorePages(product.slug);
  redirect("/admin/products");
}
