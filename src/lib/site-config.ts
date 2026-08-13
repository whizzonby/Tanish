export const siteConfig = {
  personalName: "Taniesha Linton Flemmings",
  brandName: "Caring Touch Reno Construction Ltd",
  tagline: "Clean Spaces. Clear Mind. Successful Life.",
  domain: "caringtouchreno.com",
  // TODO: replace with real contact details via the admin CMS once live.
  email: "hello@caringtouchreno.com",
  phone: "(876) 000-0000",
  location: "Jamaica",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
  },
} as const;

export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string; description: string }[];
};

export const primaryNav: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Coaching", href: "/coaching" },
  {
    label: "Caring Touch Reno",
    href: "/cleaning",
    children: [
      {
        label: "Cleaning Services",
        href: "/cleaning",
        description: "Residential & commercial cleaning across Jamaica",
      },
      {
        label: "Construction & Renovation",
        href: "/construction-renovation",
        description: "Full builds, renovations & property transformations",
      },
    ],
  },
  { label: "Store", href: "/store" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
