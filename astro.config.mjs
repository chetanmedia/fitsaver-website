import { defineConfig } from "astro/config";
import { rehypeFitsaver } from "./src/lib/rehype-fitsaver.mjs";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://fitsaver.app",
  // Framer served URLs without a trailing slash (/blog/slug). Keep that exactly.
  trailingSlash: "never",
  build: {
    // /blog/slug -> dist/blog/slug.html, which Netlify serves at /blog/slug with no redirect.
    format: "file",
    inlineStylesheets: "auto",
  },
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  markdown: {
    rehypePlugins: [rehypeFitsaver],
  },
});
