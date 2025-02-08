// app/api/ollama/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { conversation } = await request.json();
    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: "Missing or invalid 'conversation' array" },
        { status: 400 }
      );
    }

    // Build prompt text by concatenating the conversation
    const promptChunks = conversation.map((msg) => {
      if (msg.role === "system") return `${msg.content}\n`;
      if (msg.role === "user") return `User: ${msg.content}\n`;
      if (msg.role === "assistant") return `Assistant: ${msg.content}\n`;
      return "";
    });
    const promptText = promptChunks.join("") + "Assistant: ";

    // Call local Ollama server
    const ollamaRes = await fetch("http://127.0.0.1:11411/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: promptText,
        // Add more params if needed, e.g., "model": "llama2"
      }),
    });

    if (!ollamaRes.ok) {
      return NextResponse.json(
        { error: `Ollama request failed with status ${ollamaRes.status}` },
        { status: 500 }
      );
    }

    const data = await ollamaRes.json();
    const completion = data.completion || "(No response)";
    return NextResponse.json({ response: completion }, { status: 200 });
  } catch (error) {
    console.error("Ollama Route Error:", error);
    return NextResponse.json(
      { error: "Server error calling Ollama." },
      { status: 500 }
    );
  }
}
