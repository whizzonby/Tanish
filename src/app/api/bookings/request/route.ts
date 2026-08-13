import { NextResponse } from "next/server";

// TODO(Phase 2): persist to Booking via Prisma, notify via Mailtrap, and replace
// this request-based flow with the real-time AvailabilityRule-backed calendar.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  console.log("[booking-request]", body);
  return NextResponse.json({ ok: true });
}
