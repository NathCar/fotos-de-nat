/**
 * Single source of truth for site-wide settings.
 * Edit this file to set your name, links, and SEO defaults — nothing else needs to change.
 */
export const SITE = {
  /** Brand mark shown in the header. */
  name: "fotos de nat",
  /** Used in <title>, Open Graph, and structured data. */
  title: "fotos de nat — Film Photography",
  description:
    "Film photographs from around the world, organised by place and film stock.",
  /** Canonical site URL. Update to your Vercel domain before deploying. */
  url: "https://example.com",
  /** Default locale for <html lang> and Open Graph. */
  locale: "en",
  /** Header social links. Leave a value empty ("") to hide that icon. */
  social: {
    instagram: "",
    x: "",
    email: "",
  },
} as const;

export type SiteConfig = typeof SITE;
