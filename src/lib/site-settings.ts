import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

export const SITE_SETTINGS_KEY = "site_settings";

export type SiteSettings = {
  email: string;
  phone: string;
  location: string;
  instagram: string;
  facebook: string;
};

const defaults: SiteSettings = {
  email: siteConfig.email,
  phone: siteConfig.phone,
  location: siteConfig.location,
  instagram: siteConfig.social.instagram,
  facebook: siteConfig.social.facebook,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const block = await prisma.contentBlock.findUnique({ where: { key: SITE_SETTINGS_KEY } });
  const metadata = (block?.metadata as Partial<SiteSettings> | null) ?? {};

  return {
    email: metadata.email || defaults.email,
    phone: metadata.phone || defaults.phone,
    location: metadata.location || defaults.location,
    instagram: metadata.instagram || defaults.instagram,
    facebook: metadata.facebook || defaults.facebook,
  };
}
