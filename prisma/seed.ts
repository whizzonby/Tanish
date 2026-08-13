import { config } from "dotenv";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: path.resolve(__dirname, "../.env.local") });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user seed.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: { email: email.toLowerCase(), passwordHash },
  });
  console.log(`Admin user ready: ${email}`);
}

async function seedContentBlocks() {
  const blocks = [
    {
      key: "hero",
      title: "Clean Spaces. Clear Mind. Successful Life.",
      body:
        "Life coach, author, and founder of Caring Touch Reno Construction Ltd. Taniesha helps people and properties go from cluttered to transformed — one intentional space at a time.",
      imageUrl: "/images/hero-portrait.jpg",
    },
    {
      key: "about_bio",
      title: "A clear space, a clear mind, a life worth building",
      body: [
        "Taniesha Linton Flemmings has spent her career believing the same thing, in every room she's ever worked in: the space around you shapes the life you're able to live. That belief shows up differently depending on the day — sometimes it's a coaching session helping a client clear the mental clutter standing between them and their next move. Sometimes it's a full renovation crew transforming a property into a home someone is proud of. And sometimes it's as simple as a spotless, cared-for space that lets a family breathe again.",
        "That throughline is what led her to found Caring Touch Reno Construction Ltd, a Jamaica-based cleaning, construction, and renovation company built on the same care she brings to one-on-one coaching. It's also what led her to write Declutter: Your Way to Success — a book born from watching, again and again, how much a cleared space changes what people believe is possible for themselves.",
        "Today, Taniesha works across all of it: coaching clients toward clarity, leading her team on cleaning and renovation projects across Jamaica, curating interior pieces that help a house feel like a home, and writing about what she's learned along the way. Different rooms, same mission — clean spaces, clear minds, successful lives.",
      ].join("\n\n"),
      imageUrl: "/images/portrait-3.jpg",
    },
    {
      key: "coaching_intro",
      title: "Clear your mind. Choose your next move.",
      body:
        "Coaching with Taniesha starts with the same idea behind everything she builds: clarity comes from clearing what's in the way. Sessions are practical, honest, and built around where you actually are — not a one-size-fits-all script.",
      imageUrl: "/images/portrait-2.jpg",
    },
    {
      key: "cleaning_intro",
      title: "Cleaning Services",
      body:
        "A clean space is the starting point for everything else. Our team brings careful, reliable cleaning to homes and businesses across Jamaica.",
      imageUrl: "/images/cleaning-1.jpg",
    },
    {
      key: "construction_intro",
      title: "Construction & Renovation",
      body:
        "From full builds to room-by-room renovations, we transform properties across Jamaica with the same care behind everything Taniesha does.",
      imageUrl: "/images/construction-2.jpg",
    },
  ];

  for (const block of blocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: {},
      create: block,
    });
  }
  console.log(`Seeded ${blocks.length} content blocks (skipped if already present).`);
}

async function seedServices() {
  const services: {
    slug: string;
    category: "CLEANING" | "CONSTRUCTION" | "RENOVATION";
    name: string;
    description: string;
    sortOrder: number;
  }[] = [
    {
      slug: "residential-cleaning",
      category: "CLEANING",
      name: "Residential Cleaning",
      description: "Regular, deep, and move-in/move-out cleaning for homes of any size.",
      sortOrder: 1,
    },
    {
      slug: "commercial-cleaning",
      category: "CLEANING",
      name: "Commercial Cleaning",
      description: "Scheduled cleaning for offices, retail spaces, and short-term rentals.",
      sortOrder: 2,
    },
    {
      slug: "post-construction-cleaning",
      category: "CLEANING",
      name: "Post-Construction Cleaning",
      description: "Dust and debris removal after a renovation or build, ready for hand-off.",
      sortOrder: 3,
    },
    {
      slug: "deep-one-time-cleaning",
      category: "CLEANING",
      name: "Deep & One-Time Cleaning",
      description: "A thorough top-to-bottom clean for a special occasion or fresh start.",
      sortOrder: 4,
    },
    {
      slug: "new-construction",
      category: "CONSTRUCTION",
      name: "New Construction",
      description: "Ground-up builds managed from planning through final walkthrough.",
      sortOrder: 1,
    },
    {
      slug: "full-home-renovation",
      category: "RENOVATION",
      name: "Full Home Renovation",
      description: "Whole-property transformations — layout, finishes, and everything between.",
      sortOrder: 2,
    },
    {
      slug: "kitchen-bathroom-remodels",
      category: "RENOVATION",
      name: "Kitchen & Bathroom Remodels",
      description: "The rooms that matter most, rebuilt with lasting materials and finishes.",
      sortOrder: 3,
    },
    {
      slug: "interior-fit-out-decor-styling",
      category: "RENOVATION",
      name: "Interior Fit-Out & Decor Styling",
      description:
        "Paired with our decor store to finish a space beautifully, not just structurally.",
      sortOrder: 4,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        slug: service.slug,
        category: service.category,
        brand: "CARING_TOUCH",
        name: service.name,
        description: service.description,
        priceType: "QUOTE",
        requiresQuote: true,
        sortOrder: service.sortOrder,
      },
    });
  }
  console.log(`Seeded ${services.length} services (skipped if already present).`);
}

async function seedProducts() {
  const book = await prisma.product.upsert({
    where: { slug: "declutter-your-way-to-success" },
    update: {},
    create: {
      slug: "declutter-your-way-to-success",
      type: "BOOK",
      name: "Declutter: Your Way to Success",
      description:
        "A practical guide to clearing physical and mental clutter so you can build the life, home, and business you actually want.",
      longDescription:
        "Clean spaces. Clear mind. Successful life. In Declutter: Your Way to Success, Taniesha Linton Flemmings shares the mindset and the method behind years of helping people and properties transform — from the clients she's coached through major life decisions to the homes her team has rebuilt from the ground up. Part memoir, part practical guide, it's for anyone ready to clear the clutter standing between them and what's next.",
      images: ["/images/book-cover.png"],
      isActive: true,
      comingSoon: false,
      variants: {
        create: [
          { label: "Hardcover", sku: "DECLUTTER-HC", priceCents: 2499, stock: 100, isDigital: false },
          { label: "Ebook", sku: "DECLUTTER-EB", priceCents: 1299, stock: null, isDigital: true },
        ],
      },
    },
  });

  const decorItems = [
    {
      slug: "woven-storage-basket-set",
      name: "Woven Storage Basket Set",
      description: "A curated set of natural-fiber baskets for stylish, functional storage.",
      image: "/images/interior-1.jpg",
      sku: "DECOR-BASKET-3",
      priceCents: 6500,
    },
    {
      slug: "linen-accent-pillow",
      name: "Linen Accent Pillow",
      description: "Soft-touch linen cushion covers to finish a room with warmth.",
      image: "/images/interior-2.jpg",
      sku: "DECOR-PILLOW-18",
      priceCents: 3200,
    },
    {
      slug: "reclaimed-wood-side-table",
      name: "Reclaimed Wood Side Table",
      description: "A handcrafted accent table built from reclaimed hardwood.",
      image: "/images/interior-1.jpg",
      sku: "DECOR-TABLE-STD",
      priceCents: 14500,
    },
  ];

  for (const item of decorItems) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        slug: item.slug,
        type: "DECOR",
        name: item.name,
        description: item.description,
        images: [item.image],
        isActive: true,
        comingSoon: true,
        variants: {
          create: [{ label: "Standard", sku: item.sku, priceCents: item.priceCents, stock: 0 }],
        },
      },
    });
  }

  console.log(`Seeded book (${book.id}) and ${decorItems.length} decor items (skipped if already present).`);
}

async function main() {
  await seedAdminUser();
  await seedContentBlocks();
  await seedServices();
  await seedProducts();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
