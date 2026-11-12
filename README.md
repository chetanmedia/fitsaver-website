# fitsaver.app

The Fitsaver website: a static Astro site with GSAP motion, hosted on Netlify.

```bash
npm install
npm run sync-framer   # one time (and again right before DNS cutover): pull posts + images from the Framer site
npm run dev           # http://localhost:4321
npm run build         # builds to dist/ and checks every legacy URL still exists
npm run check-live -- https://<site>.netlify.app   # check a deployed site
```

Moving the domain: `docs/CUTOVER.md`. Post format: `docs/DAILY-POSTS.md`. Daily blog automation: `content-engine/` (brief, scheduled task prompt, run log).

## Why it won't lose rankings

- **Same URLs.** Every path from the Framer sitemap is listed in `seo/url-inventory.json`, and `npm run build` fails if any of them is missing. Pages build as `/blog/slug.html`, so Netlify serves `/blog/slug` with no trailing-slash redirect, exactly like Framer.
- **Same titles and canonicals.** The homepage title is unchanged and posts keep `Title | Fitsaver`. Every page has a self-referencing canonical on `https://fitsaver.app`.
- **Fully prerendered.** All text is in the HTML. JavaScript only adds motion.
- **Better than before.** Each post now has its own meta description (Framer used one generic description for every page), plus BlogPosting, Breadcrumb and FAQPage structured data, a sitemap with `lastmod` dates, and an RSS feed.

## Design system

- **Black and lime, from the app.** The six marker colors (lime, teal, pink, blue, orange, violet) come from the app's Mark exercises timeline. On the site a colored dot always means one exercise or one item in a sequence.
- **One typeface, Poppins, self-hosted.** Light weight means saved and idle, bold means training. The hero's "Now train it." starts loose and tightens on load, like a pile of saves becoming a plan.
- **Phone screens are code, not screenshots.** They're rebuilt in HTML and CSS from the app's UI, so they stay sharp and can animate.

## Homepage sections (one continuous walk through the app)

| Section | What happens |
| --- | --- |
| Hero | A phone plays the real flow on loop: a finger swipes through reels, lands on a core workout whose captions name each exercise, taps Share, Instagram's Send to sheet opens, taps Share to…, the iOS sheet opens, taps FitSaver, the app opens from its icon, the import queue runs (5% to 100% with the real status lines), a "Workout Ready!" notification drops in, and the routine appears with the same five exercises. |
| The saved folder | Walls of saved reels drift past while the common problems pop up ("How many sets was that?"). |
| The breakdown | Pinned scroll story. The reel plays; each on-screen exercise caption is caught by scanner brackets, lifts off and flies into the routine as a step with reps, a clip thumbnail and its timestamp. Afterwards every step is clickable and jumps the reel to that exact moment. |
| How it works (7 steps, one phone), then 4 chapter sections | A single phone flies left and right in 3D through steps 1 to 7: share sheet, background import with notification, editing (reorder, log weight per set, add a set, form notes), set-based vs round-based, an interactive rep counter with Watch video, the rest timer, and Workout Complete with confetti and points. After step 7 the phone launches off the top of the screen, and Catalogs, Search, Programs and Progress each get their own section: the phone flies in on its own path (drop-in flip, spin from the side, rise from below, zoom with a spin), the feature plays inside it with an exaggerated scene behind it, then it flies out toward the next section: **Catalogs** (Organize, select two, Move to, Create New Catalog, type "Core workouts", Success, the new catalog lands on My Catalogs, while a ring of saved reels is pulled into the phone and "678 saved" counts down), **Search** (types "Morning workout", results filter, the catalog opens; the word types itself huge behind the phone and result cards burst out; visitors can type in the phone themselves), **Programs** (My Programs with Skipped and Completed, "+ Add workout to this day", the picker, "+", the workout drops onto Friday, hold to remove; giant day columns fill with workouts dropping from above), **Rankings** ("You" races up the leaderboard onto the podium, then Progress shows the streak and monthly stats; a huge points counter ticks up and podium blocks rise). |
| Free tools (`/tools`) | A workout generator (goal, focus, time, equipment; swap any exercise; shareable links) and a one rep max calculator (7 formulas, percentage and rep-max tables, a barbell that loads the right plates). Logic lives in `src/lib/generator.ts` and `src/lib/orm.ts`, shared by the prerendered HTML and the browser. |
| Everything else, proof, FAQ, blog, CTA | Remaining features, stats, testimonials, an FAQ with FAQPage data, the latest posts and a giant Start Workout button. |

The demo workout is defined once in `src/lib/demo.ts`. The reel is built from a licensed photo (a blog header image) cropped per exercise, not from any creator's footage. Leaderboard names are invented.

Everything respects `prefers-reduced-motion`, works with a keyboard, and pauses off-screen loops.

## Files

```
src/pages/            index, blog/index, blog/[...slug], legal pages, contact, sitemap.xml, robots.txt, rss.xml
src/content/blog/     posts (Markdown)
src/lib/              site constants, media helper, markdown plugin, post helpers
src/scripts/          site.ts (smooth scroll, header, scrubber, tracking), home.ts (all homepage motion)
src/styles/           global.css (tokens, type, prose), home.css, blog.css
src/components/       Header, Footer, Logo, Phone, Scrubber, Tracking, LegalPage
scripts/              sync-framer.mjs, verify-urls.mjs, check-live.mjs
seo/url-inventory.json
```

If you change `src/lib/rehype-fitsaver.mjs`, delete `.astro/` before building. Astro caches rendered Markdown.
