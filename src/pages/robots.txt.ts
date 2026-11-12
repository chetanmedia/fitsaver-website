import type { APIRoute } from "astro";

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /contact-sent\n\nSitemap: https://fitsaver.app/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
