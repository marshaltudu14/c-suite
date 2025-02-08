// app/api/chat/route.js
import { NextResponse } from "next/server";
import { Ollama } from "ollama";

export async function POST(request) {
  try {
    const { conversation } = await request.json();
    if (!Array.isArray(conversation)) {
      return NextResponse.json(
        { error: "Missing or invalid 'conversation' array" },
        { status: 400 }
      );
    }

    // Prepare a single prompt string from the conversation array
    // e.g., [ { role: 'user', content: 'Hello' }, ... ]
    const promptParts = conversation.map((msg) => {
      switch (msg.role) {
        case "system":
          return `${msg.content}\n`;
        case "user":
          return `User: ${msg.content}\n`;
        case "assistant":
          return `Assistant: ${msg.content}\n`;
        default:
          return "";
      }
    });
    const prompt = promptParts.join("") + "Assistant: ";

    console.log("Prompt:", prompt);

    // Create an Ollama client
    // Adjust baseUrl if your Ollama server is on a different host/port
    const client = new Ollama({ baseUrl: "http://127.0.0.1:11411" });

    // Generate a completion using the prepared prompt
    // You can also pass a 'model' property, e.g. { model: "llama2" }
    const response = await client.generate({
      prompt: prompt,
      model: "deepseek-r1:1.5b",
      // any other options from the 'ollama' package
    });

    // response.data might be the entire result object, or
    // if you're using the streaming approach in the library,
    // you might collect tokens differently. The below assumes
    // the library returns something like { completion: "..." }.
    const rawText = response?.completion || response?.data || "(No response)";

    return NextResponse.json({ response: rawText }, { status: 200 });
  } catch (error) {
    console.error("Ollama Route Error:", error);
    return NextResponse.json(
      { error: "Server error calling Ollama with the ollama library." },
      { status: 500 }
    );
  }
}
