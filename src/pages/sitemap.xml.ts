import type { APIRoute } from "astro";
import { getPosts } from "../lib/posts";
import { SITE } from "../lib/site";

const STATIC = ["/", "/blog", "/contact", "/privay-policy", "/privay-policy-2", "/delete-account", "/tools", "/tools/workout-generator", "/tools/workout-split-builder", "/tools/one-rep-max-calculator"];

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const newest = posts[0]?.data.date.toISOString().slice(0, 10);
  const urls = [
    ...STATIC.map((p) => ({ loc: p === "/" ? `${SITE.url}/` : SITE.url + encodeURI(p), lastmod: p === "/" || p === "/blog" ? newest : undefined })),
    ...posts.map((p) => ({
      loc: `${SITE.url}/blog/${encodeURI(p.data.slug)}`,
      lastmod: (p.data.updated || p.data.date).toISOString().slice(0, 10),
    })),
  ];
  const esc = (s: string) => s.replace(/&/g, "&amp;");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
