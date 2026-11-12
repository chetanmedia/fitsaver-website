#!/usr/bin/env node
/**
 * verify-urls.mjs — runs after every `astro build`.
 *
 * Fails the build if any URL that existed on the old Framer site is missing
 * from dist/, or if a page is missing its <title>, meta description or a
 * self-referencing canonical. This is the guardrail that protects rankings.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SITE = "https://fitsaver.app";
const inv = JSON.parse(fs.readFileSync(path.join(ROOT, "seo/url-inventory.json"), "utf8"));

function fileFor(p) {
  if (p === "/") return path.join(DIST, "index.html");
  const candidates = [path.join(DIST, p + ".html"), path.join(DIST, p, "index.html")];
  return candidates.find((c) => fs.existsSync(c));
}

const problems = [];
let ok = 0;
for (const { path: p } of inv.urls) {
  const f = fileFor(p);
  if (!f) { problems.push(`MISSING  ${p}`); continue; }
  const html = fs.readFileSync(f, "utf8");
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canon = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const expected = SITE + (p === "/" ? "/" : encodeURI(p));
  if (!title) problems.push(`NO TITLE ${p}`);
  if (!desc) problems.push(`NO DESC  ${p}`);
  if (canon !== expected) problems.push(`CANONICAL ${p}: got ${canon}, expected ${expected}`);
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] || "";
  if (/noindex/.test(robots)) problems.push(`NOINDEX  ${p}`);
  ok++;
}

// Every built page should be in the sitemap.
const sitemap = fs.existsSync(path.join(DIST, "sitemap.xml")) ? fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8") : "";
for (const { path: p } of inv.urls) {
  const loc = SITE + (p === "/" ? "/" : encodeURI(p));
  if (!sitemap.includes(`<loc>${loc}</loc>`)) problems.push(`NOT IN SITEMAP ${p}`);
}

console.log(`\nURL parity check: ${ok}/${inv.urls.length} legacy URLs built.`);
if (problems.length) {
  console.error(problems.map((x) => "  ✗ " + x).join("\n"));
  console.error(`\n${problems.length} problem(s). Fix these before switching DNS.`);
  console.error("If posts are missing, run: npm run sync-framer\n");
  if (process.env.SKIP_URL_CHECK) { console.error("SKIP_URL_CHECK is set: continuing anyway (preview builds only).\n"); process.exit(0); }
  process.exit(1);
}
console.log("  ✓ every legacy URL exists, with title, description and self-canonical, and is in the sitemap.\n");
