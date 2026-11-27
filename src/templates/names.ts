/** Kept apart from index.ts because content.config.ts can't import .astro files. */
export const TEMPLATE_NAMES = ["carousel", "scatter", "strip"] as const;
export type TemplateName = (typeof TEMPLATE_NAMES)[number];
