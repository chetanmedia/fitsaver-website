import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

export async function getPosts() {
  // Drafts and future-dated posts stay hidden in production builds.
  const now = Date.now() + 6 * 3600 * 1000; // a post dated "today" (UTC midnight) is live from the first build of that day
  return (await getCollection("blog", ({ data }) => import.meta.env.DEV || (!data.draft && data.date.valueOf() <= now))).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export function readingMinutes(body = "") {
  const words = body.replace(/<[^>]+>/g, " ").replace(/[#>*_\[\]()!`-]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** Pull Q&A pairs out of a "## Frequently asked questions" section for FAQPage structured data. */
export function extractFaq(body = "") {
  const head = body.match(/^##\s+(?:frequently asked questions|faqs?)\s*$/im);
  if (!head || head.index === undefined) return [];
  const after = body.slice(head.index + head[0].length);
  const next = after.search(/^##\s/m);
  const section = next >= 0 ? after.slice(0, next) : after;
  const out: { q: string; a: string }[] = [];
  const parts = section.split(/^###\s+/m).slice(1);
  for (const part of parts) {
    const [qLine, ...rest] = part.split("\n");
    const a = rest
      .join(" ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/[*_`\\]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const q = qLine.replace(/[*_`\\]/g, "").trim();
    if (q && a) out.push({ q, a });
  }
  return out;
}

/** Pick related posts: shared words in the title first, then the newest. */
export function related(all: Post[], current: Post, n = 3) {
  const stop = new Set(["the", "a", "and", "for", "to", "of", "how", "your", "with", "in", "it", "that", "you", "workout", "workouts", "what", "is", "do", "best"]);
  const words = (t: string) => new Set(t.toLowerCase().match(/[a-z0-9]+/g)?.filter((w) => !stop.has(w) && w.length > 2) || []);
  const mine = words(current.data.title);
  return all
    .filter((p) => p.id !== current.id)
    .map((p) => ({ p, score: [...words(p.data.title)].filter((w) => mine.has(w)).length }))
    .sort((a, b) => b.score - a.score || b.p.data.date.valueOf() - a.p.data.date.valueOf())
    .slice(0, n)
    .map((x) => x.p);
}
