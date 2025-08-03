// app/api/chat/route.js
import { createOllama } from "ollama-ai-provider";
import { streamText, CoreMessage } from "ai"; // Import CoreMessage

// Define interface for the request body
interface ChatRequestBody {
  messages: CoreMessage[]; // Use CoreMessage type from 'ai'
  systemPrompt?: string;
  companyDetails?: Record<string, any>; // Or a more specific type if known
  selectedPerson?: { position?: string }; // Or a more specific type
}

const ollama = createOllama();

export async function POST(req: Request) {
  try {
    // Type the destructured variables
    const { messages, systemPrompt, companyDetails, selectedPerson }: ChatRequestBody =
      await req.json();

    

    

    // Combine systemPrompt with userDetails for context
    let fullSystemPrompt = systemPrompt || "";
    if (companyDetails) {
      const companyDetailsString = JSON.stringify(companyDetails, null, 2);
      // Safely access selectedPerson.position with default value
      const assistantRole = selectedPerson?.position ?? "Assistant";

      fullSystemPrompt += `\n\n---\n\n### User Company Information\nThe following section contains details about the user's company, which is the company you work for as an AI assistant. This is **not about you**—it's external context about the user's organization. Use this information to personalize your responses as if you are a colleague within this company, aligning your answers with its mission, vision, policies, and other details.\n\n${companyDetailsString}\n\n### Instructions\n- The text before the 'User Company Information' section defines **your role, personality, and expertise** as an AI ${assistantRole}. Treat this as your identity and behavior guidelines.\n- The 'User Company Information' section is **the user's company context**. Use it to tailor your responses to their specific company, but do not confuse it with your own identity or role.\n- Respond factually based on the company details provided. Never provide a general solution. If you don't have enough information, ask the user to provide more information by specific what information you need exactly to assist the user.\n- Maintain a professional, colleague-like tone, acting as if you work within the user's company."`;
    }

    const mockResponseContent = `This is a mock response for ${selectedPerson?.position || 'the chat'}. Your system prompt was: ${fullSystemPrompt}.`;
    const result = await streamText({
      model: ollama("gemma3:latest"), // Still need a model, but it won't be used for actual generation
      messages: [{ role: 'assistant', content: mockResponseContent }],
    });

    

    // Return the streamed response immediately
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    // Type check the error
    const errorMessage = error instanceof Error ? error.message : "Failed to call Ollama model.";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
