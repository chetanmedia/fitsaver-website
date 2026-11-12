// Workout generator: exercise library + rules. Shared by the page (build-time sample) and the browser.

export type Eq = "bw" | "db" | "kb" | "band" | "bb" | "machine";
export type Goal = "muscle" | "strength" | "fatloss" | "endurance";
export type Focus = "full" | "upper" | "lower" | "push" | "pull" | "core" | "glutes" | "arms";

type Ex = {
  name: string;
  /** Movement slot it fills. */
  p: string;
  /** Equipment it needs (any one of these is enough). */
  eq: Eq[];
  muscle: string;
  /** Big multi-joint lift (gets heavier, longer-rest prescriptions). */
  big?: boolean;
  /** Held for time instead of counted in reps. */
  timed?: boolean;
  /** Done one side at a time. */
  side?: boolean;
};

export const EXERCISES: Ex[] = [
  // Squat
  { name: "Bodyweight squat", p: "squat", eq: ["bw"], muscle: "Quads, glutes" },
  { name: "Jump squat", p: "squat", eq: ["bw"], muscle: "Quads, glutes" },
  { name: "Goblet squat", p: "squat", eq: ["db", "kb"], muscle: "Quads, glutes", big: true },
  { name: "Dumbbell front squat", p: "squat", eq: ["db"], muscle: "Quads, glutes", big: true },
  { name: "Barbell back squat", p: "squat", eq: ["bb"], muscle: "Quads, glutes", big: true },
  { name: "Barbell front squat", p: "squat", eq: ["bb"], muscle: "Quads, core", big: true },
  { name: "Leg press", p: "squat", eq: ["machine"], muscle: "Quads, glutes", big: true },
  { name: "Banded squat", p: "squat", eq: ["band"], muscle: "Quads, glutes" },
  // Hinge
  { name: "Single-leg hip hinge", p: "hinge", eq: ["bw"], muscle: "Hamstrings, glutes", side: true },
  { name: "Dumbbell Romanian deadlift", p: "hinge", eq: ["db"], muscle: "Hamstrings, glutes", big: true },
  { name: "Kettlebell swing", p: "hinge", eq: ["kb"], muscle: "Glutes, hamstrings", big: true },
  { name: "Kettlebell deadlift", p: "hinge", eq: ["kb"], muscle: "Glutes, hamstrings", big: true },
  { name: "Barbell deadlift", p: "hinge", eq: ["bb"], muscle: "Back, glutes, hamstrings", big: true },
  { name: "Barbell Romanian deadlift", p: "hinge", eq: ["bb"], muscle: "Hamstrings, glutes", big: true },
  { name: "Band good morning", p: "hinge", eq: ["band"], muscle: "Hamstrings, lower back" },
  // Lunge
  { name: "Reverse lunge", p: "lunge", eq: ["bw"], muscle: "Quads, glutes", side: true },
  { name: "Walking lunge", p: "lunge", eq: ["bw", "db"], muscle: "Quads, glutes", side: true },
  { name: "Bulgarian split squat", p: "lunge", eq: ["bw", "db"], muscle: "Quads, glutes", side: true },
  { name: "Dumbbell step-up", p: "lunge", eq: ["db"], muscle: "Quads, glutes", side: true },
  { name: "Kettlebell goblet reverse lunge", p: "lunge", eq: ["kb"], muscle: "Quads, glutes", side: true },
  { name: "Barbell split squat", p: "lunge", eq: ["bb"], muscle: "Quads, glutes", side: true },
  // Glutes
  { name: "Glute bridge", p: "glute", eq: ["bw"], muscle: "Glutes" },
  { name: "Single-leg glute bridge", p: "glute", eq: ["bw"], muscle: "Glutes", side: true },
  { name: "Dumbbell hip thrust", p: "glute", eq: ["db"], muscle: "Glutes", big: true },
  { name: "Barbell hip thrust", p: "glute", eq: ["bb"], muscle: "Glutes", big: true },
  { name: "Cable kickback", p: "glute", eq: ["machine"], muscle: "Glutes", side: true },
  { name: "Banded hip thrust", p: "glute", eq: ["band"], muscle: "Glutes" },
  { name: "Donkey kick", p: "glute", eq: ["bw", "band"], muscle: "Glutes", side: true },
  // Glute side
  { name: "Banded lateral walk", p: "abduct", eq: ["band"], muscle: "Glute medius" },
  { name: "Side-lying leg raise", p: "abduct", eq: ["bw"], muscle: "Glute medius", side: true },
  { name: "Hip abduction machine", p: "abduct", eq: ["machine"], muscle: "Glute medius" },
  { name: "Banded clamshell", p: "abduct", eq: ["band"], muscle: "Glute medius", side: true },
  { name: "Fire hydrant", p: "abduct", eq: ["bw"], muscle: "Glute medius", side: true },
  // Leg isolation
  { name: "Leg extension", p: "quad", eq: ["machine"], muscle: "Quads" },
  { name: "Wall sit", p: "quad", eq: ["bw"], muscle: "Quads", timed: true },
  { name: "Lying leg curl", p: "ham", eq: ["machine"], muscle: "Hamstrings" },
  { name: "Towel slider hamstring curl", p: "ham", eq: ["bw"], muscle: "Hamstrings" },
  { name: "Dumbbell hamstring curl", p: "ham", eq: ["db"], muscle: "Hamstrings" },
  { name: "Standing calf raise", p: "calf", eq: ["bw", "db", "machine"], muscle: "Calves" },
  { name: "Single-leg calf raise", p: "calf", eq: ["bw"], muscle: "Calves", side: true },
  // Horizontal push
  { name: "Push-up", p: "pushH", eq: ["bw"], muscle: "Chest, triceps" },
  { name: "Decline push-up", p: "pushH", eq: ["bw"], muscle: "Upper chest, shoulders" },
  { name: "Dumbbell bench press", p: "pushH", eq: ["db"], muscle: "Chest, triceps", big: true },
  { name: "Incline dumbbell press", p: "pushH", eq: ["db"], muscle: "Upper chest", big: true },
  { name: "Floor press", p: "pushH", eq: ["db", "kb"], muscle: "Chest, triceps", big: true },
  { name: "Barbell bench press", p: "pushH", eq: ["bb"], muscle: "Chest, triceps", big: true },
  { name: "Incline barbell press", p: "pushH", eq: ["bb"], muscle: "Upper chest", big: true },
  { name: "Machine chest press", p: "pushH", eq: ["machine"], muscle: "Chest" },
  { name: "Banded push-up", p: "pushH", eq: ["band"], muscle: "Chest, triceps" },
  // Chest isolation
  { name: "Dumbbell fly", p: "chest", eq: ["db"], muscle: "Chest" },
  { name: "Cable fly", p: "chest", eq: ["machine"], muscle: "Chest" },
  { name: "Band chest fly", p: "chest", eq: ["band"], muscle: "Chest" },
  { name: "Wide push-up", p: "chest", eq: ["bw"], muscle: "Chest" },
  // Vertical push
  { name: "Pike push-up", p: "pushV", eq: ["bw"], muscle: "Shoulders, triceps" },
  { name: "Seated dumbbell shoulder press", p: "pushV", eq: ["db"], muscle: "Shoulders", big: true },
  { name: "Arnold press", p: "pushV", eq: ["db"], muscle: "Shoulders" },
  { name: "Kettlebell overhead press", p: "pushV", eq: ["kb"], muscle: "Shoulders", side: true },
  { name: "Barbell overhead press", p: "pushV", eq: ["bb"], muscle: "Shoulders, triceps", big: true },
  { name: "Band overhead press", p: "pushV", eq: ["band"], muscle: "Shoulders" },
  { name: "Machine shoulder press", p: "pushV", eq: ["machine"], muscle: "Shoulders" },
  // Shoulder isolation
  { name: "Dumbbell lateral raise", p: "delt", eq: ["db"], muscle: "Side delts" },
  { name: "Cable lateral raise", p: "delt", eq: ["machine"], muscle: "Side delts", side: true },
  { name: "Band lateral raise", p: "delt", eq: ["band"], muscle: "Side delts" },
  { name: "Plank shoulder tap", p: "delt", eq: ["bw"], muscle: "Shoulders, core" },
  { name: "Reverse dumbbell fly", p: "rear", eq: ["db"], muscle: "Rear delts" },
  { name: "Face pull", p: "rear", eq: ["machine", "band"], muscle: "Rear delts, upper back" },
  { name: "Band pull-apart", p: "rear", eq: ["band"], muscle: "Rear delts" },
  { name: "Prone Y raise", p: "rear", eq: ["bw"], muscle: "Rear delts, upper back" },
  // Horizontal pull
  { name: "Doorframe row", p: "pullH", eq: ["bw"], muscle: "Upper back, biceps" },
  { name: "Inverted row", p: "pullH", eq: ["machine", "bb"], muscle: "Back, biceps" },
  { name: "One-arm dumbbell row", p: "pullH", eq: ["db"], muscle: "Lats, upper back", side: true, big: true },
  { name: "Chest-supported dumbbell row", p: "pullH", eq: ["db"], muscle: "Upper back" },
  { name: "Kettlebell row", p: "pullH", eq: ["kb"], muscle: "Lats, upper back", side: true },
  { name: "Barbell bent-over row", p: "pullH", eq: ["bb"], muscle: "Back", big: true },
  { name: "Seated cable row", p: "pullH", eq: ["machine"], muscle: "Mid back" },
  { name: "Band row", p: "pullH", eq: ["band"], muscle: "Back" },
  // Vertical pull
  { name: "Pull-up", p: "pullV", eq: ["machine", "bb"], muscle: "Lats, biceps", big: true },
  { name: "Chin-up", p: "pullV", eq: ["machine", "bb"], muscle: "Lats, biceps", big: true },
  { name: "Lat pulldown", p: "pullV", eq: ["machine"], muscle: "Lats", big: true },
  { name: "Band lat pulldown", p: "pullV", eq: ["band"], muscle: "Lats" },
  { name: "Dumbbell pullover", p: "pullV", eq: ["db"], muscle: "Lats, chest" },
  { name: "Superman pull", p: "pullV", eq: ["bw"], muscle: "Lats, lower back" },
  // Arms
  { name: "Dumbbell biceps curl", p: "bi", eq: ["db"], muscle: "Biceps" },
  { name: "Hammer curl", p: "bi", eq: ["db"], muscle: "Biceps, forearms" },
  { name: "Incline dumbbell curl", p: "bi", eq: ["db"], muscle: "Biceps" },
  { name: "Barbell curl", p: "bi", eq: ["bb"], muscle: "Biceps" },
  { name: "Cable curl", p: "bi", eq: ["machine"], muscle: "Biceps" },
  { name: "Band curl", p: "bi", eq: ["band"], muscle: "Biceps" },
  { name: "Kettlebell curl", p: "bi", eq: ["kb"], muscle: "Biceps" },
  { name: "Towel isometric curl", p: "bi", eq: ["bw"], muscle: "Biceps", timed: true },
  { name: "Chair dip", p: "tri", eq: ["bw"], muscle: "Triceps" },
  { name: "Diamond push-up", p: "tri", eq: ["bw"], muscle: "Triceps, chest" },
  { name: "Overhead dumbbell extension", p: "tri", eq: ["db", "kb"], muscle: "Triceps" },
  { name: "Dumbbell skull crusher", p: "tri", eq: ["db"], muscle: "Triceps" },
  { name: "Close-grip bench press", p: "tri", eq: ["bb"], muscle: "Triceps, chest", big: true },
  { name: "Cable triceps pushdown", p: "tri", eq: ["machine"], muscle: "Triceps" },
  { name: "Band triceps pushdown", p: "tri", eq: ["band"], muscle: "Triceps" },
  // Core
  { name: "Plank", p: "coreA", eq: ["bw"], muscle: "Core", timed: true },
  { name: "Dead bug", p: "coreA", eq: ["bw"], muscle: "Deep core" },
  { name: "Plank walkout", p: "coreA", eq: ["bw"], muscle: "Abs, shoulders" },
  { name: "Hollow body hold", p: "coreA", eq: ["bw"], muscle: "Abs", timed: true },
  { name: "Bird dog", p: "coreA", eq: ["bw"], muscle: "Core, lower back", side: true },
  { name: "Crunch", p: "coreF", eq: ["bw"], muscle: "Upper abs" },
  { name: "Reverse crunch", p: "coreF", eq: ["bw"], muscle: "Lower abs" },
  { name: "Hanging knee raise", p: "coreF", eq: ["machine", "bb"], muscle: "Lower abs" },
  { name: "Lying leg raise", p: "coreF", eq: ["bw"], muscle: "Lower abs" },
  { name: "V-up", p: "coreF", eq: ["bw"], muscle: "Abs" },
  { name: "Cable crunch", p: "coreF", eq: ["machine"], muscle: "Abs" },
  { name: "Weighted sit-up", p: "coreF", eq: ["db", "kb"], muscle: "Abs" },
  { name: "Russian twist", p: "coreR", eq: ["bw", "db", "kb"], muscle: "Obliques" },
  { name: "Bicycle crunch", p: "coreR", eq: ["bw"], muscle: "Obliques" },
  { name: "Pallof press", p: "coreR", eq: ["band", "machine"], muscle: "Obliques, deep core", side: true },
  { name: "Cable woodchop", p: "coreR", eq: ["machine", "band"], muscle: "Obliques", side: true },
  { name: "Side plank", p: "coreL", eq: ["bw"], muscle: "Obliques", side: true, timed: true },
  { name: "Suitcase carry", p: "coreL", eq: ["db", "kb"], muscle: "Obliques, grip", side: true, timed: true },
  { name: "Side plank hip dip", p: "coreL", eq: ["bw"], muscle: "Obliques", side: true },
  // Conditioning
  { name: "Burpee", p: "cardio", eq: ["bw"], muscle: "Full body" },
  { name: "Mountain climber", p: "cardio", eq: ["bw"], muscle: "Core, shoulders" },
  { name: "High knees", p: "cardio", eq: ["bw"], muscle: "Legs, heart rate" },
  { name: "Skater jump", p: "cardio", eq: ["bw"], muscle: "Legs, balance" },
  { name: "Dumbbell thruster", p: "cardio", eq: ["db"], muscle: "Full body" },
  { name: "Kettlebell goblet squat to press", p: "cardio", eq: ["kb"], muscle: "Full body" },
];

/** The order of movement slots per focus. The generator walks this list, so the first slots matter most. */
export const PLANS: Record<Focus, string[]> = {
  full: ["squat", "pushH", "hinge", "pullH", "lunge", "pushV", "pullV", "coreA", "glute", "coreR"],
  upper: ["pushH", "pullH", "pushV", "pullV", "delt", "bi", "tri", "rear", "chest", "coreA"],
  lower: ["squat", "hinge", "lunge", "glute", "ham", "quad", "calf", "abduct", "coreA"],
  push: ["pushH", "pushV", "pushH", "delt", "tri", "chest", "tri", "delt"],
  pull: ["pullV", "pullH", "rear", "bi", "pullH", "bi", "pullV", "rear"],
  core: ["coreA", "coreF", "coreR", "coreL", "coreF", "coreA", "coreR", "coreF"],
  glutes: ["glute", "hinge", "lunge", "abduct", "glute", "squat", "abduct", "ham"],
  arms: ["bi", "tri", "bi", "tri", "bi", "tri", "delt", "rear"],
};

export const GOALS: Record<Goal, { label: string; note: string }> = {
  muscle: { label: "Build muscle", note: "Moderate weight, 8 to 12 reps, close to failure." },
  strength: { label: "Get stronger", note: "Heavy compound lifts first, low reps, long rests." },
  fatloss: { label: "Burn fat", note: "A timed circuit that keeps your heart rate up." },
  endurance: { label: "Endurance", note: "Lighter loads, high reps, short rests." },
};

export const FOCUS: Record<Focus, string> = {
  full: "Full body", upper: "Upper body", lower: "Legs", push: "Push", pull: "Pull",
  core: "Abs and core", glutes: "Glutes", arms: "Arms",
};

export const EQUIP: { id: Eq; label: string }[] = [
  { id: "db", label: "Dumbbells" },
  { id: "kb", label: "Kettlebell" },
  { id: "band", label: "Bands" },
  { id: "bb", label: "Barbell" },
  { id: "machine", label: "Machines and cables" },
];

export const TIMES = [10, 20, 30, 45, 60];

export type Options = { goal: Goal; focus: Focus; time: number; eq: Eq[]; seed: number };

export type Item = Ex & { sets: number; dose: string; rest: number; work: number };
export type Plan = {
  title: string;
  format: "sets" | "circuit";
  rounds: number;
  warmup: string;
  items: Item[];
  minutes: number;
  note: string;
};

/** Small seeded PRNG so a link reproduces the same workout. */
function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function prescribe(ex: Ex, goal: Goal, slot: number): Omit<Item, keyof Ex> {
  const side = ex.side ? " each side" : "";
  const hold = (s: string) => ({ dose: `${s} hold${side}`, work: 40 });
  if (goal === "strength") {
    if (ex.big && slot < 2) return { sets: 4, rest: 150, ...(ex.timed ? hold("30s") : { dose: `4 to 6 reps${side}`, work: 25 }) };
    return { sets: 3, rest: 75, ...(ex.timed ? hold("30–45s") : { dose: `8 to 10 reps${side}`, work: 35 }) };
  }
  if (goal === "endurance") return { sets: 2, rest: 40, ...(ex.timed ? hold("45–60s") : { dose: `15 to 20 reps${side}`, work: 45 }) };
  // muscle
  if (ex.big && slot < 2) return { sets: 3, rest: 90, ...(ex.timed ? hold("30–45s") : { dose: `6 to 10 reps${side}`, work: 35 }) };
  return { sets: 3, rest: 60, ...(ex.timed ? hold("30–45s") : { dose: `10 to 12 reps${side}`, work: 35 }) };
}

export function generate(o: Options): Plan {
  const rand = rng(o.seed);
  const have = new Set<Eq>(["bw", ...o.eq]);
  const usable = EXERCISES.filter((e) => e.eq.some((q) => have.has(q)));
  // Prefer loaded versions when the person has equipment: bodyweight moves get a lower weight.
  const pick = (slot: string, used: Set<string>) => {
    const pool = usable.filter((e) => e.p === slot && !used.has(e.name));
    if (!pool.length) return undefined;
    const loaded = pool.filter((e) => e.eq.some((q) => q !== "bw" && have.has(q)));
    const keepBw = slot.startsWith("core") || slot === "cardio" || !loaded.length;
    const choices = keepBw ? pool.flatMap((e) => (loaded.includes(e) ? [e, e] : [e])) : loaded;
    return choices[Math.floor(rand() * choices.length)];
  };

  const circuit = o.goal === "fatloss";
  const warm = o.time >= 45 ? 5 : o.time >= 20 ? 3 : 2;
  let budget = (o.time - warm) * 60;
  const plan = PLANS[o.focus];
  const used = new Set<string>();
  const items: Item[] = [];
  let rounds = 1;

  if (circuit) {
    rounds = o.time <= 10 ? 2 : o.time <= 20 ? 3 : o.time <= 30 ? 4 : 5;
    const perEx = rounds * 60; // 40s work, 20s switch
    const count = Math.max(3, Math.min(8, Math.floor((budget - (rounds - 1) * 60) / perEx)));
    // Circuits mix in one conditioning move for every 3 strength moves.
    const slots: string[] = [];
    for (let i = 0; slots.length < count; i++) {
      if ((slots.length + 1) % 4 === 0 && o.focus !== "core") slots.push("cardio");
      else slots.push(plan[i % plan.length]);
    }
    for (const s of slots) {
      const ex = pick(s, used);
      if (!ex) continue;
      used.add(ex.name);
      items.push({ ...ex, sets: rounds, dose: ex.side ? "40s, switch sides halfway" : "40s on, 20s off", rest: 20, work: 40 });
    }
  } else {
    for (let i = 0; i < 16 && items.length < 8; i++) {
      const ex = pick(plan[i % plan.length], used);
      if (!ex) continue;
      const rx = prescribe(ex, o.goal, items.length);
      // Short sessions: one fewer set each, so you get more exercises instead of more rest.
      if (o.time <= 20 && o.goal !== "endurance") rx.sets = Math.max(2, rx.sets - 1);
      const cost = rx.sets * (rx.work * (ex.side ? 1.6 : 1) + rx.rest) + 20;
      if (items.length >= 3 && cost > budget + 120) break;
      used.add(ex.name);
      items.push({ ...ex, ...rx });
      budget -= cost;
    }
  }

  const used_s = circuit
    ? rounds * items.length * 60 + (rounds - 1) * 60
    : items.reduce((s, it) => s + it.sets * (it.work * (it.side ? 1.6 : 1) + it.rest) + 20, 0);
  const minutes = Math.max(o.time - 3, Math.round(used_s / 60) + warm);

  const kit = o.eq.length === 0 ? "no equipment" : o.eq.length > 2 ? "full gym" : o.eq.map((q) => EQUIP.find((e) => e.id === q)!.label.toLowerCase()).join(" and ");
  return {
    title: `${o.time}-minute ${FOCUS[o.focus].toLowerCase()} workout, ${kit}`,
    format: circuit ? "circuit" : "sets",
    rounds,
    warmup: warm >= 3 ? `${warm} minutes: easy cardio, then 2 light sets of the first exercise` : "2 minutes: arm circles, hip circles, 10 bodyweight squats",
    items,
    minutes: Math.min(minutes, o.time),
    note: circuit
      ? `Do every exercise for 40 seconds with 20 seconds to switch. Rest 1 minute after each round. ${rounds} rounds.`
      : GOALS[o.goal].note,
  };
}

/** Plain-text version for copying. */
export function asText(p: Plan) {
  const lines = [p.title, "", `Warm-up: ${p.warmup}`, ""];
  if (p.format === "circuit") lines.push(`Circuit, ${p.rounds} rounds. 40s work, 20s rest, 1 min between rounds.`, "");
  p.items.forEach((it, i) => {
    lines.push(p.format === "circuit" ? `${i + 1}. ${it.name}` : `${i + 1}. ${it.name}: ${it.sets} × ${it.dose}, rest ${it.rest}s`);
  });
  lines.push("", "Made with the Fitsaver workout generator: https://fitsaver.app/tools/workout-generator");
  return lines.join("\n");
}

export const DEFAULTS: Options = { goal: "muscle", focus: "full", time: 30, eq: ["db"], seed: 7 };

const COLORS = ["#E2FF2E", "#4FE3D1", "#FF6BAE", "#5B8CFF", "#FF8E3C", "#A98BFF"];
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const swapIcon = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 7h13l-3-3M20 17H7l3 3"/></svg>`;

/** The routine list, as HTML. Used for the first paint and every regenerate. */
export function itemsHtml(p: Plan, animate = false) {
  return p.items
    .map((it, i) => {
      const dose = p.format === "circuit"
        ? `<b>${esc(it.dose)}</b><small>${p.rounds} rounds</small>`
        : `<b>${it.sets} × ${esc(it.dose)}</b><small>Rest ${it.rest >= 120 ? `${it.rest / 60} min` : `${it.rest}s`}</small>`;
      return `<li class="ex${animate ? " ex-in" : ""}" style="--c:${COLORS[i % COLORS.length]};--i:${i}">
  <span class="ex__n">${i + 1}</span>
  <div class="ex__main"><b>${esc(it.name)}</b><span>${esc(it.muscle)}</span></div>
  <div class="ex__dose">${dose}</div>
  <button type="button" class="ex__swap" data-swap="${i}" aria-label="Swap ${esc(it.name)} for another exercise">${swapIcon}</button>
</li>`;
    })
    .join("");
}

/** A different exercise for the same slot, or undefined if there is none. */
export function alternative(p: Plan, idx: number, o: Options, r: number) {
  const have = new Set<Eq>(["bw", ...o.eq]);
  const cur = p.items[idx];
  const names = new Set(p.items.map((x) => x.name));
  const pool = EXERCISES.filter((e) => e.p === cur.p && !names.has(e.name) && e.eq.some((q) => have.has(q)));
  if (!pool.length) return undefined;
  const ex = pool[Math.floor(r * pool.length)];
  if (p.format === "circuit") return { ...ex, sets: cur.sets, dose: ex.side ? "40s, switch sides halfway" : "40s on, 20s off", rest: 20, work: 40 } as Item;
  return { ...ex, ...prescribe(ex, o.goal, idx) } as Item;
}
