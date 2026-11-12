# Moving fitsaver.app from Framer to Netlify

The goal: every URL Google knows keeps working, with the same path, title and canonical, so rankings carry over. Do the steps in order. Nothing here touches the live site until step 6.

## 0. What was captured on 12 Nov 2026

- 35 live URLs from the Framer sitemap: `/`, `/blog`, 29 posts, `/privay-policy`, `/privay-policy-2`, `/delete-account`, `/contact`. They're stored in `seo/url-inventory.json`.
- Every tracking tag on the Framer site, with the same IDs: GA4 `G-XYS1LG7L87`, Google Ads `AW-18043433852`, Plausible, Piqo, AppSight and DataFast. They're in `src/components/Tracking.astro`.
- No Google Search Console verification tag was on the Framer pages, so Search Console was verified another way (DNS, or a Google account link) and won't break when the host changes.

## 1. Content (done)

All 29 Framer posts are already in the project with their original dates, titles and URLs, and `npm run build` confirms all 35 legacy URLs exist. Images still load from Framer's CDN, so keep the Framer project (it can be unpublished from the domain, just don't delete it). Optional, on your Mac: `npm install && npm run sync-framer` downloads the images locally and picks up any post published on Framer after 12 Nov.

## 2. Put it on GitHub

Create an empty **public** repo named `chetanmedia/fitsaver-website` (public like the Movieshelf and Nasi sites, so Netlify builds aren't blocked). Claude can then push the project and switch the daily blog task to it. Or push it yourself:

```bash
git init && git add -A && git commit -m "Fitsaver site on Astro"
git branch -M main
git remote add origin https://github.com/chetanmedia/fitsaver-website.git
git push -u origin main
```

## 3. Create the Netlify site (no domain yet)

1. In Netlify, choose **Add new site**, then **Import an existing project**, then pick the repo. The build settings come from `netlify.toml`.
2. Wait for the deploy. You get a URL like `https://fitsaver-xyz.netlify.app`.
3. Check every legacy URL on that preview:
   ```bash
   npm run check-live -- https://fitsaver-xyz.netlify.app
   ```
   Every line must be ✓. Pay attention to the post with the curly apostrophe in its slug.
4. In Netlify, open **Forms** and enable form detection, then redeploy, so the contact form works.
5. Click through on your phone: the homepage animations, a few posts, the planner and the contact form.

## 4. Right before the switch

1. Run `npm run sync-framer` again to pick up the daily posts published since step 1. Commit and push.
2. **Switch the daily blog task to GitHub.** Ask Claude to switch the "Fitsaver daily blog post" scheduled task to the repo version (`content-engine/SCHEDULED-TASK.md`). From then on, new posts are pushed to the repo instead of Framer.
3. Leave the Framer site published. It's your instant rollback.

## 5. Add the domain in Netlify

In **Domain management**, add `fitsaver.app` and `www.fitsaver.app`, and set `fitsaver.app` as primary. Netlify shows the DNS records it needs.

## 6. Switch DNS (this is the moment of change)

At your domain registrar (or wherever the DNS for fitsaver.app is managed today):

- Apex `fitsaver.app`: replace Framer's A records with Netlify's (Netlify shows the exact value, currently `75.2.60.5`), or move DNS to Netlify DNS.
- `www`: CNAME to your `*.netlify.app` hostname.
- Keep any TXT records (Search Console, email) exactly as they are.

`.app` domains require HTTPS. Netlify issues the certificate as soon as DNS points to it, usually within minutes. Switch during a quiet hour.

## 7. Verify (same day)

```bash
npm run check-live -- https://fitsaver.app
```

Then in Google Search Console:

1. Submit `https://fitsaver.app/sitemap.xml` under **Sitemaps**.
2. Use **URL Inspection** on the homepage and your 3 to 5 best posts (for example `/blog/tiktok-workout-ideas` and `/blog/workout-reminders-and-scheduling`), then **Request indexing**.
3. Check that GA4, Plausible and DataFast all show live visitors.

## 8. Watch for 2 to 4 weeks

- Search Console **Pages**: watch for new "Not found (404)" entries. Any URL that shows up gets a 301 in `netlify.toml`.
- Search Console **Performance**: clicks and positions for your main queries should stay level. A small wobble in the first week is normal.
- After 2 weeks of stable numbers, remove the custom domain from Framer and downgrade the Framer plan. Keep the Framer project itself.

## Rollback

If something is badly wrong after step 6, point the DNS records back to Framer's values. Framer is still published, so the old site returns as soon as DNS propagates.
