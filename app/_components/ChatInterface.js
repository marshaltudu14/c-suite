"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "ai/react"; // Vercel AI

import { executivesData, employeesData } from "@/app/_components/OfficeData";
import ContactsList from "@/app/_chatComponents/ContactList";
import ChatTopBar from "@/app/_chatComponents/ChatTopBar";
import {
  MessageBubble,
  ScrollToBottomButton,
} from "@/app/_chatComponents/Components";

import { createClient } from "@/utils/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export default function ChatInterfacePage({ systemPrompt }) {
  const pathname = usePathname();

  // 1) Use the Vercel AI "useChat" hook,
  //    specifying our custom Ollama endpoint.
  //    Also set "initialMessages" so the system prompt is included at the start.
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      endpoint: "/api/chat",
      initialMessages: systemPrompt
        ? [{ role: "system", content: systemPrompt }]
        : [],
    });

  // Identify if it's /office/executive/<id> or /office/employee/<id>
  const pathParts = pathname.split("/");
  const category = pathParts[2]; // "executive" or "employee"
  const personId = pathParts[3];
  const isExecutive = category === "executive";
  const dataList = isExecutive ? executivesData : employeesData;
  const selectedPerson = dataList.find((item) => item.id === personId) || null;

  // Left panel states
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [executivesChats, setExecutivesChats] = useState({});
  const [employeesChats, setEmployeesChats] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);

  // Scrolling logic
  const chatContainerRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  /* ------------------- LEFT PANEL LOGIC -------------------- */
  useEffect(() => {
    // (Optional) fetch user from Supabase
    const getUserSession = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) console.error("Error fetching user:", error);
        setUser(currentUser);
      } catch (err) {
        console.error("Error in getUserSession:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    getUserSession();
  }, []);

  // (Optional) fetch last chat previews
  useEffect(() => {
    if (!user) return;
    const fetchLastChats = async () => {
      try {
        const newExecutiveChats = {};
        executivesData.forEach((exec) => {
          newExecutiveChats[exec.id] = `Last chat with ${exec.name}`;
        });

        const newEmployeeChats = {};
        employeesData.forEach((emp) => {
          newEmployeeChats[emp.id] = `Last chat with ${emp.name}`;
        });

        setExecutivesChats(newExecutiveChats);
        setEmployeesChats(newEmployeeChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchLastChats();
  }, [user]);

  /* ------------------- SCROLL / UI LOGIC -------------------- */
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = chatContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
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

  // Auto scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Left panel: only visible on md+ */}
      <ContactsList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        executivesChats={executivesChats}
        employeesChats={employeesChats}
        loadingUser={loadingUser}
        currentCategory={category}
        currentPersonId={personId}
      />

      {/* Right side (chat) => full width on mobile, 70% on desktop */}
      <div className="relative flex flex-col w-full md:w-2/3">
        {/* Top bar */}
        <ChatTopBar selectedPerson={selectedPerson} />

        {/* Chat area */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2"
        >
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              // useChat messages have role === "user" or "assistant"
              // We'll interpret "assistant" as "agent" to match your design
              message={{
                role: msg.role === "assistant" ? "agent" : "user",
                content: msg.content,
              }}
            />
          ))}

          {/* Show a bubble or loader while AI is thinking */}
          {isLoading && (
            <MessageBubble message={{ role: "agent", content: "..." }} />
          )}
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollToBottom && (
          <ScrollToBottomButton onClick={scrollToBottom} />
        )}

        {/* Sticky bottom input => useChat handles sending to /api/chat */}
        <div className="sticky bottom-0 z-10 p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center space-x-2">
          <form onSubmit={handleSubmit} className="flex w-full items-center">
            <Textarea
              name="prompt"
              rows={1}
              placeholder="Enter your message..."
              value={input}
              onChange={handleInputChange}
              className="resize-none transition-all w-full"
              disabled={!selectedPerson || isLoading}
            />
            <button
              className="ml-2 p-2 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
              type="submit"
              disabled={!selectedPerson || isLoading}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
