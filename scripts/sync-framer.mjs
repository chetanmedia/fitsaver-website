#!/usr/bin/env node
/**
 * sync-framer.mjs
 *
 * Pulls every blog post from the live Framer site (fitsaver.app) into
 * src/content/blog/*.md, downloads every image into public/images/blog/,
 * and updates seo/url-inventory.json from the live sitemap.
 *
 * Safe to re-run any number of times before the DNS switch:
 *  - Posts that came from Framer (frontmatter `source: framer`) are refreshed.
 *  - Posts written on the new site (any other source) are never touched.
 *  - URLs are only ever ADDED to the inventory, never removed.
 *
 * Usage:
 *   npm run sync-framer                 # full sync from https://fitsaver.app
 *   npm run sync-framer -- --no-images  # keep images hotlinked to Framer's CDN
 *   npm run sync-framer -- --only <slug>
 *   node scripts/sync-framer.mjs --fixture path/to/page.html --slug <slug>  # offline test
 *
 * Run it from your own Terminal (it needs normal internet access).
 * Must be run BEFORE you point the domain at Netlify, while Framer still serves fitsaver.app.
 */
import { parse } from "node-html-parser";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = process.env.FRAMER_ORIGIN || "https://fitsaver.app";
const BLOG_DIR = path.join(ROOT, "src/content/blog");
const IMG_DIR = path.join(ROOT, "public/images/blog");
const INVENTORY = path.join(ROOT, "seo/url-inventory.json");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const NO_IMAGES = flag("--no-images");
const FIXTURE = opt("--fixture");
const ONLY = opt("--only") || opt("--slug");

const log = (...m) => console.log("  ", ...m);
const warn = (...m) => console.warn("  ⚠", ...m);

// ---------------------------------------------------------------- helpers

async function get(url, as = "text") {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "fitsaver-migration/1.0" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return as === "buffer" ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (e) {
      if (attempt === 3) throw new Error(`${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
}

const decodePath = (p) => { try { return decodeURI(p); } catch { return p; } };

/** File name for a post. Keeps it ASCII-safe; the real URL slug lives in frontmatter. */
const fileNameFor = (slug) =>
  slug.normalize("NFKD").replace(/[’']/g, "").replace(/[^a-zA-Z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") + ".md";

const yaml = (v) => JSON.stringify(v); // JSON strings are valid YAML scalars

/** Markdown-escape plain text. */
function esc(t) {
  return t
    .replace(/\\/g, "\\\\")
    .replace(/([*_`\[\]])/g, "\\$1")
    .replace(/</g, "&lt;")
    .replace(/ /g, " ");
}

/** Escape characters that would turn the start of a paragraph into block syntax. */
function escLineStart(s) {
  return s.replace(/^(\s*)(#{1,6}\s|>|[-+]\s|\d+[.)]\s)/, (m, sp, tok) => sp + "\\" + tok);
}

function cleanUrl(href) {
  if (!href) return href;
  let u = href.trim();
  if (u.startsWith(ORIGIN + "/")) u = u.slice(ORIGIN.length); // internal links become relative
  if (u === ORIGIN) u = "/";
  return u;
}

/** Framer image URLs carry width/height params; strip to the bare asset. */
const bareFramerImage = (src) => src.replace(/&amp;/g, "&").split("?")[0];

// ---------------------------------------------------------------- image handling

const imageJobs = new Map(); // remote url -> local public path

function localImage(remote) {
  if (!remote) return remote;
  const bare = bareFramerImage(remote);
  if (NO_IMAGES) return bare;
  if (!imageJobs.has(bare)) {
    const name = path.basename(new URL(bare).pathname);
    imageJobs.set(bare, `/images/blog/${name}`);
  }
  return imageJobs.get(bare);
}

async function downloadImages() {
  if (NO_IMAGES || imageJobs.size === 0) return;
  await fs.mkdir(IMG_DIR, { recursive: true });
  let fetched = 0, skipped = 0;
  for (const [remote, local] of imageJobs) {
    const dest = path.join(ROOT, "public", local);
    try { await fs.access(dest); skipped++; continue; } catch {}
    // Framer serves resized variants; 1600px is plenty for a 760px article column on retina.
    const url = /\.(jpe?g|png|webp)$/i.test(remote) ? `${remote}?scale-down-to=1600` : remote;
    try {
      await fs.writeFile(dest, await get(url, "buffer"));
      fetched++;
    } catch (e) {
      warn(`image failed, keeping remote URL: ${e.message}`);
      imageJobs.set(remote, remote);
    }
  }
  log(`images: ${fetched} downloaded, ${skipped} already present`);
}

// ---------------------------------------------------------------- HTML -> Markdown

function inline(node) {
  let out = "";
  for (const c of node.childNodes) {
    if (c.nodeType === 3) { out += esc(c.text); continue; }
    if (c.nodeType !== 1) continue;
    const tag = c.tagName?.toLowerCase();
    const inner = () => inline(c);
    const wrap = (mark) => {
      const t = inner();
      const m = t.match(/^(\s*)([\s\S]*?)(\s*)$/);
      return m[2] ? `${m[1]}${mark}${m[2]}${mark}${m[3]}` : t;
    };
    switch (tag) {
      case "strong": case "b": out += wrap("**"); break;
      case "em": case "i": out += wrap("*"); break;
      case "code": out += "`" + c.text + "`"; break;
      case "br": out += "  \n"; break;
      case "a": {
        const href = cleanUrl(c.getAttribute("href"));
        const t = inner().trim();
        out += href ? `[${t}](${href.replace(/\)/g, "%29").replace(/\(/g, "%28").replace(/ /g, "%20")})` : t;
        break;
      }
      case "img": out += `![${esc(c.getAttribute("alt") || "")}](${localImage(c.getAttribute("src"))})`; break;
      default: out += inner();
    }
  }
  return out;
}

function listToMd(listNode, ordered, depth = 0) {
  const lines = [];
  let n = 1;
  for (const li of listNode.childNodes) {
    if (li.nodeType !== 1 || li.tagName.toLowerCase() !== "li") continue;
    const marker = ordered ? `${n++}.` : "-";
    const pad = "   ".repeat(depth);
    const textParts = [];
    const nested = [];
    for (const c of li.childNodes) {
      if (c.nodeType === 1 && /^(ul|ol)$/i.test(c.tagName)) nested.push(listToMd(c, c.tagName.toLowerCase() === "ol", depth + 1));
      else if (c.nodeType === 1 && c.tagName.toLowerCase() === "p") textParts.push(inline(c).trim());
      else if (c.nodeType === 1) textParts.push(inline(c).trim());
      else if (c.nodeType === 3 && c.text.trim()) textParts.push(esc(c.text.trim()));
    }
    lines.push(`${pad}${marker} ${textParts.filter(Boolean).join(" ")}`);
    for (const nl of nested) lines.push(nl);
  }
  return lines.join("\n");
}

function blocks(container, warnings) {
  const out = [];
  for (const c of container.childNodes) {
    if (c.nodeType === 3) { if (c.text.trim()) out.push(escLineStart(esc(c.text.trim()))); continue; }
    if (c.nodeType !== 1) continue;
    const tag = c.tagName.toLowerCase();
    if (tag === "p") { const t = inline(c).trim(); if (t) out.push(escLineStart(t)); }
    else if (/^h[1-6]$/.test(tag)) {
      const level = Math.max(2, Number(tag[1])); // the page owns the only H1
      const t = inline(c).trim();
      if (t) out.push(`${"#".repeat(level)} ${t}`);
    }
    else if (tag === "ul" || tag === "ol") out.push(listToMd(c, tag === "ol"));
    else if (tag === "img") out.push(`![${esc(c.getAttribute("alt") || "")}](${localImage(c.getAttribute("src"))})`);
    else if (tag === "blockquote") out.push(blocks(c, warnings).split("\n").map((l) => "> " + l).join("\n"));
    else if (tag === "hr") out.push("---");
    else if (tag === "table") out.push(c.toString());
    else if (tag === "pre") out.push("```\n" + c.text.replace(/\n$/, "") + "\n```");
    else if (tag === "div" && c.classList.contains("framer-text-module")) {
      const html = c.toString();
      if (/apps\.apple\.com|play\.google\.com|data-framer-name="Mobile"/.test(html)) {
        out.push('<div data-app-cta></div>');
      } else {
        const iframe = c.querySelector("iframe");
        const yt = html.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/);
        if (yt) out.push(`<div data-youtube="${yt[1]}"></div>`);
        else if (iframe) out.push(`<iframe src="${iframe.getAttribute("src")}" loading="lazy" title="Embedded content"></iframe>`);
        else warnings.push("skipped an unknown embedded component");
      }
    }
    else out.push(blocks(c, warnings)); // plain wrappers
  }
  return out.filter(Boolean).join("\n\n");
}

/** Find the element that opens at `startIdx` and return its full outer HTML. */
function sliceElement(html, startIdx) {
  const re = /<\/?div\b[^>]*>/g;
  re.lastIndex = startIdx;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(startIdx, re.lastIndex);
  }
  return html.slice(startIdx);
}

function describe(md) {
  const firstPara = md.split("\n\n").find((b) => b && !/^(#|!\[|<|-|\d+\.)/.test(b)) || "";
  const plain = firstPara
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`\\]/g, "")
    .replace(/&lt;/g, "<")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= 158) return plain;
  const cut = plain.slice(0, 158);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > 120) return cut.slice(0, sentence + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "") + "…";
}

export function convertPostPage(html, slug) {
  const warnings = [];
  const root = parse(html, { comment: false });

  const h1 = root.querySelector("h1");
  const title = (h1?.text || "").replace(/\s+/g, " ").trim();

  const time = root.querySelector("time[datetime]");
  const date = time?.getAttribute("datetime") || null;

  const marker = 'data-framer-name="Content" data-framer-component-type="RichTextContainer"';
  const at = html.indexOf(marker);
  if (at < 0) throw new Error(`no rich-text content found for ${slug}`);
  const contentHtml = sliceElement(html, html.lastIndexOf("<div", at));

  // Header image: the first Framer image on the page that appears before the article body.
  const beforeBody = html.slice(0, at);
  const imgs = [...beforeBody.matchAll(/<img\b[^>]*\bsrc="(https:\/\/framerusercontent\.com\/images\/[^"]+)"[^>]*>/g)];
  const headerTag = imgs.find((m) => !/HVvGqiXSgeZ0RrNdWIiSP2zWs/.test(m[1]));
  const imageRemote = headerTag ? headerTag[1] : null;
  const imageAlt = headerTag ? (headerTag[0].match(/\balt="([^"]*)"/)?.[1] || "") : "";

  const body = blocks(parse(contentHtml, { comment: false }).firstChild, warnings).replace(/\n{3,}/g, "\n\n").trim();

  return {
    title,
    slug,
    date,
    description: describe(body),
    image: imageRemote ? localImage(imageRemote) : null,
    imageAlt: imageAlt || title,
    body,
    warnings,
  };
}

function toFile(post) {
  const fm = [
    "---",
    `title: ${yaml(post.title)}`,
    `slug: ${yaml(post.slug)}`,
    `date: ${yaml(post.date)}`,
    `description: ${yaml(post.description)}`,
    post.image ? `image: ${yaml(post.image)}` : null,
    `imageAlt: ${yaml(post.imageAlt)}`,
    `source: "framer"`,
    "---",
    "",
  ].filter((l) => l !== null);
  return fm.join("\n") + post.body + "\n";
}

async function existingSource(file) {
  try {
    const txt = await fs.readFile(file, "utf8");
    return txt.match(/^source:\s*"?([\w-]+)"?/m)?.[1] || "unknown";
  } catch { return null; }
}

// ---------------------------------------------------------------- main

async function main() {
  await fs.mkdir(BLOG_DIR, { recursive: true });

  if (FIXTURE) {
    if (!ONLY) throw new Error("--fixture needs --slug <slug>");
    const html = await fs.readFile(FIXTURE, "utf8");
    const post = convertPostPage(html, ONLY);
    await downloadImages();
    const dest = path.join(BLOG_DIR, fileNameFor(post.slug));
    await fs.writeFile(dest, toFile(post));
    log(`fixture -> ${path.relative(ROOT, dest)}`);
    post.warnings.forEach((w) => warn(w));
    return;
  }

  console.log(`\nSyncing from ${ORIGIN}\n`);
  const sitemap = await get(`${ORIGIN}/sitemap.xml`);
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => decodePath(new URL(m[1].replace(/&amp;/g, "&")).pathname.replace(/\/$/, "") || "/"));

  const inventory = JSON.parse(await fs.readFile(INVENTORY, "utf8"));
  const known = new Map(inventory.urls.map((u) => [u.path, u]));

  const blogPaths = paths.filter((p) => p.startsWith("/blog/") && (!ONLY || p === `/blog/${ONLY}`));
  let written = 0, protectedCount = 0, failed = 0;

  for (const p of blogPaths) {
    const slug = p.slice("/blog/".length);
    const dest = path.join(BLOG_DIR, fileNameFor(slug));
    const src = await existingSource(dest);
    if (src && src !== "framer") { protectedCount++; log(`kept (written on new site): ${slug}`); continue; }
    try {
      const html = await get(`${ORIGIN}${encodeURI(p)}`);
      const post = convertPostPage(html, slug);
      await fs.writeFile(dest, toFile(post));
      post.warnings.forEach((w) => warn(`${slug}: ${w}`));
      const pageTitle = html.match(/<title>([^<]*)<\/title>/)?.[1];
      known.set(p, { path: p, title: pageTitle ? pageTitle.replace(/&amp;/g, "&").replace(/&#x27;/g, "'") : `${post.title} | Fitsaver` });
      written++;
      log(`✓ ${slug}`);
    } catch (e) {
      failed++;
      warn(`FAILED ${slug}: ${e.message}`);
    }
  }

  for (const p of paths) if (!known.has(p)) known.set(p, { path: p, title: "" });

  // Homepage reel photos live on the same Framer CDN; bring them home too.
  const homeMedia = JSON.parse(await fs.readFile(path.join(ROOT, "src/lib/home-media.json"), "utf8"));
  for (const r of homeMedia.reels) localImage(`https://framerusercontent.com/images/${r.file}`);

  await downloadImages();

  inventory.capturedAt = new Date().toISOString().slice(0, 10);
  inventory.urls = [...known.values()];
  await fs.writeFile(INVENTORY, JSON.stringify(inventory, null, 2) + "\n");

  console.log(`\nDone: ${written} posts synced, ${protectedCount} protected, ${failed} failed. Inventory has ${inventory.urls.length} URLs.`);
  if (failed) { console.log("Re-run the command to retry the failed posts."); process.exitCode = 1; }
  else console.log("Next: npm run build  (this checks every live URL exists in the new site)\n");
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main().catch((e) => { console.error("\n✗", e.message); process.exit(1); });
