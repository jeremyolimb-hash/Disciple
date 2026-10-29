import { describeError, getClient, MODEL } from "@/lib/anthropic";
import { buildUserPrompt, SYSTEM_PROMPT } from "@/lib/prompts";
import { getResourceType } from "@/lib/resources";
import type { Series } from "@/lib/types";

export const maxDuration = 300;

type GenerateRequest = {
  series: Series;
  resourceTypeId: string;
  weekId: string | null;
};

/** Streams a generated resource back to the browser as plain text. */
export async function POST(request: Request) {
  const body = (await request.json()) as GenerateRequest;
  const resource = getResourceType(body.resourceTypeId);
  if (!resource) {
    return Response.json({ error: "Unknown resource type" }, { status: 400 });
  }
  const week = body.weekId ? body.series.weeks.find((w) => w.id === body.weekId) ?? null : null;
  if (resource.scope === "week" && !week) {
    return Response.json({ error: "Week not found" }, { status: 400 });
  }

  const stream = getClient().beta.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(body.series, resource, week) }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n_[Generation was declined. Try adjusting the sermon details and regenerate.]_"));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n_[Output was cut off at the length limit.]_"));
        }
        controller.close();
      } catch (err) {
        const { message } = describeError(err);
        controller.enqueue(encoder.encode(`\n\n[ERROR] ${message}`));
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
