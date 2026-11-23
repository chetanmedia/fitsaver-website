// Workout split builder: turns days per week + goal into a weekly plan.
// Each training day reuses the workout generator for its routine.
import { generate, FOCUS, type Goal, type Focus, type Eq, type Plan } from "./generator";

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const DAY_COUNTS = [2, 3, 4, 5, 6] as const;
export const SPLIT_TIMES = [30, 45, 60] as const;

export type SplitOptions = { days: number; goal: Goal; time: number; eq: Eq[] };

type Template = { name: string; why: string; schedule: (Focus | null)[] };

const T = (name: string, why: string, schedule: (Focus | null)[]): Template => ({ name, why, schedule });
const _ = null;

/** Monday-first week. null = rest day. */
function template(days: number, goal: Goal): Template {
  switch (days) {
    case 2:
      return T(
        "2 day full body split",
        "With two sessions a week, training your whole body each time is the only way to hit every muscle twice. Space the days out so you recover fully between them.",
        ["full", _, _, "full", _, _, _],
      );
    case 3:
      return goal === "muscle"
        ? T(
            "3 day push, pull, legs split",
            "Push, pull and legs gives each session one clear job, so you can do more sets per muscle. Each muscle is trained once a week, so push hard and add weight or reps every week.",
            ["push", _, "pull", _, "lower", _, _],
          )
        : T(
            "3 day full body split",
            "Three full-body sessions train every muscle three times a week with a rest day between each. It's the most efficient split for strength, fat loss and beginners.",
            ["full", _, "full", _, "full", _, _],
          );
    case 4:
      return T(
        "4 day upper/lower split",
        "Upper and lower days alternate, so every muscle is trained twice a week and you still get three rest days. It's the most popular 4 day split for a reason: it's simple to run and easy to progress.",
        ["upper", "lower", _, "upper", "lower", _, _],
      );
    case 5:
      return T(
        "5 day upper/lower + push/pull/legs split",
        "Two days of upper/lower early in the week, then push, pull and legs. Every muscle gets trained about twice a week, with two rest days to recover.",
        ["upper", "lower", _, "push", "pull", "lower", _],
      );
    default:
      return T(
        "6 day push, pull, legs split",
        "Push, pull and legs, twice through. Every muscle is trained twice a week with lots of total volume. Best for experienced lifters who recover well; keep one day fully off.",
        ["push", "pull", "lower", "push", "pull", "lower", _],
      );
  }
}

const REST_TIPS = [
  "Rest. An easy walk or light stretching is plenty.",
  "Rest. Sleep and protein do the work today.",
  "Rest or easy cardio, 20 to 30 minutes at a chatting pace.",
  "Rest. A 10-minute mobility routine helps if you feel stiff.",
];

export type SplitDay = { day: string; focus: Focus | null; label: string; plan: Plan | null; seed: number; rest?: string };
export type Split = { name: string; why: string; days: SplitDay[]; training: number };

export function buildSplit(o: SplitOptions): Split {
  const t = template(o.days, o.goal);
  let r = 0;
  const seen: Record<string, number> = {};
  const days = t.schedule.map((focus, i): SplitDay => {
    if (!focus) return { day: DAY_NAMES[i], focus: null, label: "Rest", plan: null, seed: 0, rest: REST_TIPS[r++ % REST_TIPS.length] };
    // Repeat days of the same focus get a different seed so the two sessions vary (A/B).
    const n = (seen[focus] = (seen[focus] ?? 0) + 1);
    const seed = 11 + i * 7 + n * 101;
    const plan = generate({ goal: o.goal, focus, time: o.time, eq: o.eq, seed });
    const ab = t.schedule.filter((f) => f === focus).length > 1 ? (n === 1 ? " A" : " B") : "";
    return { day: DAY_NAMES[i], focus, label: FOCUS[focus] + ab, plan, seed };
  });
  return { name: t.name, why: t.why, days, training: days.filter((d) => d.plan).length };
}

export function generatorLink(o: SplitOptions, d: SplitDay) {
  const p = new URLSearchParams({ goal: o.goal, focus: d.focus!, time: String(o.time), eq: o.eq.join(","), seed: String(d.seed) });
  return `/tools/workout-generator?${p}`;
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** The week as HTML. Used for the first paint and every change. */
export function weekHtml(o: SplitOptions, s: Split) {
  return s.days
    .map((d) => {
      if (!d.plan) return `<li class="wk-day wk-day--rest"><p class="wk-day__name">${d.day}</p><p class="wk-day__label">Rest</p><p class="wk-day__rest">${esc(d.rest!)}</p></li>`;
      const ex = d.plan.items
        .slice(0, 5)
        .map((it) => `<li>${esc(it.name)}<small>${d.plan!.format === "circuit" ? esc(it.dose) : `${it.sets} × ${esc(it.dose)}`}</small></li>`)
        .join("");
      const more = d.plan.items.length > 5 ? `<li class="wk-more">+${d.plan.items.length - 5} more</li>` : "";
      return `<li class="wk-day"><p class="wk-day__name">${d.day}</p><p class="wk-day__label">${esc(d.label)}</p><ul class="wk-ex">${ex}${more}</ul><a class="wk-day__go" href="${generatorLink(o, d)}">Full workout, sets and rest</a></li>`;
    })
    .join("");
}

export function weekText(o: SplitOptions, s: Split) {
  const lines = [`${s.name} (${o.time} min sessions)`, ""];
  for (const d of s.days) {
    if (!d.plan) { lines.push(`${d.day}: Rest`); continue; }
    lines.push(`${d.day}: ${d.label}`);
    for (const it of d.plan.items) lines.push(`  - ${it.name}: ${d.plan.format === "circuit" ? it.dose : `${it.sets} x ${it.dose}`}`);
  }
  lines.push("", "Made with the free workout split builder at fitsaver.app/tools/workout-split-builder");
  return lines.join("\n");
}

export const SPLIT_DEFAULTS: SplitOptions = { days: 4, goal: "muscle", time: 45, eq: ["db"] };
