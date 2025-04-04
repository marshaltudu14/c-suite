"use client";

import React, { RefObject, UIEvent } from "react"; // Import necessary types
import { Loader2 } from "lucide-react";
import { MessageBubble } from "@/app/_chatComponents/Components";

// Define a basic structure for a message if not already defined elsewhere
// You might need to adjust this based on your actual message structure
interface DisplayedMessage {
  id?: string | number; // Optional id for key prop
  role: "user" | "assistant" | "agent"; // Adjust roles as needed
  content: string;
}

// Define prop types for ChatArea
interface ChatAreaProps {
  chatContainerRef: RefObject<HTMLDivElement>;
  handleScroll: (event: UIEvent<HTMLDivElement>) => void;
  loadingHistory: boolean;
  loadingOlderMessages: boolean;
  hasMoreMessages: boolean;
  displayedMessages: DisplayedMessage[];
  isLoading: boolean;
}

export default function ChatArea({
  chatContainerRef,
  handleScroll,
  loadingHistory,
  loadingOlderMessages,
  hasMoreMessages,
  displayedMessages,
  isLoading,
}: ChatAreaProps) { // Apply the props type
  return (
    <div
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2 bg-gray-50 dark:bg-gray-900"
    >
      {loadingHistory ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Loading indicator for older messages */}
          {loadingOlderMessages && (
            <div className="flex justify-center py-2 sticky top-0">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          {/* No more messages indicator */}
          {!loadingOlderMessages &&
            !hasMoreMessages &&
            displayedMessages.length > 0 && (
              <div className="text-center text-xs text-gray-500 py-2">
                Beginning of conversation
              </div>
            )}

          {/* Message bubbles */}
          {displayedMessages.map((msg: DisplayedMessage, idx: number) => ( // Add types to map params
            <MessageBubble
              key={msg.id || idx}
              message={{
                role: msg.role === "assistant" ? "assistant" : "user", // Changed "agent" to "assistant"
                content: msg.content,
              }}
            />
          ))}

          {/* Loading indicator for new message */}
          {isLoading && (
            <MessageBubble message={{ role: "assistant", content: "..." }} /> // Changed "agent" to "assistant"
          )}
        </>
      )}
    </div>
  );
}
