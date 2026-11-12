// One-rep-max maths, shared by the page (build-time defaults) and the browser script.

export type Unit = "lb" | "kg";

export const FORMULAS: { id: string; name: string; fn: (w: number, r: number) => number }[] = [
  { id: "epley", name: "Epley", fn: (w, r) => w * (1 + r / 30) },
  { id: "brzycki", name: "Brzycki", fn: (w, r) => (w * 36) / (37 - r) },
  { id: "lombardi", name: "Lombardi", fn: (w, r) => w * Math.pow(r, 0.1) },
  { id: "mayhew", name: "Mayhew", fn: (w, r) => (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)) },
  { id: "oconner", name: "O’Conner", fn: (w, r) => w * (1 + 0.025 * r) },
  { id: "wathan", name: "Wathan", fn: (w, r) => (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)) },
  { id: "lander", name: "Lander", fn: (w, r) => (100 * w) / (101.3 - 2.67123 * r) },
];

/** Estimated 1RM: the average of all formulas (each formula is exact at 1 rep). */
export function estimate(weight: number, reps: number) {
  if (!(weight > 0) || !(reps >= 1)) return { avg: 0, each: FORMULAS.map((f) => ({ ...f, value: 0 })) };
  if (reps === 1) return { avg: weight, each: FORMULAS.map((f) => ({ ...f, value: weight })) };
  const each = FORMULAS.map((f) => ({ ...f, value: f.fn(weight, reps) }));
  const avg = each.reduce((s, f) => s + f.value, 0) / each.length;
  return { avg, each };
}

/** Weight you could lift for n reps, given a 1RM (inverse of Epley and Brzycki, averaged). */
export function weightForReps(oneRm: number, n: number) {
  if (n === 1) return oneRm;
  const epley = oneRm / (1 + n / 30);
  const brzycki = (oneRm * (37 - n)) / 36;
  return (epley + brzycki) / 2;
}

/** Percent of 1RM, with the reps people can usually do at that load and what it's for. */
export const PERCENTS: { pct: number; reps: string; use: string }[] = [
  { pct: 100, reps: "1", use: "Max test" },
  { pct: 95, reps: "2", use: "Peak strength" },
  { pct: 90, reps: "3–4", use: "Strength" },
  { pct: 85, reps: "5–6", use: "Strength" },
  { pct: 80, reps: "7–8", use: "Strength and size" },
  { pct: 75, reps: "9–10", use: "Muscle growth" },
  { pct: 70, reps: "11–12", use: "Muscle growth" },
  { pct: 65, reps: "13–15", use: "Muscle growth" },
  { pct: 60, reps: "16–20", use: "Endurance, technique" },
  { pct: 55, reps: "20–24", use: "Warm-up, endurance" },
  { pct: 50, reps: "25+", use: "Warm-up" },
];

export const BAR: Record<Unit, number> = { lb: 45, kg: 20 };
export const PLATES: Record<Unit, number[]> = {
  lb: [45, 35, 25, 10, 5, 2.5],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
};
/** Smallest jump you can load on a bar (two of the smallest plates). */
export const STEP: Record<Unit, number> = { lb: 5, kg: 2.5 };

export function roundToLoad(w: number, unit: Unit) {
  return Math.round(w / STEP[unit]) * STEP[unit];
}

/** Plates for ONE side of the bar, biggest first. */
export function platesPerSide(total: number, unit: Unit) {
  let side = (roundToLoad(total, unit) - BAR[unit]) / 2;
  const out: number[] = [];
  if (side <= 0) return out;
  for (const p of PLATES[unit]) {
    while (side >= p - 1e-9 && out.length < 12) {
      out.push(p);
      side -= p;
    }
  }
  return out;
}

export const fmt = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 });

const PLATE_COLORS = ["#E2FF2E", "#4FE3D1", "#FF6BAE", "#5B8CFF", "#FF8E3C", "#A98BFF", "#9A9A9F"];
const PLATE_H: Record<Unit, number[]> = {
  lb: [132, 118, 102, 78, 62, 50],
  kg: [132, 128, 112, 94, 70, 56, 48],
};

/** Geometry of one plate, so the server and the browser draw the same bar. */
export function plateShape(v: number, unit: Unit) {
  const i = PLATES[unit].indexOf(v);
  const h = PLATE_H[unit][i];
  const w = i <= 1 ? 15 : i <= 3 ? 12 : 9;
  return { h, w, color: PLATE_COLORS[i] };
}

/** Static SVG for the first paint. The browser script animates changes after that. */
export function barSvg(total: number, unit: Unit) {
  const plates = platesPerSide(total, unit);
  let xr = 408, xl = 192;
  const rects: string[] = [];
  plates.forEach((v) => {
    const { h, w, color } = plateShape(v, unit);
    rects.push(`<rect data-side="r" data-v="${v}" x="${xr}" y="${80 - h / 2}" width="${w}" height="${h}" rx="3" fill="${color}"/>`);
    rects.push(`<rect data-side="l" data-v="${v}" x="${xl - w}" y="${80 - h / 2}" width="${w}" height="${h}" rx="3" fill="${color}"/>`);
    xr += w + 2; xl -= w + 2;
  });
  return rects.join("");
}
