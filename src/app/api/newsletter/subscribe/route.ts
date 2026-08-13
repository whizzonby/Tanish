import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO(Phase 5): sync new subscribers to Mailtrap.
export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({ email: undefined }));

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: email.toLowerCase() },
    update: { status: "SUBSCRIBED" },
    create: { email: email.toLowerCase(), source: "website" },
  });

  return NextResponse.json({ ok: true });
}
