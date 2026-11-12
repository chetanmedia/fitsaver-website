import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CORE } from "../lib/demo";

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = (window as any).__lenis;
if (lenis) lenis.on("scroll", ScrollTrigger.update);

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeIO = gsap.parseEase("power3.inOut");
const MARK = ["#E2FF2E", "#4FE3D1", "#FF6BAE", "#5B8CFF", "#FF8E3C", "#A98BFF"];
const SEG = CORE.segments;
const isMobile = () => innerWidth < 860;

/** Center of an element relative to an ancestor, ignoring CSS transforms. */
function rel(el: HTMLElement, root: HTMLElement) {
  let x = 0, y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}
function setSeg(img: HTMLElement, i: number) {
  img.style.setProperty("--pos", SEG[i].pos);
  img.style.setProperty("--z", String(SEG[i].zoom));
}
function tapFx(el: HTMLElement) {
  el.classList.remove("is-tap");
  void el.offsetWidth;
  el.classList.add("is-tap");
}

/* =================================================================== HERO INTRO */

function splitChars(el: HTMLElement) {
  const text = el.textContent || "";
  el.setAttribute("aria-label", text);
  el.innerHTML = text
    .split(/(\s+)/)
    .map((w) => (/^\s+$/.test(w) ? " " : `<span aria-hidden="true" style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch">${c}</span>`).join("")}</span>`))
    .join("");
}

const heroPhone = $("[data-hero-phone]");
if (!reduce) {
  const l1 = $(".hero__l1"), l2 = $(".hero__l2");
  splitChars(l1);
  splitChars(l2);
  gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 })
    .from($$(".ch", l1), { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.025 })
    .from($$(".ch", l2), { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.03 }, 0.25)
    // The second line starts loose and tightens: a pile of saves becoming a plan.
    .fromTo(l2, { letterSpacing: "0.12em" }, { letterSpacing: "-0.05em", duration: 1.6, ease: "power4.inOut" }, 0.45)
    .from(".hero__lede", { y: 24, opacity: 0, duration: 1 }, 0.7)
    .from(".hero__body .stores .store", { y: 20, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.85)
    .from(".hero__proof", { opacity: 0, duration: 1 }, 1.05)
    .from(heroPhone, { y: 140, rotateX: 26, rotateZ: -6, opacity: 0, duration: 1.8 }, 0.35)
    .from(".hero__feed", { opacity: 0, duration: 2 }, 0.6)
    .add(() => startHero(), 1.4);

  const hero = $(".hero");
  gsap.set(heroPhone, { transformPerspective: 1100 });
  const rx = gsap.quickTo(heroPhone, "rotationX", { duration: 0.9, ease: "power3.out" });
  const ry = gsap.quickTo(heroPhone, "rotationY", { duration: 0.9, ease: "power3.out" });
  if (matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", (e) => { ry((e.clientX / innerWidth - 0.5) * 14); rx(-(e.clientY / innerHeight - 0.5) * 9); });
    hero.addEventListener("pointerleave", () => { rx(0); ry(0); });
  }
  gsap.to(".hero__stage", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__title", { opacity: 0.15, y: -60, ease: "none", scrollTrigger: { trigger: ".hero", start: "20% top", end: "bottom top", scrub: true } });
} else {
  $('[data-hs="feed"]', heroPhone).classList.remove("is-on");
  $('[data-hs="routine"]', heroPhone).classList.add("is-on");
}

/* =================================================================== HERO DEMO: reel, share, import, routine */

function startHero() {
  const scr = $(".phone__screen", heroPhone);
  const H = (n: string) => $(`[data-hs="${n}"]`, heroPhone);
  const feed = H("feed"), ig = H("ig"), ios = H("ios"), splash = H("splash"), launch = H("launch"), queue = H("queue"), notif = H("notif"), routine = H("routine");
  const stack = $("[data-hs-stack]", heroPhone);
  const coreImg = $("[data-hs-core]", heroPhone);
  const cover = $("[data-hs-cover]", heroPhone);
  const cap = $("[data-hs-cap]", heroPhone);
  const prog = $("[data-hs-progress]", heroPhone);
  const finger = $("[data-finger]", heroPhone);
  const fade = $("[data-hs-fade]", heroPhone);
  const qThumb = $("[data-q-thumb]", heroPhone);
  const qName = $("[data-q-name]", heroPhone);
  const qStatus = $("[data-q-status]", heroPhone);
  const qPct = $("[data-q-pct]", heroPhone);
  const qBar = $("[data-q-bar]", heroPhone);
  const rows = $$("[data-hs-row]", heroPhone);
  const shareBtn = $("[data-hs-share]", heroPhone);
  const shareTo = $("[data-hs-shareto]", heroPhone);
  const fsTile = $("[data-hs-fs]", heroPhone);
  const chips = { a: $("[data-chip='a']"), b: $("[data-chip='b']"), c: $("[data-chip='c']") };
  const show = (el: HTMLElement, on: boolean) => el.classList.toggle("is-on", on);

  const fingerTo = (tl: gsap.core.Timeline, target: () => HTMLElement, at: number, dur = 0.55) =>
    tl.to(finger, { x: () => rel(target(), scr).x, y: () => rel(target(), scr).y, opacity: 1, duration: dur, ease: "power2.inOut" }, at);
  const tap = (tl: gsap.core.Timeline, at: number) =>
    tl.add(() => tapFx(finger), at).to(finger, { scale: 0.78, duration: 0.11, yoyo: true, repeat: 1, ease: "power2.inOut" }, at);
  const chip = (tl: gsap.core.Timeline, el: HTMLElement, at: number, out: number) =>
    tl.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(2)" }, at).to(el, { opacity: 0, y: -8, duration: 0.35 }, out);

  const statuses: [number, string][] = [[5, "Getting details"], [25, "Assessing your workout"], [50, "Adapting the workout for you"], [75, "Analyzing everything"], [100, "Finalizing now"]];

  const build = () => {
    const W = scr.offsetWidth, Ht = scr.offsetHeight;
    const tl = gsap.timeline({ onComplete: () => { loop = build(); } });
    tl.add(() => {
      gsap.set(ig, { y: 0, yPercent: 105 });
      gsap.set(ios, { y: 0, yPercent: 115 });
      gsap.set(notif, { y: 0, yPercent: -150 });
      gsap.set(stack, { yPercent: 0 });
      gsap.set(feed, { scale: 1, y: 0, borderRadius: 0 });
      gsap.set(splash, { autoAlpha: 0, scale: 1 });
      [launch, queue, routine].forEach((el) => { show(el, false); gsap.set(el, { clearProps: "opacity,visibility,transform" }); });
      show(feed, true);
      gsap.set(finger, { x: W * 0.55, y: Ht * 0.74, opacity: 0, scale: 1 });
      cover.style.opacity = "1";
      cap.textContent = "";
      setSeg(coreImg, 0);
      gsap.set(prog, { width: "0%" });
      qThumb.classList.remove("is-img");
      qName.textContent = "Instagram · reel/C9xF2kq";
      qStatus.textContent = statuses[0][1];
      qPct.textContent = "5%";
      gsap.set(qBar, { width: "5%" });
      gsap.set(rows, { opacity: 0, y: 14 });
    });
    // Swipe through two reels.
    tl.to(finger, { opacity: 1, duration: 0.3 }, 0.2);
    [0, 1].forEach((k) => {
      const t = 0.5 + k * 1.15;
      tl.to(finger, { y: Ht * 0.3, duration: 0.45, ease: "power2.in" }, t)
        .to(stack, { yPercent: (-100 / 3) * (k + 1), duration: 0.6, ease: "power3.inOut" }, t + 0.1)
        .set(finger, { y: Ht * 0.74 }, t + 0.75);
    });
    tl.to(finger, { opacity: 0, duration: 0.25 }, 2.55);
    chip(tl, chips.a, 2.6, 8.4);
    // The core reel plays: cover, then each exercise caption.
    tl.to(prog, { width: "62%", duration: 3.4, ease: "none" }, 2.6);
    tl.add(() => { cover.style.opacity = "0"; }, 3.3);
    [0, 1, 2].forEach((i) => tl.add(() => { cap.textContent = SEG[i].cap; setSeg(coreImg, i); }, 3.3 + i * 0.9));
    // Tap Share: Instagram's Send to sheet.
    fingerTo(tl, () => shareBtn, 5.6);
    tap(tl, 6.2);
    tl.to(ig, { yPercent: 0, duration: 0.55, ease: "expo.out" }, 6.35)
      .to(feed, { scale: 0.62, y: Ht * 0.02, borderRadius: 18, duration: 0.55, ease: "expo.out" }, 6.35);
    // Tap Share to…: the iOS share sheet.
    fingerTo(tl, () => shareTo, 7.0);
    tap(tl, 7.6);
    tl.to(ig, { yPercent: 105, duration: 0.4, ease: "power3.in" }, 7.75)
      .to(feed, { scale: 1, y: 0, borderRadius: 0, duration: 0.45, ease: "power3.inOut" }, 7.75)
      .to(ios, { yPercent: 0, duration: 0.55, ease: "expo.out" }, 8.05);
    // Tap FitSaver: the app opens from its icon.
    fingerTo(tl, () => fsTile, 8.65);
    tap(tl, 9.25);
    tl.to(finger, { opacity: 0, duration: 0.2 }, 9.45)
      .add(() => { const p = rel(fsTile, scr); gsap.set(splash, { transformOrigin: `${p.x}px ${p.y}px` }); }, 9.4)
      .fromTo(splash, { autoAlpha: 1, scale: 0.12 }, { scale: 1, duration: 0.5, ease: "expo.inOut" }, 9.4)
      .add(() => { show(launch, true); show(feed, false); gsap.set(ios, { yPercent: 115 }); }, 10.0)
      .to(splash, { autoAlpha: 0, duration: 0.3 }, 10.0)
      .add(() => show(queue, true), 10.7)
      .fromTo(queue, { xPercent: 8, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 10.7)
      .add(() => show(launch, false), 11.2);
    chip(tl, chips.b, 10.9, 14.2);
    const pct = { v: 5 };
    tl.to(pct, {
      v: 100, duration: 3.1, ease: "none",
      onUpdate: () => {
        const v = Math.round(pct.v);
        qPct.textContent = `${v}%`;
        qStatus.textContent = [...statuses].reverse().find(([n]) => v >= n)![1];
        qBar.style.width = `${v}%`;
        if (v >= 25 && !qThumb.classList.contains("is-img")) { qThumb.classList.add("is-img"); qName.textContent = "Imported Workout"; }
      },
    }, 11.0);
    // "Workout Ready!" notification, tap it, the routine slides in.
    tl.to(notif, { yPercent: 0, duration: 0.6, ease: "back.out(1.6)" }, 14.2);
    fingerTo(tl, () => notif, 14.7, 0.5);
    tap(tl, 15.25);
    tl.to(notif, { yPercent: -150, duration: 0.35, ease: "power3.in" }, 15.4)
      .to(finger, { opacity: 0, duration: 0.2 }, 15.4)
      .add(() => show(routine, true), 15.5)
      .fromTo(routine, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: "expo.out" }, 15.5)
      .to(rows, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: "back.out(1.6)" }, 15.8);
    chip(tl, chips.c, 16.2, 19.3);
    tl.to(fade, { opacity: 1, duration: 0.4 }, 19.4)
      .add(() => { show(routine, false); show(queue, false); }, 19.8)
      .to(fade, { opacity: 0, duration: 0.4 }, 19.9)
      .set({}, {}, 20.3);
    return tl;
  };
  let loop = build();
  ScrollTrigger.create({ trigger: ".hero", start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? loop.resume() : loop.pause()) });
}

/* =================================================================== SAVED FOLDER */

if (!reduce) {
  $$("[data-wall-row]").forEach((row, i) => {
    gsap.fromTo(row, { x: i % 2 ? -260 : 0 }, { x: i % 2 ? 0 : -260, ease: "none", scrollTrigger: { trigger: ".saved", start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.from("[data-thought]", { y: 26, opacity: 0, scale: 0.9, duration: 0.7, stagger: 0.12, ease: "back.out(2)", scrollTrigger: { trigger: ".saved__thoughts", start: "top 88%" } });
  gsap.from(".saved__b", { opacity: 0, y: 20, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".saved__title", start: "top 75%" } });
}

/* =================================================================== THE BREAKDOWN */

(() => {
  const sec = $(".bd");
  const stage = $("[data-bd-stage]");
  const img = $("[data-bd-img]");
  const cover = $("[data-bd-cover]");
  const capBox = $("[data-bd-cap]");
  const capText = $("[data-bd-captext]");
  const badge = $("[data-bd-badge]");
  const fill = $("[data-bd-fill]");
  const thumb = $("[data-bd-thumb]");
  const label = $("[data-bd-label]");
  const time = $("[data-bd-time]");
  const count = $("[data-bd-count]");
  const hint = $("[data-bd-hint]");
  const marks = $$("[data-bd-mark]");
  const rows = $$("[data-bd-row]");
  const ghosts = $$("[data-bd-ghost]");
  const N = SEG.length;
  const START = 0.06, END = 0.86, LEN = (END - START) / N;
  let from: { x: number; y: number }[] = [];
  let to: { x: number; y: number }[] = [];
  let picked: number | null = null;
  let lastP = 0;
  let trig: ScrollTrigger | null = null;

  const measure = () => {
    const s = stage.getBoundingClientRect();
    const c = capBox.getBoundingClientRect();
    from = ghosts.map((g) => ({ x: c.left + c.width / 2 - s.left - g.offsetWidth / 2, y: c.top + c.height / 2 - s.top - g.offsetHeight / 2 }));
    to = rows.map((r) => { const t = $(".t", r).getBoundingClientRect(); return { x: t.left - s.left - 6, y: t.top - s.top - 2 }; });
  };

  const render = (p: number) => {
    lastP = p;
    const done = p >= END;
    const started = p >= START;
    cover.style.opacity = started ? "0" : "1";
    capBox.style.opacity = started ? "1" : "0";
    const cur = Math.min(N - 1, Math.max(0, Math.floor((p - START) / LEN)));
    const local = clamp01((p - START - cur * LEN) / LEN);
    let revealed = 0;
    rows.forEach((r, i) => {
      const li = clamp01((p - START - i * LEN) / LEN);
      const landed = started && (done || i < cur || (i === cur && li >= 0.78));
      r.classList.toggle("is-in", landed);
      if (landed) revealed++;
      const g = ghosts[i];
      if (!from[i] || done || !started || i !== cur || li < 0.22 || li >= 0.82) { g.style.opacity = "0"; return; }
      const t = easeIO(clamp01((li - 0.22) / 0.56));
      const x = lerp(from[i].x, to[i].x, t);
      const y = lerp(from[i].y, to[i].y, t) - Math.sin(t * Math.PI) * 40;
      g.style.opacity = String(li > 0.74 ? (0.82 - li) / 0.08 : 1);
      g.style.transform = `translate(${x}px, ${y}px) scale(${1 - 0.12 * t})`;
    });
    count.textContent = String(revealed);
    marks.forEach((m, i) => m.classList.toggle("is-on", started && (done || i < cur || (i === cur && local > 0.15))));
    badge.style.opacity = !done && p > 0.01 ? "1" : "0";
    hint.classList.toggle("is-on", done);
    if (done) {
      const i = picked ?? N - 1;
      setSeg(img, i);
      capText.textContent = SEG[i].cap;
      capBox.style.setProperty("--scan", "0");
      const pos = (SEG[i].start / CORE.length) * 100 + 2;
      fill.style.width = `${pos}%`;
      thumb.style.left = `${pos}%`;
      label.textContent = SEG[i].name;
      label.style.color = MARK[i];
      time.textContent = `0:${String(SEG[i].start).padStart(2, "0")}`;
      rows.forEach((r, k) => r.classList.toggle("is-active", k === i && picked !== null));
    } else if (started) {
      setSeg(img, cur);
      capText.textContent = SEG[cur].cap;
      capBox.style.setProperty("--scan", local > 0.08 && local < 0.62 ? "1" : "0");
      const pos = ((cur + local) / N) * 100;
      fill.style.width = `${pos}%`;
      thumb.style.left = `${pos}%`;
      label.textContent = local > 0.15 ? SEG[cur].name : "Reading…";
      label.style.color = MARK[cur];
      time.textContent = `0:${String(Math.floor((cur + local) * 4)).padStart(2, "0")}`;
      rows.forEach((r) => r.classList.remove("is-active"));
    } else {
      setSeg(img, 0);
      fill.style.width = "0%";
      thumb.style.left = "0%";
      label.textContent = "Full video";
      label.style.color = "";
      time.textContent = "0:00";
    }
  };

  rows.forEach((r, i) => {
    $("button", r).addEventListener("click", () => {
      picked = i;
      if (lastP < END && lenis && trig) lenis.scrollTo(trig.start + (trig.end - trig.start) * (END + 0.02), { duration: 1.2 });
      render(Math.max(lastP, END));
      gsap.fromTo(img, { filter: "brightness(1.8)" }, { filter: "brightness(1)", duration: 0.6 });
    });
  });

  measure();
  if (reduce) { render(1); return; }
  trig = ScrollTrigger.create({
    trigger: sec, start: "top top", end: "bottom bottom",
    onUpdate: (s) => render(s.progress),
    onRefresh: (s) => { measure(); render(s.progress); },
  });
  render(0);
})();

/* =================================================================== HOW IT WORKS: one phone flies between steps */

const timer = (() => {
  const s = $('[data-fs="4"]');
  const btn = $<HTMLButtonElement>("[data-tm-complete]", s);
  const countEl = $("[data-tm-count]", s);
  const nameEl = $("[data-tm-name]", s);
  const goalEl = $("[data-tm-goal]", s);
  const metaEl = $("[data-tm-meta]", s);
  const prog = $("[data-tm-prog]", s);
  const clip = $("[data-tm-clip]", s);
  const clipImg = $("[data-tm-clipimg]", s);
  const clipCap = $("[data-tm-clipcap]", s);
  const clipThumb = $("[data-tm-clipthumb]", s);
  const clipLabel = $("[data-tm-cliplabel]", s);
  const video = $("[data-tm-video]", s);
  let ex = 0, set = 1, n = 0, auto: number | null = null, user = false, ticks = 0;
  const render = () => {
    const p = SEG[ex];
    nameEl.textContent = p.name;
    goalEl.textContent = `${p.reps} reps`;
    metaEl.textContent = `Set ${set}/3 · Exercise ${ex + 1}/${SEG.length}`;
    countEl.textContent = String(n);
    prog.style.width = `${((ex * 3 + set - 1) / (SEG.length * 3)) * 100 + 4}%`;
  };
  const step = () => {
    n++;
    gsap.fromTo(countEl, { scale: 1.3 }, { scale: 1, duration: 0.35, ease: "back.out(3)" });
    if (n >= SEG[ex].reps) { n = 0; set++; if (set > 3) { set = 1; ex = (ex + 1) % SEG.length; } }
    render();
  };
  const openClip = () => {
    setSeg(clipImg, ex);
    clipCap.textContent = SEG[ex].cap;
    clipLabel.textContent = SEG[ex].name;
    clipLabel.style.color = MARK[ex];
    gsap.timeline()
      .set(clipThumb, { left: "2%" })
      .to(clip, { autoAlpha: 1, duration: 0.3 })
      .to(clipThumb, { left: `${(SEG[ex].start / CORE.length) * 100 + 2}%`, duration: 0.7, ease: "power3.inOut" })
      .to(clip, { autoAlpha: 0, duration: 0.3, delay: 1.4 });
  };
  btn.addEventListener("click", () => { user = true; stop(); step(); });
  video.addEventListener("click", () => { user = true; stop(); openClip(); });
  video.style.cursor = "pointer";
  function start() {
    if (user || auto || reduce) return;
    auto = window.setInterval(() => { ticks++; if (ticks % 16 === 8) openClip(); else step(); }, 520);
  }
  function stop() { if (auto) { clearInterval(auto); auto = null; } }
  render();
  return { start, stop };
})();

/* In-phone universal search (also live when the visitor types into it). */
let searchUser = false;
const searchRun = (() => {
  const s = $('[data-fs="8"]');
  const input = $<HTMLInputElement>("[data-sr-input]", s);
  const items = $$("[data-sr-item]", s);
  const count = $("[data-sr-count]", s);
  const empty = $("[data-sr-empty]", s);
  const names = items.map((it) => $("b", it).textContent || "");
  const esc = (t: string) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  const run = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    items.forEach((it, i) => {
      const hit = !q || q.split(/\s+/).every((w) => it.dataset.q!.includes(w) || names[i].toLowerCase().includes(w));
      const was = it.hidden;
      it.hidden = !hit;
      const b = $("b", it);
      const first = q.split(/\s+/)[0];
      const idx = first ? names[i].toLowerCase().indexOf(first) : -1;
      b.innerHTML = hit && idx >= 0 ? `${esc(names[i].slice(0, idx))}<mark>${esc(names[i].slice(idx, idx + first.length))}</mark>${esc(names[i].slice(idx + first.length))}` : esc(names[i]);
      if (hit) { shown++; if (was && !reduce) gsap.fromTo(it, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }); }
    });
    count.textContent = q ? `${shown} matching` : "Import queue";
    empty.hidden = shown > 0;
  };
  input.addEventListener("input", () => { searchUser = true; run(); });
  return run;
})();

const loops: Record<number, () => gsap.core.Timeline | void> = {
  0: () => {
    const s = $('[data-fs="0"]');
    const f = $("[data-fs-finger]", s), tile = $("[data-fs-tile]", s), scr = s.parentElement as HTMLElement;
    const p = () => rel(tile, scr);
    return gsap.timeline({ repeat: -1, repeatDelay: 0.6 })
      .set(f, { x: () => scr.offsetWidth * 0.3, y: () => scr.offsetHeight * 0.45, opacity: 0, scale: 1 })
      .to(f, { opacity: 1, duration: 0.3 })
      .to(f, { x: () => p().x, y: () => p().y, duration: 0.7, ease: "power2.inOut" })
      .add(() => tapFx(f))
      .to(f, { scale: 0.78, duration: 0.11, yoyo: true, repeat: 1 })
      .to($("b", tile), { scale: 0.86, duration: 0.11, yoyo: true, repeat: 1 }, "<")
      .to(f, { opacity: 0, duration: 0.3, delay: 0.5 })
      .to({}, { duration: 0.6 });
  },
  1: () => {
    const s = $('[data-fs="1"]');
    const pct = $("[data-fq-pct]", s), bar = $("[data-fq-bar]", s), st = $("[data-fq-status]", s), notif = $("[data-fq-notif]", s);
    const o = { v: 25 };
    const labels: [number, string][] = [[25, "Assessing your workout"], [50, "Adapting the workout for you"], [75, "Analyzing everything"], [100, "Finalizing now"]];
    return gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      .set(notif, { y: 0, yPercent: -150 })
      .fromTo(o, { v: 25 }, {
        v: 100, duration: 2.8, ease: "none",
        onUpdate: () => { const v = Math.round(o.v); pct.textContent = `${v}%`; bar.style.width = `${v}%`; st.textContent = [...labels].reverse().find(([n]) => v >= n)![1]; },
      })
      .to(notif, { yPercent: 0, duration: 0.6, ease: "back.out(1.6)" })
      .to({}, { duration: 1.8 })
      .to(notif, { yPercent: -150, duration: 0.35 });
  },
  2: () => {
    const s = $('[data-fs="2"]');
    const rows = $$("[data-fe-row]", s);
    const lbs = $$("[data-fe-lbs]", s);
    const news = $$(".fe-new", s);
    const addset = $("[data-fe-addset]", s);
    const note = $("[data-fe-notetext]", s);
    const nums = $$("[data-fe-n]", s);
    const h = rows[0].offsetHeight + parseFloat(getComputedStyle(rows[0].parentElement!).rowGap || "0");
    const type = (tl: gsap.core.Timeline, el: HTMLElement, text: string, at: number, cps: number) =>
      [...text].forEach((_, k) => tl.add(() => { el.textContent = text.slice(0, k + 1); }, at + k * cps));
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.add(() => {
      gsap.set(rows, { y: 0, scale: 1 });
      nums[0].textContent = "1"; nums[1].textContent = "2";
      rows.forEach((r) => r.classList.remove("is-lift"));
      lbs.forEach((l) => { l.textContent = "lbs"; l.classList.remove("is-set", "is-focus"); });
      gsap.set(news, { opacity: 0 });
      note.textContent = "";
    })
      .add(() => rows[1].classList.add("is-lift"), 0.3)
      .to(rows[1], { y: -h, scale: 1.03, duration: 0.7, ease: "power2.inOut" }, 0.4)
      .to(rows[0], { y: h, duration: 0.7, ease: "power2.inOut" }, 0.45)
      .to(rows[1], { scale: 1, duration: 0.2 }, 1.1)
      .add(() => { rows[1].classList.remove("is-lift"); nums[1].textContent = "1"; nums[0].textContent = "2"; }, 1.2);
    ["25", "25", "30"].forEach((w, k) => {
      const at = 1.7 + k * 0.7;
      tl.add(() => { lbs.forEach((l) => l.classList.remove("is-focus")); lbs[k].classList.add("is-focus"); lbs[k].textContent = ""; }, at);
      type(tl, lbs[k], w, at + 0.15, 0.12);
      tl.add(() => lbs[k].classList.add("is-set"), at + 0.5);
    });
    tl.to(addset, { scale: 0.9, duration: 0.12, yoyo: true, repeat: 1 }, 4.0)
      .to(news, { opacity: 1, duration: 0.3 }, 4.2)
      .add(() => { lbs.forEach((l) => l.classList.remove("is-focus")); lbs[3].classList.add("is-focus"); lbs[3].textContent = ""; }, 4.4);
    type(tl, lbs[3], "30", 4.55, 0.12);
    tl.add(() => { lbs[3].classList.add("is-set"); lbs[3].classList.remove("is-focus"); }, 4.9);
    type(tl, note, "Slow on the way back, ribs down.", 5.2, 0.045);
    tl.to({}, { duration: 2 });
    return tl;
  },
  3: () => {
    const s = $('[data-fs="3"]');
    const tog = $("[data-ft-toggle]", s), cards = $$("[data-ft-card]", s);
    return gsap.timeline({ repeat: -1, repeatDelay: 0.6 })
      .add(() => { tog.classList.remove("is-on"); cards.forEach((c) => c.classList.remove("is-on")); })
      .add(() => tog.classList.add("is-on"), 0.6)
      .add(() => cards[0].classList.add("is-on"), 1.4)
      .add(() => { cards[0].classList.remove("is-on"); cards[1].classList.add("is-on"); }, 2.8)
      .to({}, { duration: 1.4 });
  },
  4: () => { timer.start(); },
  5: () => {
    const s = $('[data-fs="5"]');
    const num = $("[data-rest-num]", s), ring = $<SVGCircleElement>("[data-rest-ring]", s), next = $("[data-rest-next]", s);
    const C = 2 * Math.PI * 56;
    const o = { v: 20 };
    return gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
      .add(() => { next.textContent = "Get ready for Set 2 of 3"; })
      .fromTo(o, { v: 20 }, { v: 0, duration: 5, ease: "none", onUpdate: () => { num.textContent = String(Math.ceil(o.v)); ring.style.strokeDashoffset = String(C * (1 - o.v / 20)); } })
      .add(() => { next.textContent = "Next: Oblique Leg Raise"; num.textContent = "Go"; })
      .to({}, { duration: 1 });
  },
  6: () => {
    const s = $('[data-fs="6"]');
    const card = $("[data-done-card]", s), pts = $("[data-done-pts]", s), n = $("[data-done-n]", s), note = $("[data-done-note]", s);
    const bits = $$("[data-confetti] i", s);
    const o = { v: 4497 };
    return gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
      .set([pts, note], { opacity: 0, y: 10 })
      .fromTo(card, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)" })
      .set(bits, { opacity: 1, x: 0, y: 0, rotation: 0 }, 0.2)
      .to(bits, {
        x: (i) => Math.cos(i * 0.6) * (60 + (i % 5) * 26),
        y: (i) => Math.sin(i * 0.6) * (50 + (i % 4) * 22) + 120,
        rotation: (i) => i * 47, opacity: 0, duration: 1.6, ease: "power2.out",
      }, 0.2)
      .to([pts, note], { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, 1)
      .fromTo(o, { v: 4497 }, { v: 4797, duration: 1.2, ease: "power2.out", onUpdate: () => (n.textContent = Math.round(o.v).toLocaleString("en-US")) }, 1.1)
      .to({}, { duration: 1.6 });
  },
  7: () => {
    const s = $('[data-fs="7"]');
    const scr = s.parentElement as HTMLElement;
    const f = $("[data-ct-finger]", s);
    const org = $("[data-ct-org]", s), selbar = $("[data-ct-selbar]", s), selcount = $("[data-ct-selcount]", s), moveto = $("[data-ct-moveto]", s);
    const cards = $$("[data-ct-card]", s), checks = $$("[data-ct-check]", s);
    const move = $("[data-ct-move]", s), create = $("[data-ct-create]", s), sheetNew = $("[data-ct-new]", s), typed = $("[data-ct-typed]", s), createBtn = $("[data-ct-createbtn]", s);
    const toast = $("[data-ct-toast]", s), home = $("[data-ct-home]", s), fresh = $("[data-ct-fresh]", s), left = $("[data-ct-left]", s), n = $("[data-ct-n]", s);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
    const go = (el: HTMLElement, t: number, d = 0.5) => tl.to(f, { x: () => rel(el, scr).x, y: () => rel(el, scr).y, opacity: 1, duration: d, ease: "power2.inOut" }, t);
    const tap = (t: number) => tl.add(() => tapFx(f), t).to(f, { scale: 0.78, duration: 0.1, yoyo: true, repeat: 1 }, t);
    tl.add(() => {
      org.textContent = "Organize";
      gsap.set(selbar, { opacity: 0, y: "1em" });
      checks.forEach((c) => c.classList.remove("is-show", "is-on"));
      cards.forEach((c) => c.classList.remove("is-sel"));
      gsap.set([move, sheetNew], { y: 0, yPercent: 105 });
      typed.textContent = "";
      gsap.set(toast, { opacity: 0, scale: 0.85 });
      gsap.set(home, { autoAlpha: 0 });
      gsap.set(fresh, { scale: 0.4, opacity: 0 });
      n.textContent = "680 Workouts";
      left.textContent = "680 workouts";
      gsap.set(f, { x: scr.offsetWidth * 0.5, y: scr.offsetHeight * 0.6, opacity: 0, scale: 1 });
    });
    go(org, 0.3); tap(0.8);
    tl.add(() => { org.textContent = "Done"; checks.forEach((c) => c.classList.add("is-show")); }, 0.85);
    [0, 1].forEach((k) => {
      go(cards[k], 1.2 + k * 0.9); tap(1.7 + k * 0.9);
      tl.add(() => { checks[k].classList.add("is-on"); cards[k].classList.add("is-sel"); selcount.textContent = `${k + 1} selected`; }, 1.75 + k * 0.9);
    });
    tl.to(selbar, { opacity: 1, y: 0, duration: 0.3 }, 1.8);
    go(moveto, 3.0); tap(3.5);
    tl.to(move, { yPercent: 0, duration: 0.5, ease: "expo.out" }, 3.6);
    go(create, 4.2); tap(4.7);
    tl.to(sheetNew, { yPercent: 0, duration: 0.5, ease: "expo.out" }, 4.8);
    const word = "Core workouts";
    [...word].forEach((_, k) => tl.add(() => { typed.textContent = word.slice(0, k + 1); }, 5.3 + k * 0.07));
    go(createBtn, 6.3); tap(6.8);
    tl.to([sheetNew, move], { yPercent: 105, duration: 0.4, ease: "power3.in" }, 6.9)
      .to(toast, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, 7.1)
      .add(() => { n.textContent = "678 Workouts"; }, 7.2)
      .to(f, { opacity: 0, duration: 0.3 }, 7.4)
      .to(toast, { opacity: 0, scale: 0.9, duration: 0.3 }, 8.3)
      .to(home, { autoAlpha: 1, duration: 0.4 }, 8.4)
      .add(() => { left.textContent = "678 workouts"; }, 8.5)
      .to(fresh, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, 8.6)
      .to({}, { duration: 2.2 });
    return tl;
  },
  8: () => {
    if (searchUser) return;
    const s = $('[data-fs="8"]');
    const scr = s.parentElement as HTMLElement;
    const f = $("[data-sr-finger]", s);
    const input = $<HTMLInputElement>("[data-sr-input]", s);
    const open = $("[data-sr-open]", s);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
    tl.add(() => {
      input.value = "";
      searchRun();
      gsap.set(open, { x: 0, xPercent: 105 });
      gsap.set(f, { x: scr.offsetWidth * 0.5, y: scr.offsetHeight * 0.6, opacity: 0, scale: 1 });
    })
      .to(f, { x: () => rel(input, scr).x, y: () => rel(input, scr).y, opacity: 1, duration: 0.5, ease: "power2.inOut" }, 0.3)
      .add(() => tapFx(f), 0.8)
      .to(f, { scale: 0.78, duration: 0.1, yoyo: true, repeat: 1 }, 0.8)
      .to(f, { opacity: 0, duration: 0.2 }, 1.0);
    const word = "Morning workout";
    [...word].forEach((_, k) => tl.add(() => { input.value = word.slice(0, k + 1); searchRun(); }, 1.1 + k * 0.09));
    const target = () => $$("[data-sr-item]", s).find((el) => !el.hidden) || input;
    tl.to(f, { x: () => rel(target(), scr).x, y: () => rel(target(), scr).y, opacity: 1, duration: 0.5, ease: "power2.inOut" }, 2.7)
      .add(() => tapFx(f), 3.2)
      .to(f, { scale: 0.78, duration: 0.1, yoyo: true, repeat: 1 }, 3.2)
      .to(open, { xPercent: 0, duration: 0.5, ease: "expo.out" }, 3.4)
      .to(f, { opacity: 0, duration: 0.3 }, 3.5)
      .to({}, { duration: 2.2 })
      .to(open, { xPercent: 105, duration: 0.4, ease: "power3.in" });
    const stopForUser = () => { searchUser = true; tl.kill(); gsap.set(f, { opacity: 0 }); gsap.set(open, { xPercent: 105 }); };
    input.addEventListener("pointerdown", stopForUser, { once: true });
    input.addEventListener("focus", stopForUser, { once: true });
    return tl;
  },
  9: () => {
    const s = $('[data-fs="9"]');
    const scr = s.parentElement as HTMLElement;
    const f = $("[data-pg-finger]", s);
    const add = $("[data-pg-add]", s), sheet = $("[data-pg-sheet]", s), plus = $("[data-pg-plus='1']", s), nw = $("[data-pg-new]", s), bar = $("[data-pg-holdbar]", s);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
    const go = (el: HTMLElement, t: number) => tl.to(f, { x: () => rel(el, scr).x, y: () => rel(el, scr).y, opacity: 1, duration: 0.5, ease: "power2.inOut" }, t);
    tl.add(() => {
      nw.classList.remove("is-in");
      gsap.set(nw, { opacity: 1 });
      gsap.set(bar, { scaleX: 0 });
      gsap.set(sheet, { y: 0, yPercent: 105 });
      gsap.set(f, { x: scr.offsetWidth * 0.5, y: scr.offsetHeight * 0.5, opacity: 0, scale: 1 });
    });
    go(add, 0.3);
    tl.add(() => tapFx(f), 0.8).to(f, { scale: 0.78, duration: 0.1, yoyo: true, repeat: 1 }, 0.8)
      .to(sheet, { yPercent: 0, duration: 0.5, ease: "expo.out" }, 0.95);
    go(plus, 1.6);
    tl.add(() => tapFx(f), 2.1).to(f, { scale: 0.78, duration: 0.1, yoyo: true, repeat: 1 }, 2.1)
      .to(plus, { scale: 1.35, duration: 0.15, yoyo: true, repeat: 1 }, 2.1)
      .to(sheet, { yPercent: 105, duration: 0.4, ease: "power3.in" }, 2.35)
      .add(() => nw.classList.add("is-in"), 2.7);
    go(nw, 3.7);
    tl.to(f, { scale: 0.85, duration: 0.2 }, 4.2)
      .to(bar, { scaleX: 1, duration: 0.9, ease: "none" }, 4.25)
      .to(nw, { opacity: 0, duration: 0.25 }, 5.15)
      .add(() => nw.classList.remove("is-in"), 5.4)
      .to(f, { opacity: 0, scale: 1, duration: 0.3 }, 5.3)
      .to({}, { duration: 1 });
    return tl;
  },
  10: () => {
    const s = $('[data-fs="10"]');
    const you = $("[data-rk-you]", s), pos = $("[data-rk-pos]", s), pts = $("[data-rk-pts]", s), sub = $("[data-rk-sub]", s), youAv = $("[data-rk-youav]", s);
    const list = $("[data-rk-list]", s), views = $("[data-rk-views]", s), tabs = $(".rk-tabs", s), tabEls = $$("[data-rk-tab]", s);
    const counts = $$("[data-rk-count]", s);
    const pod = $(".rk-pod", s);
    const ranks = [2797, 2450, 2440, 2210, 1980, 3340];
    const o = { v: 1640 };
    const setTab = (pr: boolean) => {
      views.classList.toggle("is-pr", pr);
      tabs.classList.toggle("is-pr", pr);
      tabEls.forEach((t, i) => t.classList.toggle("is-on", (i === 1) === pr));
    };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
    tl.add(() => {
      setTab(false);
      o.v = 1640; pts.textContent = "1,640"; pos.textContent = "9";
      sub.textContent = "Racing to your rank…";
      gsap.set(you, { y: list.offsetTop + list.offsetHeight + 6, opacity: 1, scale: 1 });
      gsap.set(youAv, { scale: 0.6, opacity: 0.4 });
      counts.forEach((c) => (c.textContent = "0"));
    })
      .to(o, {
        v: 4797, duration: 2.4, ease: "power2.inOut",
        onUpdate: () => { pts.textContent = Math.round(o.v).toLocaleString("en-US"); pos.textContent = String(9 - ranks.filter((p) => o.v > p).length); },
      }, 0.3)
      .to(you, { y: () => list.offsetTop - 4, duration: 1.9, ease: "power2.inOut" }, 0.4)
      .to(you, { y: () => pod.offsetTop + pod.offsetHeight * 0.3, scale: 0.85, opacity: 0, duration: 0.5, ease: "power2.in" }, 2.4)
      .to(youAv, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(3)" }, 2.8)
      .add(() => { sub.textContent = "Podium locked in. One more session could take the top."; }, 2.9)
      .add(() => setTab(true), 4.3);
    counts.forEach((c) => {
      const end = Number(c.dataset.rkCount); const v = { n: 0 };
      tl.to(v, { n: end, duration: 1.2, ease: "power2.out", onUpdate: () => (c.textContent = Math.round(v.n).toLocaleString("en-US")) }, 4.6);
    });
    tl.to({}, { duration: 2.4 }).add(() => setTab(false));
    return tl;
  },
};

(() => {
  const sec = $(".fly");
  const phone = $("[data-fly-phone]");
  const screens = $$("[data-fs]", phone);
  const texts = $$("[data-fly-step]");
  const pips = $$("[data-fly-pip]");
  const N = texts.length;
  let active = -1;
  let running: gsap.core.Timeline | void;

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    pips.forEach((p, k) => p.classList.toggle("is-on", k === i));
    texts.forEach((t, k) => t.classList.toggle("is-on", k === i));
    if (running) running.kill();
    timer.stop();
    if (!reduce && i >= 0) running = loops[i]?.();
  };
  const X = (i: number) => (isMobile() ? 0 : (i % 2 === 0 ? 1 : -1) * Math.min(innerWidth * 0.2, 300));

  const render = (p: number) => {
    const s = Math.min(N - 0.0001, Math.max(0, p * N));
    const i = Math.floor(s);
    const f = s - i;
    const t = i < N - 1 ? easeIO(clamp01((f - 0.72) / 0.28)) : 0;
    const arc = Math.sin(t * Math.PI);
    const dir = i % 2 === 0 ? -1 : 1;
    const x = lerp(X(i), X(Math.min(N - 1, i + 1)), t);
    // After the last step the phone launches up and away: it lands in the next section.
    const out = i === N - 1 ? easeIO(clamp01((f - 0.7) / 0.3)) : 0;
    phone.style.transform =
      `translate3d(${x}px, ${-arc * 40 - out * innerHeight * 0.95}px, 0) rotateY(${dir * arc * (isMobile() ? 70 : 32)}deg) ` +
      `rotateX(${out * 50}deg) rotateZ(${dir * arc * 6 + out * 24}deg) scale(${1 - arc * 0.1 - out * 0.25})`;
    phone.style.filter = out > 0.02 ? `blur(${out * 3}px)` : "";
    const shown = t < 0.5 ? i : i + 1;
    screens.forEach((sc, k) => sc.classList.toggle("is-on", k === shown));
    setActive(out > 0.6 ? -1 : shown);
    texts.forEach((el, j) => {
      let o = clamp01(1 - (Math.abs(s - (j + 0.35)) - 0.42) / 0.16);
      if (j === N - 1) o = Math.min(clamp01((s - (N - 1) + 0.07) / 0.16), 1 - out);
      el.style.opacity = String(o);
      const side = j % 2 === 0 ? -1 : 1;
      el.style.transform = isMobile() ? `translateY(${(1 - o) * 16}px)` : `translate(${side * (1 - o) * 40}px, -50%)`;
    });
  };
  ScrollTrigger.create({
    trigger: sec, start: "top top", end: "bottom bottom",
    onUpdate: (st) => render(st.progress),
    onRefresh: (st) => render(st.progress),
    onLeave: () => setActive(-1),
    onLeaveBack: () => setActive(-1),
  });
  render(0);
})();

/* =================================================================== CHAPTERS: catalogs, search, programs, progress
   Each has its own pinned section. The phone flies in on its own path, the feature plays inside it,
   an oversized scene runs behind it, then it flies out toward the next section. */

const easeO = gsap.parseEase("power3.out");
const easeBack = gsap.parseEase("back.out(1.5)");
const burstTo = [[0.2, -0.3], [0.25, 0.02], [0.2, 0.3], [-0.12, -0.38], [-0.13, 0.38], [0.02, -0.44]];

function renderScene(j: number, l: number, root: HTMLElement) {
  const W = innerWidth, H = innerHeight, m = isMobile();
  if (j === 7) {
    const orbs = $$("[data-orb]", root);
    const rx = Math.min(W * (m ? 0.42 : 0.3), 520), ry = H * (m ? 0.3 : 0.36);
    let sum = 0;
    orbs.forEach((o, i) => {
      const a = (i / orbs.length) * Math.PI * 2 + 0.3 + l * 0.9;
      const k = easeIO(clamp01((l - 0.2 - (i % 7) * 0.04) / 0.45));
      sum += k;
      const ox = Math.cos(a) * rx * (1 - k), oy = Math.sin(a) * ry * (1 - k);
      o.style.transform = `translate(-50%, -50%) translate(${ox}px, ${oy}px) rotate(${(((i * 23) % 40) - 20) * (1 - k) + k * 180}deg) scale(${1 - 0.85 * k})`;
      o.style.opacity = String(k > 0.97 ? 0 : 1 - k * 0.4);
    });
    $("[data-bg-catn]", root).textContent = String(Math.round(678 * (1 - sum / orbs.length)));
  } else if (j === 8) {
    const full = "morning";
    $("[data-bg-word]", root).textContent = full.slice(0, Math.round(clamp01((l - 0.12) / 0.3) * full.length));
    $$("[data-burst]", root).forEach((b, i) => {
      const k = easeO(clamp01((l - 0.4 - (i % 3) * 0.06) / 0.35));
      const [tx, ty] = burstTo[i];
      b.style.transform = `translate(-50%, -50%) translate(${-tx * W * k * (m ? 1.6 : 1)}px, ${ty * H * k}px) rotate(${(tx > 0 ? -6 : 6) * k}deg) scale(${0.4 + 0.6 * k})`;
      b.style.opacity = String(k);
    });
  } else if (j === 9) {
    const box = root.getBoundingClientRect();
    const days = $$("[data-bg-day]", root);
    $$("[data-bg-pill]", root).forEach((p, i) => {
      const d = Number(p.dataset.bgPill);
      const col = days[d].getBoundingClientRect();
      const t = clamp01((l - 0.18 - i * 0.12) / 0.24);
      const k = easeBack(t);
      p.style.left = `${col.left - box.left + (col.width - p.offsetWidth) / 2}px`;
      p.style.transform = `translateY(${(1 - k) * -H * 0.7}px) rotate(${(1 - k) * (i % 2 ? 14 : -14)}deg)`;
      p.style.opacity = String(clamp01(t * 3));
      days[d].classList.toggle("is-hit", t >= 1);
    });
  } else if (j === 10) {
    $("[data-bg-pts]", root).textContent = Math.round(easeO(clamp01((l - 0.1) / 0.6)) * 4797).toLocaleString("en-US");
    $$("[data-bg-pod]", root).forEach((p) => {
      const i = Number(p.dataset.bgPod);
      p.style.transform = `scaleY(${easeO(clamp01((l - 0.15 - i * 0.1) / 0.4))})`;
    });
    $$(".bg-spark", root).forEach((sp, i) => {
      const k = clamp01((l - 0.35) / 0.65);
      sp.style.transform = `translateY(${-k * H * (0.3 + (i % 4) * 0.12)}px) rotate(${k * (200 + i * 40)}deg)`;
      sp.style.opacity = String(Math.sin(k * Math.PI) * 0.8);
    });
  }
}

type Fx = "drop" | "spin" | "rise" | "zoom";
// e = 0..1 entering (1 = settled), x = 0..1 leaving.
function flight(fx: Fx, e: number, x: number) {
  const W = innerWidth, H = innerHeight;
  const a = 1 - e;
  let t = "";
  if (fx === "drop") t = `translate3d(${a * W * 0.08}px, ${-a * H * 1.05}px, 0) rotateX(${-a * 60}deg) rotateZ(${-a * 32}deg) scale(${1 - a * 0.3})`;
  if (fx === "spin") t = `translate3d(${a * W * 0.55}px, ${-a * H * 0.15}px, 0) rotateY(${-a * 540}deg) scale(${1 - a * 0.35})`;
  if (fx === "rise") t = `translate3d(${-a * W * 0.12}px, ${a * H * 1.05}px, 0) rotateX(${a * 65}deg) rotateZ(${a * 18}deg) scale(${0.75 + 0.25 * e})`;
  if (fx === "zoom") t = `translate3d(0, ${-a * H * 0.2}px, 0) rotateZ(${-a * 400}deg) scale(${0.08 + 0.92 * easeO(e)})`;
  const outs: Record<Fx, string> = {
    drop: `translate3d(${x * W * 0.45}px, ${x * H * 0.35}px, 0) rotateY(${-x * 70}deg) rotateZ(${x * 14}deg) scale(${1 - x * 0.35})`,
    spin: `translate3d(${-x * W * 0.3}px, ${x * H * 1.05}px, 0) rotateX(${-x * 55}deg) rotateZ(${-x * 20}deg) scale(${1 - x * 0.2})`,
    rise: `translate3d(0, ${-x * H * 0.25}px, 0) scale(${1 - x * 0.9}) rotateZ(${x * 300}deg)`,
    zoom: `translate3d(0, ${-x * H * 0.15}px, 0) scale(${1 - x * 0.15})`,
  };
  return `${t} ${outs[fx]}`;
}

$$<HTMLElement>("[data-chap]").forEach((sec) => {
  const j = Number(sec.dataset.chap);
  const fx = sec.dataset.fx as Fx;
  const holder = $("[data-chap-phone]", sec);
  const text = $("[data-chap-text]", sec);
  const scene = sec.querySelector<HTMLElement>(".chap-bg");
  const side = sec.classList.contains("chap--r") ? -1 : 1;
  let running: gsap.core.Timeline | void;
  let live = false;
  let enter = 0;

  const setLive = (on: boolean) => {
    if (on === live) return;
    live = on;
    if (running) running.kill();
    running = undefined;
    if (on && !reduce) running = loops[j]?.();
  };
  const render = (pin: number) => {
    const e = easeO(clamp01(enter));
    const x = easeIO(clamp01((pin - 0.86) / 0.14));
    holder.style.transform = flight(fx, e, x);
    const speed = Math.max(1 - e, x);
    holder.style.filter = speed > 0.05 && speed < 0.98 ? `blur(${speed * 2.5}px)` : "";
    holder.style.setProperty("--trail", String(Math.min(1, speed * 2.2)));
    const o = Math.min(clamp01((enter - 0.55) / 0.35 + pin * 3), 1 - x);
    text.style.opacity = String(o);
    text.style.transform = isMobile() ? `translateY(${(1 - o) * 20}px)` : `translateY(-50%) translateX(${side * (1 - o) * 50}px)`;
    if (scene) {
      scene.style.opacity = String(Math.min(clamp01(enter * 1.4), 1 - x * 0.8));
      renderScene(j, clamp01(enter * 0.25 + pin * 0.95), scene);
    }
    setLive(enter > 0.9 && x < 0.4);
  };
  let pinP = 0;
  if (reduce) { enter = 1; render(0.5); return; }
  ScrollTrigger.create({
    trigger: sec, start: "top bottom", end: "top top",
    onUpdate: (st) => { enter = st.progress; render(pinP); },
    onRefresh: (st) => { enter = st.progress; render(pinP); },
  });
  ScrollTrigger.create({
    trigger: sec, start: "top top", end: "bottom bottom",
    onUpdate: (st) => { pinP = st.progress; render(pinP); },
    onRefresh: (st) => { pinP = st.progress; render(pinP); },
    onLeave: () => setLive(false),
    onLeaveBack: () => { pinP = 0; render(0); },
  });
  render(0);
});

/* =================================================================== COUNTERS, ROW, CTA */

$$("[data-count]").forEach((el) => {
  const end = Number(el.dataset.count);
  if (reduce) return;
  const o = { v: 0 };
  el.textContent = "0";
  ScrollTrigger.create({
    trigger: el, start: "top 90%", once: true,
    onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString("en-US")) }),
  });
});

$$("[data-drag-scroll]").forEach((row) => {
  let down = false, sx = 0, sl = 0, moved = false;
  row.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = row.scrollLeft; });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 4) { moved = true; row.classList.add("is-drag"); }
    row.scrollLeft = sl - dx;
  });
  addEventListener("pointerup", () => { down = false; setTimeout(() => row.classList.remove("is-drag"), 0); });
  row.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
});

const magnet = document.querySelector<HTMLElement>("[data-magnet]");
if (magnet && !reduce && matchMedia("(hover: hover)").matches) {
  const mx = gsap.quickTo(magnet, "x", { duration: 0.6, ease: "power3.out" });
  const my = gsap.quickTo(magnet, "y", { duration: 0.6, ease: "power3.out" });
  magnet.addEventListener("pointermove", (e) => {
    const r = magnet.getBoundingClientRect();
    magnet.style.setProperty("--mx", `${e.clientX - r.left}px`);
    magnet.style.setProperty("--my", `${e.clientY - r.top}px`);
    mx((e.clientX - (r.left + r.width / 2)) * 0.06);
    my((e.clientY - (r.top + r.height / 2)) * 0.12);
  });
  magnet.addEventListener("pointerleave", () => { mx(0); my(0); });
}

addEventListener("load", () => ScrollTrigger.refresh());
