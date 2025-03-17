"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "@/app/_chatComponents/Components";

export default function ChatArea({
  chatContainerRef,
  handleScroll,
  loadingHistory,
  loadingOlderMessages,
  hasMoreMessages,
  displayedMessages,
  isLoading,
}) {
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
          {displayedMessages.map((msg, idx) => (
            <MessageBubble
              key={msg.id || idx}
              message={{
                role: msg.role === "assistant" ? "agent" : "user",
                content: msg.content,
              }}
            />
          ))}

          {/* Loading indicator for new message */}
          {isLoading && (
            <MessageBubble message={{ role: "agent", content: "..." }} />
          )}
        </>
      )}
    </div>
  );
}
