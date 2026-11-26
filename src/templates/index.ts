import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { TemplateName } from "./names";
import Carousel from "./carousel/Carousel.astro";

export const TEMPLATES: Record<TemplateName, AstroComponentFactory> = {
  carousel: Carousel,
};
