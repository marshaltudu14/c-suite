"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronsDown } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";

/**
 * Typing indicator (animated three dots) for when the message is "..."
 */
function TypingAnimation() {
  // Each dot bounces in sequence using staggered delays
  return (
    <div className="flex items-center space-x-1">
      <motion.span
        className="block w-2 h-2 rounded-full bg-current"
        animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop" }}
      />
      <motion.span
        className="block w-2 h-2 rounded-full bg-current"
        animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "loop",
          delay: 0.1,
        }}
      />
      <motion.span
        className="block w-2 h-2 rounded-full bg-current"
        animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "loop",
          delay: 0.2,
        }}
      />
    </div>
  );
}

/**
 * Get a short excerpt of text (not directly used here, but useful for summarizing).
 */
export function getExcerpt(text = "", maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Splits text by <think>...</think> tags.
 * Segments marked isThink=true need special rendering (accordion).
 */
function parseThinkTags(text = "") {
  const result = [];
  let currentIndex = 0;
  let inThinkMode = false;

  while (true) {
    if (!inThinkMode) {
      const openTagIndex = text.indexOf("<think>", currentIndex);
      if (openTagIndex === -1) {
        const normalText = text.slice(currentIndex);
        if (normalText) result.push({ isThink: false, text: normalText });
        break;
      } else {
        const normalText = text.slice(currentIndex, openTagIndex);
        if (normalText) result.push({ isThink: false, text: normalText });
        currentIndex = openTagIndex + "<think>".length;
        inThinkMode = true;
      }
    } else {
      const closeTagIndex = text.indexOf("</think>", currentIndex);
      if (closeTagIndex === -1) {
        const thinkText = text.slice(currentIndex);
        if (thinkText) result.push({ isThink: true, text: thinkText });
        break;
      } else {
        const thinkText = text.slice(currentIndex, closeTagIndex);
        if (thinkText) result.push({ isThink: true, text: thinkText });
        currentIndex = closeTagIndex + "</think>".length;
        inThinkMode = false;
      }
    }
  }

  return result;
}

/**
 * Collapsible accordion for <think> text segments.
 */
interface ThinkSegmentAccordionProps {
  text: string;
}
function ThinkSegmentAccordion({ text }: ThinkSegmentAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative my-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent text-sm text-gray-600 dark:text-gray-300 underline underline-offset-2"
      >
        {isOpen ? "Hide Internal Thinking" : "Show Internal Thinking"}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-l-4 border-gray-400 dark:border-gray-500 pl-3 mt-1 text-sm text-gray-700 dark:text-gray-200"
          >
            <Markdown>{text}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Text-to-Speech helper function.
 * Speaks the provided text if browser environment is available.
 */
function speakText(text: string) {
  if (typeof window !== "undefined" && text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * MessageBubble for each chat message.
 * Reads only newly added sentences that end with ., ?, or !,
 * skipping anything in <think> tags.
 */
interface Message {
  role: "user" | "assistant";
  content: string;
}
interface MessageBubbleProps {
  message: Message;
}
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const content = message.content.trim();

  // --- Hooks moved to the top level ---
  const prevTextRef = useRef("");
  const accumulatorRef = useRef("");

  // Parse the message content for normal/think segments *before* potential early return
  const segments = parseThinkTags(content);

  // Combine all non-<think> text for TTS *before* potential early return
  const nonThinkText = segments
    .filter((segment) => !segment.isThink)
    .map((segment) => segment.text)
    .join("");

  useEffect(() => {
    // Only do text-to-speech for assistant messages
    if (isUser) return;

    // If there's no new content, do nothing
    if (nonThinkText === prevTextRef.current) return;

    // Check how the text changed
    let newPortion = "";
    if (nonThinkText.startsWith(prevTextRef.current)) {
      // Typical streaming scenario: new text is appended
      newPortion = nonThinkText.slice(prevTextRef.current.length);
    } else {
      // Drastic change, reset everything
      accumulatorRef.current = "";
      newPortion = nonThinkText;
    }

    // Append any truly new text to the accumulator
    accumulatorRef.current += newPortion;

    // Regex to find complete sentences ending with ., ?, or !
    // This will return an array of all matched sentences, e.g. ["Hello!", " Is this new?"]
    const matchedSentences = accumulatorRef.current.match(/[^.!?]+[.!?]/g);

    if (matchedSentences && matchedSentences.length > 0) {
      // Speak each matched sentence
      matchedSentences.forEach((sentence) => {
        //speakText(sentence.trim());
      });
      // Remove these matched sentences from the accumulator
      // We do this by summing the total length of matched sentences
      const totalMatchedLength = matchedSentences.join("").length;
      accumulatorRef.current = accumulatorRef.current.slice(totalMatchedLength);
    }

    // Update previous text pointer
    prevTextRef.current = nonThinkText;
  }, [nonThinkText, isUser]);
  // --- End of moved hooks ---


  // If the message is just three dots, show the typing animation
  if (content === "...") {
    return (
      <motion.div
        initial={{ opacity: 0, x: isUser ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`max-w-xs w-fit break-words rounded-xl p-3 text-sm shadow
          ${
            isUser
              ? "bg-blue-500 text-white self-end"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
          }
        `}
      >
        <TypingAnimation />
      </motion.div>
    );
  }

  // Return the regular message bubble content
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`max-w-xs w-fit break-words rounded-xl p-3 text-sm shadow
        ${
          isUser
            ? "bg-blue-500 text-white self-end"
            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
        }
      `}
    >
      {segments.map((segment, idx) => {
        if (segment.isThink) {
          return <ThinkSegmentAccordion key={idx} text={segment.text} />;
        }
        return (
          <div key={idx} className="my-1 last:mb-0">
            <Markdown>{segment.text}</Markdown>
          </div>
        );
      })}
    </motion.div>
  );
}

/**
 * A floating button to scroll to the bottom of the chat.
 */
interface ScrollToBottomButtonProps {
  onClick: () => void;
}
export function ScrollToBottomButton({ onClick }: ScrollToBottomButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute right-4 bottom-32 p-2 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-lg z-20 transition-colors"
    >
      <ChevronsDown className="h-5 w-5" />
    </motion.button>
  );
}
