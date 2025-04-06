"use client";

import React, { RefObject, UIEvent } from "react"; // Import necessary types
import { Loader2 } from "lucide-react";
import { MessageBubble } from "@/app/_chatComponents/Components";

import { Message } from "ai"; // Import Message type

// Use the Message type from 'ai' library directly or adapt it
// Let's adapt it slightly for clarity if needed, but ensure compatibility
interface DisplayedMessage extends Omit<Message, 'role'> { // Inherit from Message, override role if needed
  role: "user" | "assistant"; // Only allow user/assistant for display
}


// Define prop types for ChatArea
interface ChatAreaProps {
  chatContainerRef: RefObject<HTMLDivElement>;
  handleScroll: (event: UIEvent<HTMLDivElement>) => void;
  loadingHistory: boolean;
  loadingOlderMessages: boolean;
  hasMoreMessages: boolean;
  displayedMessages: Message[]; // Expect Message[] from parent now
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

          {/* Message bubbles - Filter roles directly here */}
          {displayedMessages
            .filter((msg): msg is Message & { role: 'user' | 'assistant' } => msg.role === 'user' || msg.role === 'assistant')
            .map((msg, idx: number) => (
            <MessageBubble
              key={msg.id || idx} // Use Message's id
              message={{
                role: msg.role, // Pass role directly
                content: msg.content,
              }}
            />
          ))}

          {/* Loading indicator for new message */}
          {isLoading && (
            <MessageBubble message={{ role: "assistant", content: "..." }} />
          )}
        </>
      )}
    </div>
  );
}
