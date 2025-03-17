"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollHandling(
  chatContainerRef,
  messages,
  checkAndLoadMoreMessages,
  selectedPerson
) {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const prevMessagesLengthRef = useRef(messages.length);
  const scrollPositionRef = useRef(null);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = chatContainerRef.current;

    // Show/hide scroll to bottom button
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }

    // Check if we need to load older messages when near the top
    if (selectedPerson && checkAndLoadMoreMessages) {
      checkAndLoadMoreMessages(scrollTop, selectedPerson.id);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Save scroll position before loading older messages
  useEffect(() => {
    if (
      chatContainerRef.current &&
      messages.length > prevMessagesLengthRef.current
    ) {
      // If new messages were added at the end (normal case)
      scrollToBottom();
    } else if (
      chatContainerRef.current &&
      messages.length > 0 &&
      messages.length < prevMessagesLengthRef.current
    ) {
      // If messages were truncated (token limiting case)
      scrollToBottom();
    }

    // Update the previous messages length reference
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Preserve scroll position when older messages are loaded
  useEffect(() => {
    if (scrollPositionRef.current !== null && chatContainerRef.current) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const heightDifference =
        newScrollHeight - scrollPositionRef.current.scrollHeight;

      // Adjust scroll position to maintain the same relative position
      chatContainerRef.current.scrollTop =
        scrollPositionRef.current.scrollTop + heightDifference;

      // Reset the saved position
      scrollPositionRef.current = null;
    }
  }, [messages.length]);

  // Save scroll position before loading older messages
  const saveScrollPosition = () => {
    if (chatContainerRef.current) {
      scrollPositionRef.current = {
        scrollTop: chatContainerRef.current.scrollTop,
        scrollHeight: chatContainerRef.current.scrollHeight,
      };
    }
  };

  return {
    showScrollToBottom,
    handleScroll,
    scrollToBottom,
    saveScrollPosition,
  };
}
