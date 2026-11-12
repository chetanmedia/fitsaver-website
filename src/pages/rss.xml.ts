import type { APIRoute } from "astro";
import { getPosts } from "../lib/posts";
import { SITE } from "../lib/site";

const x = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async () => {
  const posts = (await getPosts()).slice(0, 40);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Fitsaver Blog</title>
<link>${SITE.url}/blog</link>
<description>Workout routines, splits and training plans from Fitsaver.</description>
<language>en-us</language>
<atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${posts
  .map((p) => {
    const url = `${SITE.url}/blog/${encodeURI(p.data.slug)}`;
    return `<item><title>${x(p.data.title)}</title><link>${x(url)}</link><guid>${x(url)}</guid><pubDate>${p.data.date.toUTCString()}</pubDate><description>${x(p.data.description)}</description></item>`;
  })
  .join("\n")}
</channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
