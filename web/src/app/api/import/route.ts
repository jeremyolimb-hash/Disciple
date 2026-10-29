import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { describeError, getClient, MODEL } from "@/lib/anthropic";

export const maxDuration = 300;

const ImportedSeries = z.object({
  name: z.string().describe("Series name"),
  subtitle: z.string().describe("Series subtitle or tagline, empty if none"),
  churchName: z.string().describe("Church or campus name, empty if none"),
  weeks: z.array(
    z.object({
      number: z.number().int(),
      date: z.string().describe("Date as written in the document, empty if none"),
      preacher: z.string(),
      title: z.string().describe("Sermon title"),
      book: z.string().describe("Book of the Bible"),
      keyText: z.string().describe("Scripture reference for the sermon"),
      thesis: z.string().describe("Core thesis / big idea"),
      whyThisText: z.string().describe("Rationale for the passage, empty if none"),
      application: z.string().describe("Everyday application, empty if none"),
    }),
  ),
});

/** Extracts a structured series from a pasted planning document. */
export async function POST(request: Request) {
  const { text } = (await request.json()) as { text?: string };
  if (!text?.trim()) {
    return Response.json({ error: "Paste your series planning document first." }, { status: 400 });
  }

  try {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "low", format: zodOutputFormat(ImportedSeries) },
      system:
        "Extract a sermon series plan into structured fields. Copy wording from the document faithfully; leave a field empty rather than inventing content. If the document lists a schedule and later revises a title, use the most specific per-week version.",
      messages: [{ role: "user", content: `<document>\n${text}\n</document>` }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json({ error: "Couldn't read a series from that document." }, { status: 422 });
    }
    return Response.json(response.parsed_output);
  } catch (err) {
    const { message, status } = describeError(err);
    return Response.json({ error: message }, { status });
  }
}
