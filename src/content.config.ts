import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Blog posts live in src/content/blog/*.md.
 * The URL comes from the `slug` frontmatter field (not the file name), so legacy
 * Framer slugs, including the one with a curly apostrophe, are reproduced exactly.
 */
const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
    generateId: ({ entry, data }) => (typeof data.slug === "string" && data.slug) || entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().max(200),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    // "framer" = migrated from the old site (sync-framer may refresh it);
    // anything else (e.g. "site") is never touched by sync-framer.
    source: z.string().default("site"),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
