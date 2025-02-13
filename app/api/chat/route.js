// app/api/chat/route.js
import { createOllama } from "ollama-ai-provider";
import { streamText } from "ai";

const ollama = createOllama();

export async function POST(req) {
  try {
    const { messages, systemPrompt } = await req.json();

    // Call Ollama with your chosen model
    const result = await streamText({
      model: ollama("deepseek-r1:1.5b"),
      messages,
      system: systemPrompt,
    });

    // Return a data-stream response for incremental streaming
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new Response("Failed to call Ollama model.", { status: 500 });
  }
}
