import type { ResourceType, Series, Week } from "./types";

export const SYSTEM_PROMPT = `You are a ministry resource writer working alongside a pastor and church staff.
You turn sermon series plans into ready-to-use resources for a local church: small group guides, devotionals, kids lessons, communications, and more.

Guidelines:
- Stay faithful to the biblical text and to the sermon's stated thesis and application. Do not invent claims about what the preacher said beyond what you are given.
- Match the church's voice and theological tradition when it is provided.
- Write for real people in a local church: clear, warm, concrete, and free of jargon unless the audience calls for it.
- Cite Scripture by reference. Quote only short phrases rather than long passages.
- Output clean Markdown with headings, ready to paste into a document. Do not add preamble or closing commentary about the task.`;

function describeWeek(week: Week): string {
  const lines = [
    `Week ${week.number}${week.date ? ` (${week.date})` : ""}${week.title ? `: "${week.title}"` : ""}`,
    week.book && `Book: ${week.book}`,
    week.keyText && `Key text: ${week.keyText}`,
    week.preacher && `Preacher: ${week.preacher}`,
    week.thesis && `Core thesis: ${week.thesis}`,
    week.whyThisText && `Why this text: ${week.whyThisText}`,
    week.application && `Everyday application: ${week.application}`,
  ].filter(Boolean);
  if (week.notes.trim()) {
    lines.push(`Sermon notes / manuscript:\n${week.notes.trim()}`);
  }
  return lines.join("\n");
}

function describeSeries(series: Series): string {
  const lines = [
    `Series: ${series.name}${series.subtitle ? ` — ${series.subtitle}` : ""}`,
    series.churchName && `Church: ${series.churchName}`,
    series.voice && `Voice and context: ${series.voice}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildUserPrompt(series: Series, resource: ResourceType, week: Week | null): string {
  const overview = series.weeks
    .map((w) => `- Week ${w.number}: ${w.title || "(untitled)"}${w.keyText ? ` — ${w.keyText}` : ""}`)
    .join("\n");

  const parts = [
    `<series>\n${describeSeries(series)}\n\nSchedule:\n${overview}\n</series>`,
  ];

  if (resource.scope === "series") {
    parts.push(
      `<weeks>\n${series.weeks.map(describeWeek).join("\n\n")}\n</weeks>`,
    );
  } else if (week) {
    parts.push(`<this_week>\n${describeWeek(week)}\n</this_week>`);
  }

  parts.push(`<task>\nResource: ${resource.name} (for ${resource.audience})\n${resource.instructions}\n</task>`);
  return parts.join("\n\n");
}
