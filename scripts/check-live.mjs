#!/usr/bin/env node
/**
 * check-live.mjs — request every legacy URL on a deployed site and confirm it works.
 *
 *   npm run check-live -- https://your-site.netlify.app   # before switching DNS
 *   npm run check-live -- https://fitsaver.app            # right after switching DNS
 *
 * Checks: HTTP 200 with no redirect, a <title>, a meta description, and a canonical
 * that points at https://fitsaver.app/<same path>.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.argv[2] || "https://fitsaver.app").replace(/\/$/, "");
const inv = JSON.parse(fs.readFileSync(path.join(ROOT, "seo/url-inventory.json"), "utf8"));

let bad = 0;
console.log(`\nChecking ${inv.urls.length} legacy URLs on ${base}\n`);
for (const { path: p } of inv.urls) {
  const url = base + (p === "/" ? "/" : encodeURI(p));
  try {
    const res = await fetch(url, { redirect: "manual" });
    const html = res.status === 200 ? await res.text() : "";
    const canon = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
    const expected = "https://fitsaver.app" + (p === "/" ? "/" : encodeURI(p));
    const issues = [];
    if (res.status !== 200) issues.push(`status ${res.status}${res.headers.get("location") ? " -> " + res.headers.get("location") : ""}`);
    if (res.status === 200 && !/<title>[^<]+<\/title>/.test(html)) issues.push("no title");
    if (res.status === 200 && !/<meta name="description"/.test(html)) issues.push("no description");
    if (res.status === 200 && canon !== expected) issues.push(`canonical ${canon}`);
    if (issues.length) { bad++; console.log(`  ✗ ${p}  ${issues.join(", ")}`); }
    else console.log(`  ✓ ${p}`);
  } catch (e) {
    bad++;
    console.log(`  ✗ ${p}  ${e.message}`);
  }
}
for (const extra of ["/sitemap.xml", "/robots.txt"]) {
  const res = await fetch(base + extra);
  console.log(`  ${res.ok ? "✓" : "✗"} ${extra} (${res.status})`);
  if (!res.ok) bad++;
}
console.log(bad ? `\n${bad} problem(s). Do not switch DNS until these pass.\n` : "\nAll legacy URLs are live and correct.\n");
process.exit(bad ? 1 : 0);
