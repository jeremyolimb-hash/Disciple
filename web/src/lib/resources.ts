import type { ResourceType } from "./types";

/**
 * The catalog of resources the tool can build from a sermon series.
 * Add or edit entries here to change what pastors can generate.
 */
export const RESOURCE_TYPES: ResourceType[] = [
  {
    id: "small-group-guide",
    name: "Small Group Guide",
    audience: "Group leaders",
    scope: "week",
    description: "Discussion guide with an icebreaker, observation, interpretation, and application questions.",
    instructions: `Write a small group discussion guide for this week's sermon.
Include: a one-paragraph sermon recap, an icebreaker question, the key text reference, 3 observation questions, 3 interpretation questions, 3 application questions, a "this week, try..." practice, and a closing prayer prompt.
Add brief leader notes under any question that could be confusing or that tends to go sideways.`,
  },
  {
    id: "daily-devotional",
    name: "5-Day Devotional",
    audience: "Congregation",
    scope: "week",
    description: "Monday–Friday devotionals that carry the sermon through the week.",
    instructions: `Write a five-day (Monday–Friday) devotional that extends this week's sermon.
Each day: a title, a short Scripture reading (reference only, drawn from the key text or closely related passages), a 200–300 word reflection, one reflection question, and a one-sentence prayer.
Day 1 should revisit the sermon's central idea; Day 5 should point forward to next Sunday when possible.`,
  },
  {
    id: "kids-lesson",
    name: "Kids Lesson",
    audience: "Children's ministry",
    scope: "week",
    description: "Age-appropriate lesson (K–5th) with a big idea, story, activity, and take-home question.",
    instructions: `Write a children's ministry lesson (K–5th grade) based on this week's sermon text.
Include: a one-sentence Big Idea kids can memorize, a memory verse, an opening game or hook, the Bible story retold simply, 3 discussion questions (one for younger, two for older kids), a hands-on activity with supply list, and a take-home question for parents to ask.`,
  },
  {
    id: "family-discussion",
    name: "Family Discussion Card",
    audience: "Parents",
    scope: "week",
    description: "A short card parents can use at dinner or in the car.",
    instructions: `Write a family discussion card parents can use at the dinner table or in the car.
Keep it under 250 words: one sentence summarizing the sermon, the key verse, 3 questions that work across ages, and a simple family prayer.`,
  },
  {
    id: "social-posts",
    name: "Social Media Posts",
    audience: "Communications",
    scope: "week",
    description: "Pre-Sunday teaser, Sunday quote graphic text, and follow-up post.",
    instructions: `Write social media copy for this week's sermon:
1. A pre-Sunday teaser post (Thursday/Friday) that raises the sermon's question.
2. Three short pull-quotes (under 20 words each) suitable for quote graphics.
3. A Monday follow-up post that invites people to watch/listen and apply the message.
Include suggested hashtags sparingly (max 3) and keep the tone warm and non-clickbait.`,
  },
  {
    id: "email-recap",
    name: "Church Email Recap",
    audience: "Congregation",
    scope: "week",
    description: "Monday email that recaps Sunday and points people to the week's resources.",
    instructions: `Write a Monday church-wide email recapping Sunday's sermon.
Include: a subject line (and one alternate), a warm 2–3 paragraph recap, one practical next step, and a short closing that mentions the small group guide and devotional are available. Keep it under 350 words.`,
  },
  {
    id: "sermon-slides",
    name: "Slide Outline",
    audience: "Production",
    scope: "week",
    description: "Slide-by-slide text for the sermon: title, scripture, key points.",
    instructions: `Write a slide-by-slide outline for this sermon's presentation slides.
Number each slide and give its exact on-screen text. Include: a title slide, the key text split across readable slides (reference the translation as [ESV] unless the voice notes specify otherwise), 3–5 main point slides with short phrasing, and a closing application slide. Keep on-screen text short (max ~20 words per slide).`,
  },
  {
    id: "series-overview",
    name: "Series Overview & Promo",
    audience: "Congregation",
    scope: "series",
    description: "Series landing page copy, announcement script, and promo blurb.",
    instructions: `Write promotional material for the whole sermon series:
1. A 150-word series description for the church website.
2. A 60-second announcement script for a Sunday before the series begins.
3. A one-paragraph email or bulletin blurb.
4. A week-by-week list with each title and key text.`,
  },
  {
    id: "reading-plan",
    name: "Series Reading Plan",
    audience: "Congregation",
    scope: "series",
    description: "A daily Bible reading plan that walks through the series' books.",
    instructions: `Create a daily Bible reading plan that runs alongside the full series, one entry per day, grouped by week.
Each week should read through the book or passage being preached that Sunday (and helpful context passages), with a one-line focus for each day. Keep daily readings to roughly 5–10 minutes.`,
  },
  {
    id: "leader-training",
    name: "Group Leader Primer",
    audience: "Group leaders",
    scope: "series",
    description: "Background briefing so leaders understand the series' big picture.",
    instructions: `Write a primer for small group leaders before the series begins.
Include: the big-picture arc of the series, historical and literary background for the books covered, recurring themes and how they point to Jesus, common questions or objections people may raise, and 3 tips for leading discussion during this series.`,
  },
];

export const WEEK_RESOURCES = RESOURCE_TYPES.filter((r) => r.scope === "week");
export const SERIES_RESOURCES = RESOURCE_TYPES.filter((r) => r.scope === "series");

export function getResourceType(id: string): ResourceType | undefined {
  return RESOURCE_TYPES.find((r) => r.id === id);
}

export function resourceKey(resourceTypeId: string, weekId: string | null): string {
  return `${resourceTypeId}:${weekId ?? "series"}`;
}
