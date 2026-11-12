export const SITE = {
  url: "https://fitsaver.app",
  name: "Fitsaver",
  // Kept identical to the Framer homepage so the main ranking page doesn't change its title.
  title: "Fitsaver - Workout Organizer and Exercise Planner",
  description:
    "Fitsaver is a workout organizer app that turns Instagram and TikTok workout videos into structured fitness routines. Plan your gym or home workouts and train distraction-free.",
  email: "chay@fitsaver.app",
  appStore: "https://apps.apple.com/us/app/fitsaver-workout-organizer/id6756478119",
  appStoreId: "6756478119",
  playStore: (campaign = "website") =>
    `https://play.google.com/store/apps/details?id=com.fitsaver.app&referrer=utm_source%3D${encodeURIComponent(
      campaign === "website" ? "website" : "blog",
    )}%26utm_campaign%3D${encodeURIComponent(campaign)}`,
  social: {
    instagram: "https://www.instagram.com/fitsaver.app",
    x: "https://x.com/ChethanFromPM",
  },
  gaId: "G-XYS1LG7L87",
  ogImage: "/og/fitsaver-og.png",
};

/** The app's exercise-marker palette: each color marks one exercise on a video timeline. */
export const MARKERS = ["#E2FF2E", "#4FE3D1", "#FF6BAE", "#5B8CFF", "#FF8E3C", "#A98BFF"] as const;

export function absoluteUrl(path: string) {
  if (path === "/") return SITE.url + "/";
  return SITE.url + encodeURI(path);
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
