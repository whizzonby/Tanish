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

async function seedCoachingServices() {
  const service = await prisma.service.upsert({
    where: { slug: "business-coaching-course" },
    update: {},
    create: {
      slug: "business-coaching-course",
      category: "COACHING",
      brand: "PERSONAL",
      name: "Business Coaching Course",
      description:
        "A focused 1:1 coaching session to help you clarify your business idea, cut through the clutter, and build a plan you'll actually follow through on.",
      longDescription: [
        "This session is built for business owners who feel like they're doing everything at once and getting traction on nothing. We start by getting honest about what's actually working, what isn't, and what's been cluttering your decision-making — then leave with a clear, specific plan for what to do next.",
        "**What you'll get:**",
        "- A structured 60-minute 1:1 session, in person or by video call",
        "- Help identifying the one or two priorities that actually move your business forward",
        "- A written summary of what we cover and the next steps you commit to",
        "- Follow-up email support for one week after your session",
        "**Who it's for:** Business owners and entrepreneurs who want clarity and a plan, not just encouragement.",
      ].join("\n\n"),
      imageUrl: "/images/portrait-3.jpg",
      priceFromCents: 10000,
      priceType: "FIXED",
      requiresQuote: false,
      isActive: true,
      sortOrder: 1,
      availabilityRules: {
        create: [
          { dayOfWeek: 2, startTime: "10:00", endTime: "14:00", slotDurationMin: 60 },
          { dayOfWeek: 4, startTime: "10:00", endTime: "14:00", slotDurationMin: 60 },
        ],
      },
    },
  });
  console.log(`Seeded coaching service: ${service.name} (${service.id})`);
}

async function seedBlogPosts() {
  const posts: {
    slug: string;
    title: string;
    excerpt: string;
    tags: string[];
    coverImage?: string;
    content: string;
  }[] = [
    {
      slug: "declutter-before-you-scale",
      title: "Declutter Before You Scale: Why Clarity Comes First in Business",
      excerpt:
        "Before you can grow a business — or a life — you have to clear out what's standing in the way. Here's where to start.",
      tags: ["Coaching", "Business"],
      coverImage: "/images/portrait-2.jpg",
      content: `Every business owner I coach comes to me wanting to talk about growth — more clients, more revenue, more reach. But almost every time, the real conversation starts somewhere else: with the clutter.

Not the kind you can see in a junk drawer. The kind that piles up in a business — the offers you never fully committed to, the half-finished plans, the "yes" you said to something that isn't actually your work to do. It clogs the same way a cluttered closet does: quietly, a little at a time, until you can't find what you're actually looking for anymore.

## Clarity is a prerequisite, not a bonus

You cannot scale what you haven't defined. I've sat across from talented, hardworking people who were exhausted from running three different businesses inside one business — because they never decided what to say no to. Growth doesn't fix that. It just makes the mess bigger and more expensive.

## Three questions I ask every client before we talk about growth

1. **What are you doing right now that isn't actually your job?** If you can't answer this clearly, that's the first thing to clear out.
2. **What does "done" look like for this offer, this week, this goal?** Vague goals create vague clutter. Specific goals create a plan.
3. **What would you keep if you could only keep three things?** Whatever doesn't make that list is probably what's been slowing you down.

## Clearing the path is the work

This is the same idea behind *Declutter: Your Way to Success* — a cleared space, whether it's a room or a business plan, is what makes the next move possible. Coaching isn't about adding more to your plate. It's about helping you see what's already there clearly enough to move.

If you're ready to get honest about what's cluttering your business, [book a session](/coaching#book) — that's exactly where we'll start.`,
    },
    {
      slug: "signs-your-home-needs-a-deep-clean",
      title: "5 Signs Your Home Needs a Deep Clean (Not Just a Tidy-Up)",
      excerpt:
        "Tidying and deep cleaning aren't the same thing. Here's how to tell which one your space actually needs.",
      tags: ["Cleaning", "Home"],
      coverImage: "/images/cleaning-1.jpg",
      content: `Most of us know the difference between a messy room and a dirty one — but it's easy to keep tidying a space that actually needs a deep clean. Here are five signs it's time to book more than a quick wipe-down.

## 1. Surfaces look clean but still feel off

If counters and floors look fine but the room still doesn't feel fresh, the buildup is happening somewhere you're not looking — behind appliances, inside vents, along baseboards.

## 2. It's been more than a season

Regular tidying handles the day-to-day. But dust, grime, and allergens build up in cycles. A seasonal deep clean resets the space in a way a weekly wipe-down never will.

## 3. You just finished a renovation

Construction dust travels — into vents, light fixtures, and cabinets you didn't even open during the work. A post-construction clean isn't optional if you want the space move-in ready.

## 4. Something has changed in the household

A new pet, a new baby, someone recovering from illness — any shift in who's living in a space is a good reason to reset it properly before day-to-day maintenance takes over again.

## 5. You're dreading having people over

If your first thought about hosting is "I'd have to clean everything first," that's your answer. A deep clean gets you back to a baseline you can maintain with regular tidying.

Our team handles residential, commercial, and post-construction cleaning across Jamaica. [See our cleaning services](/cleaning) or reach out for a quote.`,
    },
    {
      slug: "renovate-or-relocate",
      title: "Renovate or Relocate? How to Know When a Property Is Worth Saving",
      excerpt:
        "Before you decide to move on from a property, it's worth asking what a renovation could actually change.",
      tags: ["Construction", "Renovation"],
      coverImage: "/images/construction-2.jpg",
      content: `We get this question often: "Is it worth renovating, or should I just move?" There's no single right answer, but there is a right way to think through it.

## Start with what's structurally sound

Cosmetic wear — old finishes, dated fixtures, tired paint — is almost always worth renovating around. Structural issues — foundation, roofing, plumbing, electrical — are the real deciding factor. A property with good bones is worth more work than one without them.

## Price the renovation against the alternative

A full comparison isn't just "cost of renovation vs. cost of a new property." It has to include moving costs, the time a search takes, and the value of staying in a location you already know and want.

## Renovate in phases when it makes sense

Not every renovation has to happen at once. Kitchens and bathrooms tend to offer the most day-to-day impact and the best return, so they're often the right place to start if you're renovating in stages rather than all at once.

## Bring in decor and finishing last — not first

A property can be structurally transformed and still feel unfinished without the right interior touches. That's exactly why our decor store exists alongside our construction work: to finish a space, not just rebuild it.

If you're weighing a renovation against a move, [request a quote](/construction-renovation) and we'll help you think it through properly before you commit either way.`,
    },
    {
      slug: "interior-decor-swaps-that-transform-a-room",
      title: "Small Changes, Big Impact: 7 Interior Decor Swaps That Transform a Room",
      excerpt:
        "You don't need a full renovation to change how a room feels. A few intentional swaps go a long way.",
      tags: ["Decor", "Home"],
      coverImage: "/images/interior-1.jpg",
      content: `Not every transformation requires construction. Sometimes a room just needs a few intentional pieces to feel finished. Here are seven swaps that consistently make the biggest difference.

1. **Swap mismatched storage for a curated basket set.** Storage that looks good doesn't need to be hidden — it becomes part of the room.
2. **Add texture with linen.** A few linen accent pillows soften a room faster than almost anything else.
3. **Bring in one reclaimed-wood piece.** A single natural-material accent table grounds a space that feels too polished or too new.
4. **Edit before you add.** Clearing what doesn't belong makes room for what does — this is decluttering applied to design.
5. **Layer, don't match.** A room with layered textures and tones feels lived-in; a room that matches too perfectly feels staged.
6. **Let function lead.** The most beautiful pieces are the ones you actually use — a basket that holds something, a table that earns its spot.
7. **Finish with one intentional detail.** One well-chosen piece, placed with intention, does more than five pieces placed to fill space.

Browse our curated pieces in the [decor store](/store) — each one is chosen the same way we approach every space: with care, and with a clear sense of what it's for.`,
    },
    {
      slug: "introducing-business-coaching-course",
      title: "New: A Business Coaching Course to Help You Get Unstuck",
      excerpt:
        "A focused, one-on-one session built for business owners who need clarity, not just encouragement.",
      tags: ["Coaching", "Announcement"],
      coverImage: "/images/portrait-2.jpg",
      content: `I'm introducing something new: a dedicated **Business Coaching Course** — a focused one-on-one session built specifically for people building or running a business.

## Who it's for

This session is for you if you're juggling too many priorities, unsure what to focus on next, or feel like your business has more clutter than clarity. It's practical, not theoretical — we work with where your business actually is right now.

## What it costs

The Business Coaching Course is $100 per session, booked directly through the calendar on the [coaching page](/coaching#book). No long-term package required to get started.

## What to expect

We'll spend the session getting honest about what's working, what isn't, and what needs to be cleared out before you can move forward with confidence — the same approach behind everything I do, from coaching to construction to *Declutter: Your Way to Success*.

[Book your session](/coaching#book) and let's get to work.`,
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        tags: post.tags,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }
  console.log(`Seeded ${posts.length} blog posts (skipped if already present).`);
}

async function main() {
  await seedAdminUser();
  await seedContentBlocks();
  await seedServices();
  await seedCoachingServices();
  await seedProducts();
  await seedBlogPosts();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
