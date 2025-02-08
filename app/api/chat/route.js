import { NextResponse } from "next/server";

// This endpoint streams Ollama’s response to the client.
export async function POST(request) {
  try {
    const { messages, agentName, agentPosition } = await request.json();

    // Create a prompt or system-level instruction to guide Ollama’s responses
    // so the agent acts in a certain “role.”
    // Then include the existing conversation in a simple text format
    // (you can refine or change this structure as needed).
    let conversationContext = `You are ${agentName}, the ${agentPosition} of our company. Answer in a friendly, helpful manner.\n\n`;
    messages.forEach((msg) => {
      if (msg.role === "user") {
        conversationContext += `User: ${msg.content}\n`;
      } else {
        conversationContext += `Agent: ${msg.content}\n`;
      }
    });
    // End with an “Agent:” line so Ollama knows to produce the agent’s response.
    conversationContext += "Agent:";

    // Talk to the local Ollama endpoint. Typically: http://localhost:11411/generate
    // (Adjust if your Ollama server is on a different URL/port.)
    const response = await fetch("http://127.0.0.1:11434/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: conversationContext,
        // Ollama may accept other options like model, temperature, etc.
        model: "deepseek-r1:1.5b",
        // temperature: 0.7,
        // You can adjust to your preference.
      }),
    });

    // Stream the NDJSON (Newline Delimited JSON) response back to the client:
    // Each line from Ollama is a JSON object with a "token" or "done" property.
    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: "Ollama server error or no streaming body." },
        { status: 500 }
      );
    }

    // We simply pipe the raw body directly. The client will parse line by line.
    // The key is ensuring the correct headers for streaming.
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in Ollama route:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
