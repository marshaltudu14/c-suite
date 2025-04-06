// app/api/chat/route.js
import { createOllama } from "ollama-ai-provider";
import { streamText, CoreMessage } from "ai"; // Import CoreMessage
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

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

    // Initialize Supabase client
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    // Get the last user message to save to Supabase
    const lastUserMessage =
      messages.length > 0 ? messages[messages.length - 1] : null;

    // Save user message to Supabase if it exists
    if (lastUserMessage && lastUserMessage.role === "user" && userId) {
      await supabase.from("chat_history").insert({
        user_id: userId,
        message: lastUserMessage.content,
        role: "user",
        agent: selectedPerson?.position || "default",
        created_at: new Date().toISOString(),
      });
    }

    // Combine systemPrompt with userDetails for context
    let fullSystemPrompt = systemPrompt || "";
    if (companyDetails) {
      const companyDetailsString = JSON.stringify(companyDetails, null, 2);
      // Safely access selectedPerson.position with default value
      const assistantRole = selectedPerson?.position ?? "Assistant";

      fullSystemPrompt += `\n\n---\n\n### User Company Information\nThe following section contains details about the user's company, which is the company you work for as an AI assistant. This is **not about you**—it's external context about the user's organization. Use this information to personalize your responses as if you are a colleague within this company, aligning your answers with its mission, vision, policies, and other details.\n\n${companyDetailsString}\n\n### Instructions\n- The text before the 'User Company Information' section defines **your role, personality, and expertise** as an AI ${assistantRole}. Treat this as your identity and behavior guidelines.\n- The 'User Company Information' section is **the user's company context**. Use it to tailor your responses to their specific company, but do not confuse it with your own identity or role.\n- Respond factually based on the company details provided. Never provide a general solution. If you don't have enough information, ask the user to provide more information by specific what information you need exactly to assist the user.\n- Maintain a professional, colleague-like tone, acting as if you work within the user's company."`;
    }

    // Call Ollama - remove onText and onCompletion
    const result = await streamText({
      model: ollama("gemma3:latest"),
      system: fullSystemPrompt,
      messages: messages,
    });

    // Function to process stream and save to DB *after* response starts streaming
    const processStreamAndSave = async () => {
      let accumulatedCompletion = "";
      try {
        for await (const textPart of result.textStream) {
          accumulatedCompletion += textPart;
        }

        // Save the complete assistant response to Supabase
        if (userId && accumulatedCompletion) {
          const timestamp = new Date().toISOString();
          const { error } = await supabase.from("chat_history").insert({
            user_id: userId,
            message: accumulatedCompletion, // Use accumulated text
            role: "assistant",
            agent: selectedPerson?.position || "default",
            created_at: timestamp,
          });

          if (error) {
            console.error("Error saving assistant message to Supabase:", error);
          }
        }
      } catch (saveError) {
        console.error("Exception during stream processing or saving:", saveError);
      }
    };

    // Start processing the stream in the background without awaiting it
    processStreamAndSave();

    // Return the streamed response immediately
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    // Type check the error
    const errorMessage = error instanceof Error ? error.message : "Failed to call Ollama model.";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
