"use client";

import React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"; // Adjust the import path to match your project

export default function ChatPage() {
  // Hard-code the name "CEO"
  const role = "CEO";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-10 py-3 bg-white dark:bg-gray-800 shadow">
        {/* Left side: Hard-coded name */}
        <div className="text-gray-800 dark:text-gray-200 font-semibold text-sm sm:text-base md:text-lg">
          {role}
        </div>

        {/* Right side: Hamburger (Sheet Trigger) */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="text-gray-800 dark:text-gray-200 hover:text-gray-500">
              {/* Hamburger Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5"
                />
              </svg>
            </button>
          </SheetTrigger>

          {/* Slide-in from left */}
          <SheetContent side="left" className="bg-white dark:bg-gray-800">
            <SheetHeader>
              <SheetTitle className="text-gray-800 dark:text-gray-200">
                Sidebar
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 text-gray-700 dark:text-gray-300">
              <p className="mb-2">Add your sidebar content here.</p>
              <p>For example, additional chat settings or options.</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 font-bold mb-4">
          Chat Conversation
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          This is where your conversation with <strong>{role}</strong> appears.
        </p>
      </div>
    </div>
  );
}
