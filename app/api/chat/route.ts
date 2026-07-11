import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const runtime = "edge";

const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });
  }

  const { messages } = await req.json();

  const last = messages?.[messages.length - 1];
  if (!last?.content?.trim()) {
    return new Response(JSON.stringify({ error: "Empty message" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const sabotage = req.headers.get("x-sabotage");
  if (sabotage === "throw") {
    throw new Error("Simulated route failure (sabotage test)");
  }

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-4-6"),
      messages,
    });

    return result.toDataStreamResponse({
      getErrorMessage(error) {
        console.error("[stream error]", error);
        return "The response was interrupted. Please retry.";
      },
    });
  } catch (err) {
    console.error("[chat route] upstream failure", err);
    return new Response(
      JSON.stringify({ error: "Upstream request failed" }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
