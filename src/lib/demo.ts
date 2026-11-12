// The demo workout shown across the homepage. It mirrors a real Fitsaver import:
// a creator reel with exercise names written on screen, broken down step by step.
// The imagery is a licensed photo (already used as a blog header), cropped per segment.
export const CORE = {
  title: "Core Build Workout",
  handle: "core.with.ana",
  source: "Instagram",
  cover: "10 MIN TOTAL CORE",
  file: "qATJEfvTxpUn9pwSKKD7XjLH0.jpg",
  minutes: 12,
  length: 20,
  segments: [
    { name: "Alternating Toe Reach", reps: 12, cap: "x12 Alternating Toe Reach", pos: "60% 45%", zoom: 1, start: 0 },
    { name: "Oblique Leg Raise", reps: 8, cap: "x8 Oblique Leg Raise", pos: "34% 62%", zoom: 1.35, start: 4 },
    { name: "Oblique Twist", reps: 12, cap: "x12 Oblique Twist", pos: "72% 38%", zoom: 1.55, start: 8 },
    { name: "Reverse Plank Knee Drive", reps: 10, cap: "x10 Reverse Plank Knee Drive", pos: "22% 58%", zoom: 1.25, start: 12 },
    { name: "Side Plank Cross Crunch", reps: 12, cap: "x12 Side Plank Cross Crunch", pos: "82% 60%", zoom: 1.45, start: 16 },
  ],
};

export const fmtTime = (s: number) => `0:${String(s).padStart(2, "0")}`;
