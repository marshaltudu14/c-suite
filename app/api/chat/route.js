// app/api/chat/route.js
import { createOllama } from "ollama-ai-provider";
import { streamText } from "ai";
import { createClient } from "@/utils/supabase/server";

const ollama = createOllama();

export async function POST(req) {
  try {
    const { messages, systemPrompt, companyDetails, selectedPerson } =
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

      fullSystemPrompt += `\n\n---\n\n### User Company Information\nThe following section contains details about the user's company, which is the company you work for as an AI assistant. This is **not about you**—it's external context about the user's organization. Use this information to personalize your responses as if you are a colleague within this company, aligning your answers with its mission, vision, policies, and other details.\n\n${companyDetailsString}\n\n### Instructions\n- The text before the 'User Company Information' section defines **your role, personality, and expertise** as an AI ${selectedPerson.position}. Treat this as your identity and behavior guidelines.\n- The 'User Company Information' section is **the user's company context**. Use it to tailor your responses to their specific company, but do not confuse it with your own identity or role.\n- Respond factually based on the company details provided. Never provide a general solution. If you don't have enough information, ask the user to provide more information by specific what information you need exactly to assist the user.\n- Maintain a professional, colleague-like tone, acting as if you work within the user's company."`;
    }

    // Call Ollama with your chosen model
    let fullCompletion = "";

    const result = await streamText({
      model: ollama("gemma3:latest"),
      system: fullSystemPrompt,
      messages: messages,
      onText: (text) => {
        console.log("Streaming chunk:", text);
        // Accumulate the text chunks to build the complete response
        fullCompletion += text;
      },
      onCompletion: async (completion) => {
        console.log("Chat complete:", completion);
      },
    });

    // Save the complete assistant response to Supabase after streaming is done
    // This is outside the onCompletion callback to ensure it runs properly
    try {
      if (userId) {
        const timestamp = new Date().toISOString();
        const { error } = await supabase.from("chat_history").insert({
          user_id: userId,
          message: fullCompletion,
          role: "assistant",
          agent: selectedPerson?.position || "default",
          created_at: timestamp,
        });

        if (error) {
          console.error("Error saving assistant message to Supabase:", error);
        } else {
          console.log("Successfully saved assistant message to Supabase");
        }
      }
    } catch (saveError) {
      console.error("Exception when saving to Supabase:", saveError);
    }

    // Return the streamed response directly
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new Response("Failed to call Ollama model.", { status: 500 });
  }
}
