import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import { sendTransactionalEmail } from "@/lib/mailtrap";
import { jobApplicationNotificationEmail } from "@/lib/email-templates";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/site-url";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const jobId = str(form.get("jobId"));
  const fullName = str(form.get("fullName"));
  const email = str(form.get("email"));
  const phone = str(form.get("phone"));

  if (!jobId || !fullName || !email || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "OPEN") {
    return NextResponse.json(
      { error: "This posting is no longer accepting applications." },
      { status: 400 }
    );
  }

  const resume = form.get("resume");
  const hasResume = resume instanceof File && resume.size > 0;
  if (hasResume && resume.size > MAX_RESUME_BYTES) {
    return NextResponse.json(
      { error: "Résumé must be smaller than 5MB." },
      { status: 400 }
    );
  }
  if (hasResume && !ALLOWED_RESUME_TYPES.has(resume.type)) {
    return NextResponse.json(
      { error: "Résumé must be a PDF or Word document." },
      { status: 400 }
    );
  }

  try {
    // A résumé upload that fails (e.g. disk not writable) should not lose the
    // whole application — save it without the file and carry on.
    let resumeUrl: string | null = null;
    if (hasResume) {
      try {
        resumeUrl = await saveUploadedFile(resume);
      } catch (err) {
        console.error("[careers/apply] résumé upload failed", err);
      }
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        fullName,
        email,
        phone,
        location: str(form.get("location")) || null,
        availability: str(form.get("availability")) || null,
        experience: str(form.get("experience")) || null,
        coverLetter: str(form.get("coverLetter")) || null,
        resumeUrl,
      },
    });

    const settings = await getSiteSettings();
    const { subject, html } = jobApplicationNotificationEmail({
      applicantName: application.fullName,
      jobTitle: job.title,
      email: application.email,
      phone: application.phone,
      location: application.location,
      availability: application.availability,
      experience: application.experience,
      coverLetter: application.coverLetter,
      resumeUrl: resumeUrl ? `${getSiteUrl()}${resumeUrl}` : null,
    });
    await sendTransactionalEmail({ to: settings.email, subject, html });

    return NextResponse.json({ ok: true, resumeSaved: hasResume ? resumeUrl !== null : undefined });
  } catch (err) {
    console.error("[careers/apply] failed to save application", err);
    return NextResponse.json(
      { error: "We couldn't save your application. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}
