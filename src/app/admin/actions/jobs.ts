"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { parseLines, slugifyJob } from "@/lib/jobs";
import type { EmploymentType, JobStatus } from "@prisma/client";

function readJobForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const employmentType = String(
    formData.get("employmentType") ?? "PART_TIME"
  ) as EmploymentType;
  const compensation = String(formData.get("compensation") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const responsibilities = parseLines(String(formData.get("responsibilities") ?? ""));
  const requirements = parseLines(String(formData.get("requirements") ?? ""));
  const benefits = parseLines(String(formData.get("benefits") ?? ""));
  const status = String(formData.get("status") ?? "DRAFT") as JobStatus;
  const closesAtRaw = String(formData.get("closesAt") ?? "").trim();

  return {
    title,
    department: department || null,
    location: location || "Kingston, Jamaica",
    employmentType,
    compensation: compensation || null,
    summary,
    responsibilities,
    requirements,
    benefits,
    status,
    closesAt: closesAtRaw ? new Date(closesAtRaw) : null,
  };
}

function revalidateJobPages(slug?: string) {
  revalidatePath("/careers");
  revalidatePath("/admin/jobs");
  if (slug) revalidatePath(`/careers/${slug}`);
}

export async function createJob(formData: FormData) {
  await requireAdmin();
  const data = readJobForm(formData);
  if (!data.title) throw new Error("Title is required");
  if (!data.summary) throw new Error("Summary is required");

  const baseSlug = slugifyJob(data.title);
  let slug = baseSlug || "job";
  let n = 1;
  while (await prisma.jobPosting.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  await prisma.jobPosting.create({
    data: {
      slug,
      ...data,
      postedAt: data.status === "OPEN" ? new Date() : null,
    },
  });

  revalidateJobPages(slug);
  redirect("/admin/jobs");
}

export async function updateJob(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing job id");

  const existing = await prisma.jobPosting.findUnique({ where: { id } });
  if (!existing) throw new Error("Job not found");

  const data = readJobForm(formData);

  await prisma.jobPosting.update({
    where: { id },
    data: {
      ...data,
      postedAt:
        data.status === "OPEN" ? (existing.postedAt ?? new Date()) : existing.postedAt,
    },
  });

  revalidateJobPages(existing.slug);
  redirect("/admin/jobs");
}

export async function deleteJob(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing job id");

  const job = await prisma.jobPosting.delete({ where: { id } });
  revalidateJobPages(job.slug);
  redirect("/admin/jobs");
}
