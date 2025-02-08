// app/api/ollama/route.js
export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // Call your local Ollama server.
    // Ensure it's running on http://localhost:11411 or update as needed.
    // If you have a different model name, adjust below.
    const ollamaResponse = await fetch("http://localhost:11411/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        model: "deepseek-r1:1.5b", // Example model name
      }),
    });

    if (!ollamaResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch from Ollama." }),
        { status: 500 }
      );
    }

    // Ollama's non-streaming response typically returns { completion: "...text..." }
    const data = await ollamaResponse.json();

    return new Response(JSON.stringify({ completion: data.completion }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
