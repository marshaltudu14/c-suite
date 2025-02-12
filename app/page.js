"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Header from "./_components/Header";

// Import your data and messages
import {
  demoExecutiveMessages,
  demoEmployeeMessages,
  executivesData,
  employeesData,
} from "@/app/_components/OfficeData";

/**
 * Framer Motion variants.
 */
const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", duration: 0.8 },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", duration: 0.8 },
  },
};

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

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [executiveChats, setExecutiveChats] = useState({});
  const [employeeChats, setEmployeeChats] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);

  // Retrieve user session
  useEffect(() => {
    const getUserSession = async () => {
      try {
        const supabase = await createClient();
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData?.user) {
          console.error("Error fetching user:", userError);
        } else {
          setUser(userData.user);
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
        // Replace with your real queries to Supabase.
        // This is just placeholder text for demonstration.
        const newExecutiveChats = {};
        executivesData.forEach((exec) => {
          newExecutiveChats[exec.id] =
            "Last chat from Supabase (placeholder): This AI exec has been working on strategic alignment. Here's a detailed note about next steps in your virtual office.";
        });

        const newEmployeeChats = {};
        employeesData.forEach((emp) => {
          newEmployeeChats[emp.id] =
            "Last chat from Supabase (placeholder): AI employee tasks updated. There's an interesting approach we can take to streamline collaboration further.";
        });

        setExecutiveChats(newExecutiveChats);
        setEmployeeChats(newEmployeeChats);
      } catch (error) {
        console.error("Error fetching last chats:", error);
      }
    };

    // Only fetch if the user is logged in
    if (user) {
      fetchLastChats();
    }
  }, [user]);

  // Filter logic for search bar
  const filteredExecutives = executivesData.filter((exec) => {
    const text = `${exec.name} ${exec.position}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const filteredEmployees = employeesData.filter((emp) => {
    const text = `${emp.name} ${emp.position}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/*
        Main container that splits into two sections on desktop:
        - The left intro section: sticky, no BG color, hidden on mobile
        - The right content section remains unchanged
      */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left (Intro) Section, shown only on desktop, sticky, no BG color */}
        <motion.section
          className="hidden md:flex md:w-1/2 sticky top-0 h-screen flex-col p-6 items-center justify-center"
          variants={fadeInLeft}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="max-w-sm flex flex-col items-center text-center"
            variants={itemVariants}
          >
            {/* 
              Gradient text for a more appealing typography.
              This does not set a background color on the section itself.
            */}
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent mb-4">
              Virtual Office
            </h1>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Welcome to your AI-driven workspace. Collaborate with executives,
              employees, and advanced AI solutions, all in one place.
            </p>
            {/* Subtle divider or accent line */}
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full mb-4"></div>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Experience seamless communication <br />
              and next-level productivity.
            </p>
          </motion.div>
        </motion.section>

        {/* Right-side Content Section (Unchanged) */}
        <motion.section
          className="md:w-1/2 p-4 md:p-8 flex flex-col space-y-4"
          variants={fadeInRight}
          initial="hidden"
          animate="show"
        >
          {/* Search Input */}
          <div className="relative">
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

          {/* Executives Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <h2 className="my-2 text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
              Executives
            </h2>
            <div className="flex flex-col space-y-2">
              {filteredExecutives.length > 0 ? (
                filteredExecutives.map((exec) => {
                  const rawMessage = user
                    ? executiveChats[exec.id] || ""
                    : demoExecutiveMessages[exec.id] || "";
                  const chatMessage = getExcerpt(rawMessage, 100);

                  return (
                    <motion.div key={exec.id} variants={itemVariants}>
                      <Link href={exec.link}>
                        <div className="group flex w-full cursor-pointer items-start space-x-3 rounded-2xl bg-white px-4 py-3 shadow hover:shadow-lg transition dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-50">
                          {!exec.image ? (
                            <Skeleton className="h-12 w-12 rounded-full" />
                          ) : (
                            <Image
                              src={exec.image}
                              alt={exec.name}
                              className="h-12 w-12 rounded-full object-cover"
                              width={500}
                              height={500}
                            />
                          )}
                          <div className="flex flex-col text-gray-700 dark:text-gray-200">
                            <p className="font-semibold text-base md:text-md">
                              {exec.name}{" "}
                              <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({exec.position})
                              </span>
                            </p>
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

          {/* Employees Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <h2 className="my-2 text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
              Employees
            </h2>
            <div className="flex flex-col space-y-2">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  const rawMessage = user
                    ? employeeChats[emp.id] || ""
                    : demoEmployeeMessages[emp.id] || "";
                  const chatMessage = getExcerpt(rawMessage, 100);

                  return (
                    <motion.div key={emp.id} variants={itemVariants}>
                      <Link href={emp.link}>
                        <div className="group flex w-full cursor-pointer items-start space-x-3 rounded-2xl bg-white px-4 py-3 shadow hover:shadow-lg transition dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-50">
                          {!emp.image ? (
                            <Skeleton className="h-12 w-12 rounded-full" />
                          ) : (
                            <Image
                              src={emp.image}
                              alt={emp.name}
                              className="h-12 w-12 rounded-full object-cover"
                              width={500}
                              height={500}
                            />
                          )}
                          <div className="flex flex-col text-gray-700 dark:text-gray-200">
                            <p className="font-semibold text-base md:text-md">
                              {emp.name}
                              <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({emp.position})
                              </span>
                            </p>
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
        </motion.section>
      </div>
    </div>
  );
}
