// app/api/ollama/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversation, systemPrompt } = body;

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: "Missing or invalid 'conversation' array" },
        { status: 400 }
      );
    }
    // Default to a generic system role if none is provided
    const basePrompt =
      systemPrompt ||
      "You are a helpful AI assistant. Please answer questions helpfully and concisely.";

    // Concatenate conversation
    const conversationText = conversation
      .map((msg) => {
        if (msg.role === "system") return `${msg.content}\n`;
        if (msg.role === "user") return `User: ${msg.content}\n`;
        if (msg.role === "assistant") return `Assistant: ${msg.content}\n`;
        return "";
      })
      .join("");

    const fullPrompt = `${basePrompt}\n${conversationText}\nAssistant: `;

    // Forward to local Ollama
    const ollamaRes = await fetch("http://127.0.0.1:11411/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        // Add any other Ollama options/params here if needed
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
    console.error("Ollama Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
