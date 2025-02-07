import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Extract the messages payload from the request body.
    const { messages } = await request.json();

    // Set the local Ollama API endpoint.
    // Adjust the URL if your Ollama instance is hosted on a different port or path.
    const ollamaURL = "http://localhost:11434/api/generate";

    // Prepare the payload. (Some Ollama configurations may require additional fields such as a model name.)
    const payload = {
      messages,
      // model: "your-model-name" // Uncomment and adjust if required.
    };

    // Send the payload to the Ollama API.
    const ollamaRes = await fetch(ollamaURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // If Ollama returns an error, pass it along.
    if (!ollamaRes.ok) {
      const errorText = await ollamaRes.text();
      return new NextResponse(errorText, { status: ollamaRes.status });
    }

    // Parse the JSON response from Ollama.
    const data = await ollamaRes.json();

    // Assume the Ollama API responds with a field "reply" that contains the generated text.
    // Adjust the response structure if necessary.
    return NextResponse.json({ reply: data.reply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
