// Shared store-button markup, used by Astro components and by the markdown pipeline.
export const APP_STORE_URL = "https://apps.apple.com/us/app/fitsaver-workout-organizer/id6756478119";
export const playUrl = (campaign = "website") =>
  `https://play.google.com/store/apps/details?id=com.fitsaver.app&referrer=utm_source%3D${campaign === "website" ? "website" : "blog"}%26utm_campaign%3D${encodeURIComponent(campaign)}`;

const appleGlyph = `<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22"><path fill="currentColor" d="M16.37 12.62c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.65.8-3.33.8-.7 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.1 8.79.74 1.06 1.61 2.25 2.75 2.2 1.11-.04 1.53-.71 2.87-.71 1.33 0 1.71.71 2.88.69 1.19-.02 1.94-1.07 2.66-2.14.84-1.23 1.19-2.43 1.2-2.49-.03-.01-2.3-.88-2.34-3.53Zm-2.18-6.47c.6-.74 1.01-1.75.9-2.77-.87.04-1.95.59-2.58 1.32-.56.65-1.05 1.69-.92 2.68.98.08 1.98-.49 2.6-1.23Z"/></svg>`;

const playGlyph = `<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path fill="#4FE3D1" d="M4.2 2.3 13.6 12l-9.4 9.7a1.6 1.6 0 0 1-.7-1.3V3.6c0-.5.3-1 .7-1.3Z"/><path fill="#E2FF2E" d="m16.8 8.7-3.2 3.3 3.2 3.3 3.6-2a1.5 1.5 0 0 0 0-2.6l-3.6-2Z"/><path fill="#FF6BAE" d="M4.2 21.7c.4.3 1 .3 1.6 0l11-6.4-3.2-3.3-9.4 9.7Z"/><path fill="#5B8CFF" d="M5.8 2.3c-.6-.3-1.2-.3-1.6 0L13.6 12l3.2-3.3-11-6.4Z"/></svg>`;

export function storeBadgesHtml({ campaign = "website", size = "md" } = {}) {
  return `<div class="stores stores--${size}">
  <a class="store" href="${APP_STORE_URL}" target="_blank" rel="noopener" data-track="app_store">
    ${appleGlyph}<span class="store__txt"><small>Download on the</small><b>App Store</b></span>
  </a>
  <a class="store" href="${playUrl(campaign)}" target="_blank" rel="noopener" data-track="google_play">
    ${playGlyph}<span class="store__txt"><small>Get it on</small><b>Google Play</b></span>
  </a>
</div>`;
}
