import { config } from "dotenv";
import path from "node:path";
config({ path: path.resolve(__dirname, "../.env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { computeAvailableSlots } from "../src/lib/coaching-slots";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("1. Creating a coaching service...");
  const service = await prisma.service.upsert({
    where: { slug: "smoke-test-coaching" },
    update: {},
    create: {
      slug: "smoke-test-coaching",
      category: "COACHING",
      brand: "PERSONAL",
      name: "Smoke Test Coaching Session",
      description: "A test coaching package.",
      priceType: "FIXED",
      priceFromCents: 15000,
      requiresQuote: false,
      isActive: true,
    },
  });
  console.log("   OK:", service.id);

  console.log("2. Adding an availability rule (every day, 9am-5pm, 60min slots)...");
  const rules = [];
  for (let day = 0; day < 7; day++) {
    const rule = await prisma.availabilityRule.create({
      data: {
        serviceId: service.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMin: 60,
      },
    });
    rules.push(rule);
  }
  console.log("   OK:", rules.length, "rules created");

  console.log("3. Computing available slots...");
  const existingBookings = await prisma.booking.findMany({
    where: { serviceId: service.id, status: "CONFIRMED" },
    select: { startAt: true },
  });
  const slots = computeAvailableSlots(rules, existingBookings);
  console.log("   OK:", slots.length, "slots computed. First 3:");
  slots.slice(0, 3).forEach((s) => console.log("     -", s.startAt.toISOString()));

  if (slots.length === 0) throw new Error("Expected at least one available slot");

  console.log("4. Booking the first available slot...");
  const firstSlot = slots[0];
  const booking = await prisma.booking.create({
    data: {
      serviceId: service.id,
      startAt: firstSlot.startAt,
      endAt: firstSlot.endAt,
      customerName: "Smoke Test Client",
      customerEmail: "smoketest@example.com",
    },
  });
  console.log("   OK:", booking.id);

  console.log("5. Verifying double-booking the same slot fails (unique constraint)...");
  try {
    await prisma.booking.create({
      data: {
        serviceId: service.id,
        startAt: firstSlot.startAt,
        endAt: firstSlot.endAt,
        customerName: "Duplicate Client",
        customerEmail: "dupe@example.com",
      },
    });
    throw new Error("Expected unique constraint violation, but booking succeeded");
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "P2002") {
      console.log("   OK: duplicate booking correctly rejected (P2002)");
    } else {
      throw err;
    }
  }

  console.log("6. Verifying booked slot is excluded from computeAvailableSlots...");
  const bookingsAfter = await prisma.booking.findMany({
    where: { serviceId: service.id, status: "CONFIRMED" },
    select: { startAt: true },
  });
  const slotsAfter = computeAvailableSlots(rules, bookingsAfter);
  const stillThere = slotsAfter.some((s) => s.startAt.getTime() === firstSlot.startAt.getTime());
  if (stillThere) throw new Error("Booked slot was not excluded from available slots");
  console.log("   OK: booked slot excluded,", slotsAfter.length, "slots remain");

  console.log("7. Cleaning up test data...");
  await prisma.booking.deleteMany({ where: { serviceId: service.id } });
  await prisma.availabilityRule.deleteMany({ where: { serviceId: service.id } });
  await prisma.service.delete({ where: { id: service.id } });
  console.log("   OK");

  console.log("\nAll smoke tests passed.");
}

main()
  .catch((err) => {
    console.error("\nSMOKE TEST FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
