"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsDown } from "lucide-react";
import React, { useState } from "react";
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
function ThinkSegmentAccordion({ text }) {
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
 * MessageBubble for each chat message.
 * - If the content is "...", show the TypingAnimation.
 * - Otherwise parse normal text and <think> segments.
 */
export function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const content = message.content.trim();

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

  // Otherwise, parse the message content for normal/think segments
  const segments = parseThinkTags(content);

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
          // Renders as an accordion
          return <ThinkSegmentAccordion key={idx} text={segment.text} />;
        }
        // Normal text
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
 * A button to scroll to the bottom of the chat
 */
export function ScrollToBottomButton({ onClick }) {
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
