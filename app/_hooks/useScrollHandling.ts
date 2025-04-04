"use client";

import React, { useState, useEffect, useRef, RefObject } from "react"; // Import React

// Define types for props and state
interface Message { // Assuming a basic message structure
  id: string | number;
  content: string;
  // Add other message properties if needed
}

interface SelectedPerson { // Assuming a basic person structure
  id: string | number;
  // Add other person properties if needed
}

interface ScrollPosition {
  scrollTop: number;
  scrollHeight: number;
}

export function useScrollHandling(
  chatContainerRef: RefObject<HTMLDivElement>,
  messages: Message[],
  checkAndLoadMoreMessages: (scrollTop: number, personId: string | number) => void,
  selectedPerson: SelectedPerson | null
) {
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);
  const prevMessagesLengthRef = useRef<number>(messages.length);
  const scrollPositionRef = useRef<ScrollPosition | null>(null);

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
    // Only trigger if we're very close to the top (scrollTop < 100px)
    if (selectedPerson && checkAndLoadMoreMessages && scrollTop < 100) {
      console.log(
        `Scroll position: ${scrollTop}px from top, checking for more messages...`
      );
      checkAndLoadMoreMessages(scrollTop, selectedPerson.id);
    }
  };

  // Wrap scrollToBottom in useCallback to stabilize its reference for useEffect dependency
  const scrollToBottom = React.useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth", // Keep smooth for user-initiated scrolls
      });
    }
  }, [chatContainerRef]); // Dependency on chatContainerRef

  // Effect for scrolling when new messages are added or truncated
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
  }, [messages, chatContainerRef, scrollToBottom]); // Added chatContainerRef and scrollToBottom

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
  }, [messages.length, chatContainerRef]); // Added chatContainerRef

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
