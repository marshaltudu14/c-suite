"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChat } from "ai/react"; // Vercel AI
import { Loader2, Send } from "lucide-react";
import { executivesData, employeesData } from "@/app/_components/OfficeData";
import ContactsList from "@/app/_chatComponents/ContactList";
import ChatTopBar from "@/app/_chatComponents/ChatTopBar";
import {
  MessageBubble,
  ScrollToBottomButton,
} from "@/app/_chatComponents/Components";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";

export default function ChatInterfacePage({ systemPrompt }) {
  const router = useRouter();
  const pathname = usePathname();

  // Vercel AI chat hook
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

  // ----------------------------------------------------------------
  // Unified user check in a single useEffect block
  // ----------------------------------------------------------------
  useEffect(() => {
    (async () => {
      setLoadingUser(true);
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        if (!data?.user) {
          // If user is null, force a login
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error("Error checking user:", err);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [router, pathname]);

  // (Optional) fetch last chat previews after we have a user
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

  // ------------------- SCROLL / UI LOGIC -------------------- //
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

  // Filter out system messages so they are never displayed to the end user
  const displayedMessages = messages.filter((msg) => msg.role !== "system");

  // ----------------------------------------------------------------
  // If we're still checking or user is invalid, show spinner
  // ----------------------------------------------------------------
  if (loadingUser || !user) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Once the user is known to be valid, render the main interface
  // ----------------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden">
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
          {displayedMessages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={{
                role: msg.role === "assistant" ? "agent" : "user",
                content: msg.content,
              }}
            />
          ))}
          {isLoading && (
            <MessageBubble message={{ role: "agent", content: "..." }} />
          )}
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollToBottom && (
          <ScrollToBottomButton onClick={scrollToBottom} />
        )}

        {/* Sticky bottom input */}
        <div className="sticky bottom-0 z-10 p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center space-x-2">
          <form onSubmit={handleSubmit} className="flex w-full items-center">
            <Textarea
              name="prompt"
              rows={1}
              placeholder="Enter your message..."
              value={input}
              onChange={handleInputChange}
              className="resize-none w-full"
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
