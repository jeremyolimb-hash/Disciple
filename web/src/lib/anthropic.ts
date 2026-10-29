import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;

/** Lazily construct the client so builds don't require ANTHROPIC_API_KEY. */
export function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

/** Turns an SDK error into a message that's safe and useful to show a pastor. */
export function describeError(err: unknown): { message: string; status: number } {
  if (err instanceof Anthropic.AuthenticationError) {
    return { message: "The server's Anthropic API key is invalid.", status: 500 };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return { message: "Too many requests right now — please wait a moment and try again.", status: 429 };
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return { message: "Couldn't reach Claude. Check the server's network connection.", status: 502 };
  }
  if (err instanceof Anthropic.APIError) {
    return { message: `Claude API error (${err.status}): ${err.message}`, status: 502 };
  }
  console.error(err);
  if (err instanceof Error && /API key|apiKey|authToken/i.test(err.message)) {
    return { message: "The server has no Anthropic API key. Set ANTHROPIC_API_KEY in .env.local.", status: 500 };
  }
  return { message: "Unexpected server error.", status: 500 };
}
