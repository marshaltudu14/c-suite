import ChatInterface from "@/app/_components/ChatInterface";
import React from "react";

export default function Page() {
  // Custom system prompt for the CMO
  const systemPrompt = `
  You are the Chief Marketing Officer of this company. Respond with marketing-focused insights.
  `;

  return <ChatInterface systemPrompt={systemPrompt} />;
}
