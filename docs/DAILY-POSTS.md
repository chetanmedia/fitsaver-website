# Daily blog posts

All 29 Framer posts are already in `src/content/blog/` with their original dates and URLs (`source: "framer"`).

A post is a Markdown file in `src/content/blog/`. Pushing it to `main` on GitHub (chetanmedia/fitsaver-website) triggers a Netlify build, and the post is live in about two minutes. The daily scheduled task does this automatically; its rules are in `content-engine/AUTOMATION-BRIEF.md` and its prompt in `content-engine/SCHEDULED-TASK.md`.

If a post is published on Framer before the scheduled task is switched over, `npm run sync-framer` pulls it across.

## File

`src/content/blog/<slug>.md`

```markdown
---
title: "Leg Day Workout: The Exercises That Matter"
slug: "leg-day-workout-the-exercises-that-matter"
date: "2026-12-12T00:00:00.000Z"   # today, midnight UTC. Future dates stay hidden until that day's build
description: "One or two sentences, 120 to 158 characters, with the primary keyword. Used for Google and social previews."
image: "https://images.unsplash.com/photo-XXXXXXXX?...&w=2000&q=80&auto=format"
imageAlt: "Specific description of the header photo"
source: "site"
---
Intro paragraph with the primary keyword (no heading).

## First H2

Text with **bold** and [links](https://fitsaver.app/blog/other-post).

![Specific alt text](/images/blog/leg-day-inline-1.jpg)

<div data-app-cta></div>

## Leg day routine card

1. **Back squat:** 4 sets of 6 to 8 reps, 2 minutes rest
2. **Romanian deadlift:** 3 sets of 8 to 10 reps, 90 seconds rest
3. **Walking lunge:** 3 sets of 10 steps per leg, 60 seconds rest

## Frequently asked questions

### Question one?

Short answer.

## Sources and further reading

- [CDC: Adult physical activity guidelines](https://www.cdc.gov/physical-activity-basics/guidelines/adults.html)
```

## What the site does with it

| You write | The site renders |
| --- | --- |
| `<div data-app-cta></div>` | The in-article app card with App Store and Google Play buttons (use one per post, about halfway down) |
| An ordered list where every item starts with a **bold label:** | An app-style routine card with numbered lime circles |
| A list under an H2 named "Sources and further reading" | The styled sources list |
| H3 questions under "Frequently asked questions" | FAQPage structured data for Google, generated automatically |
| Each `##` heading | A chapter marker on the page's scrubber bar |
| An image on its own line | A captioned figure (the alt text becomes the caption) |
| `<div data-youtube="VIDEO_ID"></div>` | A click-to-play YouTube embed that doesn't slow the page |

## Rules

- `slug` sets the URL (`/blog/<slug>`). Never change it after publishing.
- `source: "site"` matters. It tells `sync-framer` never to overwrite this post.
- Put images in `public/images/blog/` (JPG or WebP, about 1600px wide, under 400 KB) and reference them as `/images/blog/<file>`.
- Internal links can be absolute (`https://fitsaver.app/blog/...`) or relative (`/blog/...`).
- `npm run build` must pass before pushing. It fails if a legacy URL goes missing.

## Images

Either an Unsplash URL (found with the Framer connector's image search, used directly) or a file in `public/images/blog/` referenced as `/images/blog/<file>`. Framer CDN URLs from the migrated posts keep working; `npm run sync-framer` can download them locally.
