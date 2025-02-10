import { createOllama } from "ollama-ai-provider";
import { streamText } from "ai";

const ollama = createOllama();

export async function POST(req) {
  try {
    const { messages, systemPrompt } = await req.json();

    // If a system prompt is provided, prepend it as the first message
    // so it influences the entire conversation
    if (systemPrompt) {
      messages.unshift({
        role: "system",
        content: systemPrompt,
      });
    }

    // Call Ollama with your chosen model (e.g., llama3.1)
    const result = await streamText({
      model: ollama("deepseek-r1:14b"),
      messages,
    });

    // Return a data-stream response for incremental streaming
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new Response("Failed to call Ollama model.", { status: 500 });
  }
}
