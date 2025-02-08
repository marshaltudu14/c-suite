"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MoreVertical,
  Send,
  ChevronsDown,
  Search,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { createClient } from "@/utils/supabase/client";
import {
  demoExecutiveMessages,
  demoEmployeeMessages,
  executivesData,
  employeesData,
} from "@/app/_components/OfficeData";

/* 
  This component:
  - Reads agent info from the URL (like your original code).
  - In desktop view (md: breakpoint and up), it shows a left panel (30% width) with a contact list (executives + employees) and a right panel (70%) containing the chat.
  - On mobile/tablets, we hide the left panel and show the chat at full width.
  - The back button in the chat’s top bar sends the user to the homepage ("/").
  - We replicate the UI/logic from your homepage for searching/filtering, plus the same approach to showing either placeholder Supabase chat data or demo messages.
  - The chat itself is basically the same as before, with smooth scrolling to the bottom, animated message bubbles, etc.
*/

// Framer Motion variants for neat staggered appearance (copied from homepage)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

/**
 * Utility function: returns an excerpt of a text if it exceeds `maxLength`.
 */
function getExcerpt(text = "", maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// A simple bubble for messages, with role-based slide direction
function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`max-w-xs w-fit break-words rounded-xl p-3 text-sm shadow
        ${
          isUser
            ? "bg-blue-500 text-white self-end"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
        }
      `}
    >
      {message.content}
    </motion.div>
  );
}

// The left panel for listing all executives/employees, visible only on md+ screens
function ContactsList({
  searchQuery,
  setSearchQuery,
  user,
  executivesChats,
  employeesChats,
  loadingUser,
  currentCategory,
  currentPersonId,
}) {
  // Filter logic
  const filteredExecutives = executivesData.filter((exec) => {
    const text = `${exec.name} ${exec.position}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const filteredEmployees = employeesData.filter((emp) => {
    const text = `${emp.name} ${emp.position}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="hidden md:flex md:flex-col w-1/3 h-full border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
      {loadingUser ? (
        <div className="flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-300">Loading user...</p>
        </div>
      ) : (
        <>
          {/* Search input */}
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search employees or executives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Executives list */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mb-4"
          >
            <h2 className="my-2 text-lg font-bold text-gray-800 dark:text-gray-100">
              Executives
            </h2>
            <div className="flex flex-col space-y-2">
              {filteredExecutives.length > 0 ? (
                filteredExecutives.map((exec) => {
                  // Real chat from supabase if user is logged in, else demo
                  const rawMessage = user
                    ? executivesChats[exec.id] || ""
                    : demoExecutiveMessages[exec.id] || "";
                  const chatMessage = getExcerpt(rawMessage, 100);

                  // Link to /office/executive/<id>
                  const linkHref = `/office/executive/${exec.id}`;
                  // Is it currently active?
                  const isActive =
                    currentCategory === "executive" &&
                    currentPersonId === exec.id;

                  return (
                    <motion.div key={exec.id} variants={itemVariants}>
                      <Link href={linkHref}>
                        <div
                          className={`group flex w-full cursor-pointer items-start space-x-3 rounded-2xl bg-white px-4 py-3 shadow hover:shadow-lg transition dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-50 ${
                            isActive ? "ring-2 ring-blue-400" : ""
                          }`}
                        >
                          {!exec.image ? (
                            <Skeleton className="h-12 w-12 rounded-full" />
                          ) : (
                            <Image
                              src={exec.image}
                              alt={exec.name}
                              className="h-12 w-12 rounded-full object-cover"
                              width={48}
                              height={48}
                            />
                          )}
                          <div className="flex flex-col text-gray-700 dark:text-gray-200">
                            <p className="font-semibold text-base">
                              {exec.name}{" "}
                              <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({exec.position})
                              </span>
                            </p>
                            {/* Excerpt of last message */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {chatMessage}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No executives found.
                </p>
              )}
            </div>
          </motion.section>

          {/* Employees list */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <h2 className="my-2 text-lg font-bold text-gray-800 dark:text-gray-100">
              Employees
            </h2>
            <div className="flex flex-col space-y-2">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  const rawMessage = user
                    ? employeesChats[emp.id] || ""
                    : demoEmployeeMessages[emp.id] || "";
                  const chatMessage = getExcerpt(rawMessage, 100);

                  // Link to /office/employee/<id>
                  const linkHref = `/office/employee/${emp.id}`;
                  const isActive =
                    currentCategory === "employee" &&
                    currentPersonId === emp.id;

                  return (
                    <motion.div key={emp.id} variants={itemVariants}>
                      <Link href={linkHref}>
                        <div
                          className={`group flex w-full cursor-pointer items-start space-x-3 rounded-2xl bg-white px-4 py-3 shadow hover:shadow-lg transition dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-50 ${
                            isActive ? "ring-2 ring-blue-400" : ""
                          }`}
                        >
                          {!emp.image ? (
                            <Skeleton className="h-12 w-12 rounded-full" />
                          ) : (
                            <Image
                              src={emp.image}
                              alt={emp.name}
                              className="h-12 w-12 rounded-full object-cover"
                              width={48}
                              height={48}
                            />
                          )}
                          <div className="flex flex-col text-gray-700 dark:text-gray-200">
                            <p className="font-semibold text-base">
                              {emp.name}
                              <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({emp.position})
                              </span>
                            </p>
                            {/* Excerpt of last message */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {chatMessage}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No employees found.
                </p>
              )}
            </div>
          </motion.section>
        </>
      )}
    </div>
  );
}

export default function ChatInterface() {
  const router = useRouter();
  const pathname = usePathname();

  // Extract category/personId from URL, e.g. /office/executive/ceo
  const pathParts = pathname.split("/");
  const category = pathParts[2]; // "executive" or "employee"
  const personId = pathParts[3];

  // Attempt to find matching person
  const isExecutive = category === "executive";
  const dataList = isExecutive ? executivesData : employeesData;
  const selectedPerson = dataList.find((item) => item.id === personId) || null;

  // States for the left panel
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [executivesChats, setExecutivesChats] = useState({});
  const [employeesChats, setEmployeesChats] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Scroll + text area refs
  const textAreaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const maxHeightPx = 128;

  /* ------------------- LEFT PANEL LOGIC -------------------- */
  // Retrieve user session
  useEffect(() => {
    const getUserSession = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Error in getUserSession:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    getUserSession();
  }, []);

  // If logged in, fetch actual last chats from Supabase (placeholder)
  useEffect(() => {
    const fetchLastChats = async () => {
      try {
        // Replace with your real queries. For now, placeholders:
        const newExecutiveChats = {};
        executivesData.forEach((exec) => {
          newExecutiveChats[exec.id] =
            "Last chat from Supabase (placeholder) for " + exec.name;
        });

        const newEmployeeChats = {};
        employeesData.forEach((emp) => {
          newEmployeeChats[emp.id] =
            "Last chat from Supabase (placeholder) for " + emp.name;
        });

        setExecutivesChats(newExecutiveChats);
        setEmployeesChats(newEmployeeChats);
      } catch (error) {
        console.error("Error fetching last chats:", error);
      }
    };

    if (user) {
      fetchLastChats();
    }
  }, [user]);

  /* ------------------- CHAT LOGIC -------------------- */
  // On mount or if user navigates to a new URL-based agent, set an intro if no messages
  useEffect(() => {
    if (selectedPerson) {
      // If we have no messages yet, show an intro
      if (messages.length === 0) {
        const introduction = `Hi, I'm ${selectedPerson.name}, the ${selectedPerson.position}. How can I help you today?`;
        setMessages([{ role: "agent", content: introduction }]);
      }
    } else {
      // If unknown route, clear the messages
      setMessages([]);
    }
    // We only want to run this logic once when URL changes or person changes
    // so we won't re-run it on each message state update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPerson]);

  // Scroll to bottom if needed
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

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message (dummy logic)
  const handleSend = () => {
    const text = newMessage.trim();
    if (!text || !selectedPerson) return;

    // Add user’s message + static agent reply
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "agent", content: "Thanks for your message! (Static response)" },
    ]);
    setNewMessage("");

    // Reset text area
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.overflowY = "hidden";
    }
  };

  // Press Enter to send on desktop
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow textarea
  const handleInput = () => {
    if (!textAreaRef.current) return;
    const el = textAreaRef.current;
    el.style.height = "auto";
    if (el.scrollHeight > maxHeightPx) {
      el.style.height = `${maxHeightPx}px`;
      el.style.overflowY = "auto";
    } else {
      el.style.height = `${el.scrollHeight}px`;
      el.style.overflowY = "hidden";
    }
  };

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
        <div className="sticky top-0 z-20 flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {/* Left group: back arrow => homepage + person info */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push("/")}
              className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {selectedPerson?.image ? (
              <Image
                src={selectedPerson.image}
                alt={selectedPerson.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <Skeleton className="w-8 h-8 rounded-full" />
            )}
            <div className="flex flex-col">
              {selectedPerson ? (
                <>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {selectedPerson.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedPerson.position}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-red-500">
                  Unknown route
                </p>
              )}
            </div>
          </div>
          {/* Right group: three dots -> dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>New Chat</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Chat History</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>My Account</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat area */}
        <motion.div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
        </motion.div>

        {/* Scroll-to-bottom button */}
        {showScrollToBottom && (
          <motion.button
            onClick={scrollToBottom}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-4 bottom-24 p-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 dark:hover:bg-blue-400 z-20 transition-colors"
          >
            <ChevronsDown className="h-5 w-5" />
          </motion.button>
        )}

        {/* Sticky bottom input */}
        <div className="sticky bottom-0 z-10 p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center space-x-2">
          <Textarea
            ref={textAreaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            rows={1}
            placeholder="Type your message..."
            className="resize-none transition-all"
            style={{ height: "auto", overflowY: "hidden" }}
            disabled={!selectedPerson}
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
            disabled={!selectedPerson}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
