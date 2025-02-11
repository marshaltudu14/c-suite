"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsDown } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";

/**
 * Typing indicator (animated three dots) for when the message is "..."
 */
function TypingAnimation() {
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
 * - For assistant messages, speak only fully ended sentences (ending in ".")
 *   while skipping <think> content.
 */
export function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const content = message.content.trim();

  // Track "visible" text that has been spoken so far
  const [accumulatedText, setAccumulatedText] = useState("");
  // Track leftover partial sentence that hasn't ended in '.'
  const leftoverRef = useRef("");

  // Speak function using the Web Speech API
  function speak(text) {
    if (!window || !window.speechSynthesis) {
      console.log("[TTS] Web Speech API not supported in this environment.");
      return;
    }
    console.log("[TTS] Speaking text:", text);
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    // Only process for the assistant's messages
    if (message.role !== "assistant") return;
    if (!content) return;

    // 1) Parse out <think> segments; keep only normal text
    const segments = parseThinkTags(content).filter((seg) => !seg.isThink);
    const visibleText = segments.map((seg) => seg.text).join("");

    // 2) Compare new visible text to what we've already accounted for
    const newSegment = visibleText.slice(accumulatedText.length);

    console.log("[TTS] Full visible text so far:", visibleText);
    console.log("[TTS] Already accumulated:", accumulatedText);
    console.log("[TTS] New segment to speak:", newSegment);

    if (!newSegment) {
      console.log("[TTS] No new text to speak, returning early.");
      return;
    }

    // 3) Update the accumulated text state
    setAccumulatedText(visibleText);

    // 4) Combine leftover partial with newly arrived text
    const combined = leftoverRef.current + newSegment;
    console.log("[TTS] Combined leftover + new segment:", combined);

    // 5) Split by '.' to detect full sentences
    const parts = combined.split(".");
    // Everything but the last item in `parts` are guaranteed to end in '.'
    const fullSentences = parts.slice(0, -1);
    // The last piece may be incomplete
    leftoverRef.current = parts[parts.length - 1] || "";

    console.log("[TTS] Found full sentences:", fullSentences);
    console.log("[TTS] Leftover partial sentence:", leftoverRef.current);

    // 6) Speak each fully ended sentence
    fullSentences.forEach((sentence) => {
      const speakable = sentence.trim() + ".";
      // Ensure it's not empty or whitespace
      if (speakable.trim() !== ".") {
        speak(speakable);
      }
    });
  }, [content, message.role, accumulatedText]);

  // If the content is just "..." => show typing animation
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

  // Otherwise parse <think> segments for visual rendering
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
          // Renders the "think" text as an accordion
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
