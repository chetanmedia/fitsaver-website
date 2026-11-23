// Rehype plugin: turns plain markdown output into Fitsaver's designed article components.
import { storeBadgesHtml } from "./store-badges.mjs";
import fs from "node:fs";
import path from "node:path";

const MARKERS = ["#E2FF2E", "#4FE3D1", "#FF6BAE", "#5B8CFF", "#FF8E3C", "#A98BFF"];

const text = (node) =>
  node.type === "text" ? node.value : (node.children || []).map(text).join("");

const cls = (node, name) => {
  const c = node.properties.className || [];
  node.properties.className = [...(Array.isArray(c) ? c : [c]), name];
};

function appCta(campaign) {
  return {
    type: "raw",
    value: `<aside class="app-cta" aria-label="Get the Fitsaver app">
  <div class="app-cta__copy">
    <p class="app-cta__lead">Found a workout reel you like?</p>
    <p class="app-cta__title">Share it to Fitsaver and it becomes a routine with sets, reps and rest timers.</p>
    ${storeBadgesHtml({ campaign, size: "sm" })}
  </div>
  <div class="app-cta__art" aria-hidden="true">
    <div class="mini-routine">
      ${["Crunch", "Toe-touch crunch", "Ab wheel rollout"]
        .map((n, i) => `<div class="mini-routine__row"><span class="mini-routine__n" style="--m:${MARKERS[i]}">${i + 1}</span><span>${n}<small>3 sets</small></span></div>`)
        .join("")}
      <div class="mini-routine__start">Start Workout</div>
    </div>
  </div>
</aside>`,
  };
}

/** Compact app strip after the intro. Shown only where the sticky sidebar card is hidden (phones, tablets). */
function appStrip(campaign) {
  return {
    type: "raw",
    value: `<aside class="app-strip" aria-label="Get the Fitsaver app">
  <p class="app-strip__copy"><b>Saw a workout like this on Instagram or TikTok?</b> Share it to Fitsaver and it becomes a routine with sets, reps and rest timers.</p>
  ${storeBadgesHtml({ campaign: `${campaign}-top`, size: "sm" })}
</aside>`,
  };
}

function youtube(id) {
  return {
    type: "raw",
    value: `<div class="yt" data-yt="${id}"><button type="button" class="yt__btn" aria-label="Play video"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async"><span class="yt__play"></span></button></div>`,
  };
}

/** A list where every item starts with a bold label ("Crunch:") is a routine card. */
function isRoutineList(ol) {
  const items = ol.children.filter((c) => c.type === "element" && c.tagName === "li");
  if (items.length < 3) return false;
  return items.every((li) => {
    const first = (li.children || []).find((c) => c.type === "element" || (c.type === "text" && c.value.trim()));
    const host = first && first.type === "element" && first.tagName === "p" ? first.children.find((c) => c.type === "element" || c.value?.trim()) : first;
    return host && host.type === "element" && host.tagName === "strong";
  });
}

export function rehypeFitsaver() {
  return (tree, file) => {
    const slug = file?.data?.astro?.frontmatter?.slug || "blog";
    let lastH2 = "";

    // Experiment (from 23 Nov 2026): app strip after the first real paragraph, mobile only.
    const top = tree.children || [];
    const first = top.findIndex((n) => n.type === "element" && n.tagName === "p" && text(n).trim().length > 80);
    if (first !== -1 && first < 6) top.splice(first + 1, 0, appStrip(slug));

    const walk = (parent) => {
      const kids = parent.children || [];
      for (let i = 0; i < kids.length; i++) {
        const node = kids[i];
        // Raw HTML written in markdown arrives unparsed; handle our two embed markers here.
        if (node.type === "raw") {
          if (/data-app-cta/.test(node.value)) kids[i] = appCta(slug);
          else {
            const yt = node.value.match(/data-youtube="([\w-]{11})"/);
            if (yt) kids[i] = youtube(yt[1]);
          }
          continue;
        }
        if (node.type !== "element") continue;
        const p = node.properties || (node.properties = {});

        if (node.tagName === "h2") {
          lastH2 = text(node).toLowerCase();
          // Each H2 becomes a chapter marker on the page scrubber.
          p.dataChapter = text(node).replace(/\s+/g, " ").trim().slice(0, 48);
        }

        if (node.tagName === "div" && p.dataAppCta !== undefined) { kids[i] = appCta(slug); continue; }
        if (node.tagName === "div" && p.dataYoutube) { kids[i] = youtube(String(p.dataYoutube)); continue; }

        if (node.tagName === "img") {
          p.loading = "lazy";
          p.decoding = "async";
          // Images still on Framer's CDN: serve the local copy if sync-framer downloaded it, else a resized CDN version.
          const m = typeof p.src === "string" && p.src.match(/^https:\/\/framerusercontent\.com\/images\/([^?]+)$/);
          if (m) {
            const local = path.join(process.cwd(), "public/images/blog", m[1]);
            p.src = fs.existsSync(local) ? `/images/blog/${m[1]}` : `${p.src}?scale-down-to=1600`;
          }
        }

        if (node.tagName === "a" && typeof p.href === "string" && /^https?:\/\//.test(p.href) && !/^https:\/\/fitsaver\.app/.test(p.href)) {
          p.target = "_blank";
          p.rel = "noopener";
        }

        if (node.tagName === "ol" && parent.type === "root" && isRoutineList(node)) {
          cls(node, "routine");
          let n = 0;
          for (const li of node.children) if (li.type === "element") li.properties.style = `--m:${MARKERS[n++ % MARKERS.length]}`;
        }

        if (node.tagName === "ul" && parent.type === "root" && /sources|further reading|references/.test(lastH2)) cls(node, "sources");

        // Paragraph that only wraps an image -> figure, with the alt text as a visible caption.
        if (node.tagName === "p" && node.children.length === 1 && node.children[0].tagName === "img") {
          const img = node.children[0];
          node.tagName = "figure";
          const alt = img.properties.alt;
          if (alt) node.children.push({ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: alt }] });
        }

        walk(node);
      }
    };
    walk(tree);
  };
}
