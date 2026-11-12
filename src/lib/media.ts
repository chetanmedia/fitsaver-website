import fs from "node:fs";
import path from "node:path";
import homeMedia from "./home-media.json";

/**
 * Images that live on Framer's CDN today. After `npm run sync-framer` they are downloaded to
 * public/images/blog/ and the site serves them locally; until then we hotlink a resized copy.
 */
export function framerImg(file: string, width = 1024) {
  if (fs.existsSync(path.join(process.cwd(), "public/images/blog", file))) return `/images/blog/${file}`;
  return `https://framerusercontent.com/images/${file}?scale-down-to=${width}`;
}

/** Same rule for image paths stored in post frontmatter (either /images/blog/x or a Framer URL). */
export function postImg(src: string | undefined, width = 1024) {
  if (!src) return undefined;
  const m = src.match(/framerusercontent\.com\/images\/([^?]+)/);
  if (m) return framerImg(m[1], width);
  return src;
}

export type Reel = (typeof homeMedia.reels)[number];
export const reels = homeMedia.reels.map((r) => ({ ...r, src: framerImg(r.file, 720) }));
