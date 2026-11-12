import Lenis from "lenis";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------------------------------------------------- smooth scroll */
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 });
  (window as any).__lenis = lenis;
  const raf = (t: number) => { lenis!.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  // In-page anchors go through Lenis so they glide instead of jumping.
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href*='#']");
    if (!a) return;
    const url = new URL(a.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.querySelector(decodeURIComponent(url.hash));
    if (!target) return;
    e.preventDefault();
    lenis!.scrollTo(target as HTMLElement, { offset: -80, duration: 1.4 });
    history.replaceState(null, "", url.hash);
    closeMenu();
  });
}
export const getScrollY = () => (lenis ? lenis.scroll : window.scrollY);
const onScroll = (fn: () => void) => {
  if (lenis) lenis.on("scroll", fn);
  else window.addEventListener("scroll", fn, { passive: true });
};

/* -------------------------------------------------- header */
const header = document.querySelector<HTMLElement>("[data-header]")!;
const menuBtn = document.querySelector<HTMLButtonElement>("[data-menu]");
function closeMenu() {
  header.classList.remove("menu-open");
  menuBtn?.setAttribute("aria-expanded", "false");
}
menuBtn?.addEventListener("click", () => {
  const open = !header.classList.contains("menu-open");
  header.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll("#site-nav a").forEach((a) => a.addEventListener("click", closeMenu));

let lastY = 0;
function updateHeader() {
  const y = getScrollY();
  header.classList.toggle("is-scrolled", y > 24);
  const goingDown = y > lastY + 4;
  const goingUp = y < lastY - 4;
  if (goingDown && y > 400 && !header.classList.contains("menu-open")) header.classList.add("is-hidden");
  if (goingUp || y < 200) header.classList.remove("is-hidden");
  lastY = y;
}
onScroll(updateHeader);
updateHeader();

/* -------------------------------------------------- scrubber */
const scrub = document.querySelector<HTMLElement>("[data-scrubber]");
if (scrub) {
  const fill = scrub.querySelector<HTMLElement>("[data-fill]")!;
  const thumb = scrub.querySelector<HTMLElement>("[data-thumb]")!;
  const label = scrub.querySelector<HTMLElement>("[data-label]")!;
  const time = scrub.querySelector<HTMLElement>("[data-time]")!;
  const markersEl = scrub.querySelector<HTMLElement>("[data-markers]")!;
  const colors = ["--m1", "--m2", "--m3", "--m4", "--m5", "--m6"];
  const chapters = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
  const hiders = [...document.querySelectorAll<HTMLElement>("[data-hide-scrubber]")];
  const total = Number(document.body.dataset.duration || 60);
  let positions: { el: HTMLElement; at: number; name: string }[] = [];

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const layout = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    positions = chapters.map((el) => ({
      el,
      name: el.dataset.chapter || "",
      at: Math.min(1, Math.max(0, (el.getBoundingClientRect().top + getScrollY() - innerHeight * 0.35) / max)),
    }));
    markersEl.innerHTML = "";
    positions.forEach((p, i) => {
      const b = document.createElement("button");
      b.className = "scrubber__marker";
      b.style.left = `${p.at * 100}%`;
      b.style.setProperty("--m", `var(${colors[i % colors.length]})`);
      b.tabIndex = -1;
      b.title = p.name;
      b.addEventListener("click", () => (lenis ? lenis.scrollTo(p.el, { offset: -90 }) : p.el.scrollIntoView()));
      markersEl.appendChild(b);
    });
  };
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = getScrollY();
    const pr = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    fill.style.width = `${pr * 100}%`;
    thumb.style.left = `${pr * 100}%`;
    let current = positions[0]?.name || "";
    for (const p of positions) if (pr + 0.001 >= p.at) current = p.name;
    if (label.textContent !== current) label.textContent = current;
    time.textContent = `${fmt(pr * total)} / ${fmt(total)}`;
    const pinned = hiders.some((h) => { const r = h.getBoundingClientRect(); return r.top <= 1 && r.bottom >= innerHeight - 1; });
    scrub.classList.toggle("is-on", y > 160 && pr < 0.985 && chapters.length > 1 && !pinned);
    scrub.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => scrub.classList.add("is-idle"), 1800);
  };
  let idleTimer = 0;
  if (chapters.length > 1) {
    layout();
    update();
    onScroll(update);
    addEventListener("resize", () => { layout(); update(); });
    addEventListener("load", () => { layout(); update(); });
  }
}

/* -------------------------------------------------- store link taps (GA4 events) */
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("[data-track]");
  if (!a) return;
  (window as any).gtag?.("event", "store_click", {
    store: a.dataset.track,
    page_path: location.pathname,
    link_url: a.href,
  });
  (window as any).plausible?.("Store Click", { props: { store: a.dataset.track || "", page: location.pathname } });
});

/* Android visitors get Google Play on single "Get the app" buttons. */
if (/android/i.test(navigator.userAgent)) {
  document.querySelectorAll<HTMLAnchorElement>("[data-smart-store]").forEach((a) => {
    a.href = "https://play.google.com/store/apps/details?id=com.fitsaver.app&referrer=utm_source%3Dwebsite%26utm_campaign%3Dheader";
    a.dataset.track = "google_play";
  });
}

/* -------------------------------------------------- lite YouTube embeds in articles */
document.querySelectorAll<HTMLElement>(".yt[data-yt]").forEach((box) => {
  box.querySelector("button")?.addEventListener("click", () => {
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="YouTube video"></iframe>`;
  });
});

/* -------------------------------------------------- footer wordmark: letters stretch toward the pointer */
const wm = document.querySelector<HTMLElement>("[data-wordmark]");
if (wm && !reduce && matchMedia("(hover: hover)").matches) {
  const letters = [...wm.querySelectorAll<HTMLElement>("span")];
  wm.addEventListener("pointermove", (e) => {
    letters.forEach((l) => {
      const r = l.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      const k = Math.max(0, 1 - d / 420);
      l.style.transform = `translateY(${-k * 18}%)`;
      l.style.color = k > 0.55 ? "var(--lime)" : "";
    });
  });
  wm.addEventListener("pointerleave", () => letters.forEach((l) => { l.style.transform = ""; l.style.color = ""; }));
}
