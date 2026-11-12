# Fitsaver blog: automation brief

Rules for the daily blog task (and anyone writing a post by hand). The task reads this file first, every run.

- Site: https://fitsaver.app (Astro, built by Netlify on every push to `main`). Pushing to `main` IS publishing.
- Posts: `src/content/blog/<slug>.md`, one file per post. The URL is `/blog/<slug>` (no trailing slash).
- Calendar: the claude.ai Project "Fitsaver app website", doc `claude/fitsaver-content-calendar.csv` (columns: Publish date, Type, Title, Slug, Primary keyword, Volume (US), SEO difficulty, Secondary keywords, Cluster, Funnel, Fitsaver conversion hook, Topic cluster). It stays the single source of truth for what to write and when.
- Run log: `content-engine/blog-log.md`, one line per run.
- Format and components: `docs/DAILY-POSTS.md`.

## 1. Product facts (never contradict these)

- Fitsaver is a workout organizer for iPhone and Android.
- It imports workout **videos** from Instagram, TikTok, YouTube and Facebook. Users tap Share in those apps and pick Fitsaver, or paste the video link. Fitsaver analyzes the video, finds every exercise the creator shows (including the names written on screen), and builds a step-by-step routine with exercises, sets, reps and rest. Each exercise stays linked to its moment in the original video ("Watch video").
- Users can also paste plain workout text or build a routine by hand inside the app. It does NOT import from blog posts, websites, PDFs or screenshots. Never write "save this routine in Fitsaver", "add this workout to Fitsaver" or "import this page". The correct CTA: find a reel or video of the workout on Instagram, TikTok, YouTube or Facebook, share it to Fitsaver, then edit sets, reps and rest to match the plan in the post.
- In the app: rename, delete, reorder and add exercises; log weight per set and add sets; per-exercise notes; rest time settings; set-based or round-based workouts with a rep counter and rest timer; catalogs (for example Abs, Chest) with Organize / Move to / Create New Catalog; universal search across workouts and catalogs; Programs to plan the week (add a workout to a day, see completed or skipped, hold to remove); points, global rankings, streaks, monthly stats, achievements and history; Discover.
- Free plan: up to 5 imports. Premium: unlimited imports, advanced scheduling, detailed streak tracking. Do not mention prices.
- Do not claim calendar sync, wearable or Apple Watch integration, push reminders (other than the "Workout ready" import notification), offline mode, AI coaching plans, or any feature not listed here.
- Links: App Store https://apps.apple.com/us/app/fitsaver-workout-organizer/id6756478119 . Google Play https://play.google.com/store/apps/details?id=com.fitsaver.app&referrer=utm_source%3Dblog%26utm_campaign%3D<slug>

## 2. Topic variety rule

Never publish two posts from the same topic cluster within any 7-day window (refreshes count, since they move the post's date to today). Before choosing, list the posts in `src/content/blog/` dated in the previous 6 days and classify each into a cluster. Use the calendar's `Topic cluster` column for calendar rows; for other posts, classify by the main subject (a muscle group beats the setting).

Clusters: Abs & core · Glutes & legs · Upper body · Cardio & HIIT · Beginner plans, splits & schedules · Home & travel workouts · Full body, trending & band workouts · Mobility & recovery · Nutrition & meal prep · Motivation & consistency · Fitsaver app how-tos & social saves.

Choosing today's post:
1. Today's `New` row if its cluster is clear and its slug isn't already in `src/content/blog/`.
2. Otherwise the earliest upcoming `New` row (next 45 days) whose cluster is clear and slug isn't live; publish it and swap the two rows' Publish dates in the calendar (Projects `project_read`, edit, `project_write` the full CSV back).
3. If nothing is clear, publish nothing and report "skipped: topic variety rule".
Catch-up: also publish up to 2 older `New` rows whose slug isn't live, each in a different, clear cluster.

## 3. Writing

- 1,500 to 2,200 words. Audience: people who save workout videos and want a plan they will follow. Plain, confident, practical. American English.
- Primary keyword in the title (use the calendar title), the first paragraph and at least one H2. Secondary keywords used naturally.
- Structure: intro paragraph (no heading), H2 sections with H3s, lists where they help, a routine card section (H2 + a numbered list where every item starts with a bold label, e.g. `1. **Goblet squat:** 3 sets of 10 reps, 60 seconds rest`), the share-a-reel CTA paragraph, `## Frequently asked questions` with 3 to 5 `###` questions, a short closing H2 with App Store and Google Play links, then `## Sources and further reading`.
- One `<div data-app-cta></div>` 40 to 60% of the way down, between two H2 sections.
- Mention Fitsaver 2 to 4 times, mainly in the routine card CTA and the closing section. Follow the row's "Fitsaver conversion hook".
- 2 or 3 internal links to existing posts as `/blog/<slug>` (only slugs that exist in `src/content/blog/`). Link to the cluster pillar when one exists.
- Safe, standard exercise advice. No medical claims, no invented studies, statistics, quotes, testimonials or "case study" people. Don't name or link real creators or specific videos.
- No em dashes. Curly apostrophes and quotes (’ “ ”). Avoid "in today's fast-paced world", "game-changer", "unlock", "dive into".

## 4. Visuals and references

- Header image plus 2 or 3 inline images that match the topic (the right exercise or setting). No logos, celebrities, text overlays or mismatched exercises. Specific alt text (it becomes the visible caption).
- Image source: Unsplash photos found with the Framer connector's `api.images.search` (open the Fitsaver Framer project read-only and run a search in `exec`; do not change anything in Framer). Use the returned `images.unsplash.com` URL directly, ending in `&w=1600&q=80&auto=format` for inline images and `&w=2000&q=80&auto=format` for the header. If no image tool works, reuse the header image of a related existing post.
- 2 to 4 authoritative external references (CDC, NIH/MedlinePlus, Mayo Clinic, Cleveland Clinic, Harvard Health, ACE, ACSM, NHS, peer-reviewed journals, BPS Research Digest). Open each URL first and confirm it says what you cite (WebFetch, or Framer `exec` `fetch(url)` when needed). Link each in the sentence it supports and list them under "Sources and further reading".
- Verified references used so far: ACE ab-exercise study https://www.acefitness.org/about-ace/press-room/press-releases/246/ace-sponsored-study-reveals-best-and-worst-abdominal-exercises/ ; Harvard Health "Want a stronger core? Skip the sit-ups" https://www.health.harvard.edu/staying-healthy/want-a-stronger-core-skip-the-sit-ups ; CDC adult activity guidelines https://www.cdc.gov/physical-activity-basics/guidelines/adults.html ; BPS habit formation digest https://bps.org.uk/research-digest/how-form-habit .

## 5. Refresh rows

Refresh rows point at an existing post. Apply the topic variety rule; postpone if the cluster is used. Keep the slug. Add 1 or 2 H2 sections for the row's keywords, fix anything that breaks the product facts, bring it up to section 4, set `updated:` to today (and `date:` to today only if the row says to resurface it), and change `source:` to `"site"` so the Framer importer never overwrites it.
