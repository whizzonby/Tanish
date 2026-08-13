export const contentBlockDefs = [
  { key: "hero", label: "Homepage Hero", description: "Main headline, intro text, and hero photo." },
  { key: "about_bio", label: "About Page Bio", description: "Taniesha's story on the About page." },
  { key: "coaching_intro", label: "Coaching Intro", description: "Intro section at the top of the Coaching page." },
  { key: "cleaning_intro", label: "Cleaning Intro", description: "Intro section at the top of the Cleaning page." },
  { key: "construction_intro", label: "Construction & Renovation Intro", description: "Intro section at the top of the Construction & Renovation page." },
] as const;

export type ContentBlockKey = (typeof contentBlockDefs)[number]["key"];
