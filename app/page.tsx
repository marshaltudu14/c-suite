"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client"; // Restore this import
import Image from "next/image";
import Header from "./_components/Header";

// Import your data and messages
import {
  demoExecutiveMessages,
  demoEmployeeMessages,
  executivesData,
  employeesData,
} from "@/app/_components/OfficeData";
// Remove context/auth hook imports
// import { useAuth } from "./_hooks/useAuth";
// import { useChatPreviews } from "./_context/ChatPreviewsContext";

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

// Add new variants for logo animation
const logoVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Infinite Scroll Logo Component
 */
function InfiniteLogoScroll({ logos }) {
  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % logos.length);
    }, 3000); // Change logo every 3 seconds
    return () => clearInterval(interval);
  }, [logos.length]);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
      <div className="flex items-center justify-center whitespace-nowrap">
        <AnimatePresence mode="wait">
          <motion.span
            key={logoIndex}
            variants={logoVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-slate-400 dark:text-slate-600"
          >
            {logos[logoIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Utility function: returns an excerpt of a text if it exceeds `maxLength`.
 */
function getExcerpt(text = "", maxLength = 100) {
  if (!text) return ""; // Handle null/undefined text
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  // Restore original state management
  const [user, setUser] = useState(null);
  const [executiveChats, setExecutiveChats] = useState({});
  const [employeeChats, setEmployeeChats] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);

  // Restore user session useEffect
  useEffect(() => {
    const getUserSession = async () => {
      try {
        const supabase = await createClient(); // Use the restored import
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

  // Restore placeholder chat fetch useEffect
  useEffect(() => {
    const fetchLastChats = async () => {
      try {
        // This uses placeholder/demo data logic as before
        const newExecutiveChats = {};
        executivesData.forEach((exec) => {
          // Use demo messages directly here for simplicity in revert
          newExecutiveChats[exec.id] = demoExecutiveMessages[exec.id] || "";
        });

        const newEmployeeChats = {};
        employeesData.forEach((emp) => {
          // Use demo messages directly here for simplicity in revert
          newEmployeeChats[emp.id] = demoEmployeeMessages[emp.id] || "";
        });

        setExecutiveChats(newExecutiveChats);
        setEmployeeChats(newEmployeeChats);
      } catch (error) {
        console.error("Error setting demo chats:", error);
      }
    };

    // Set demo chats regardless of user login status for the reverted state
    fetchLastChats();
  }, []); // Run once on mount

  // Filter logic for search bar
  const filteredExecutives = executivesData.filter((exec) => {
    const text = `${exec.name} ${exec.position}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const filteredEmployees = employeesData.filter((emp) => {
    const text = `${emp.name} ${emp.position}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const companyLogos = ["Forbes", "TechCrunch", "Wired", "Fast Company"];

  // Use original loading state logic
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

      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Introductory Section - Fixed Positioning */}
        <motion.section
          className="hidden md:block md:w-1/2 h-screen sticky top-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full h-full flex flex-col justify-center items-center px-8 py-16">
            {/* Abstract background elements */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
              <motion.div
                className="absolute -right-24 top-1/4 w-64 h-64 rounded-full bg-violet-100 dark:bg-violet-900/20 blur-3xl opacity-60"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute -left-16 bottom-1/3 w-48 h-48 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-60"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1,
                }}
              />
            </div>

            {/* Content container */}
            <div className="relative z-10 w-full max-w-xl mx-auto top-20">
              {/* Main headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6 text-center"
              >
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                  Your AI{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                    Workforce
                  </span>{" "}
                  is Ready
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Access strategic intelligence and executive-level decision
                  making powered by advanced AI. Available 24/7 for your
                  business needs.
                </p>
              </motion.div>

              {/* What we offer section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-12"
              >
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
                  What Nayex Offers
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      title: "Strategic Decision Support",
                      description:
                        "Get AI-powered analysis and recommendations for your most critical business decisions.",
                      icon: (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                    {
                      title: "Advanced Language Processing",
                      description:
                        "Powered by self-hosted DeepSeek R1 model for enhanced security and performance.",
                      icon: (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 3V4M12 20V21M21 12H20M4 12H3M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      ),
                    },
                    {
                      title: "Secure Self-hosted Environment",
                      description:
                        "Your data stays within your control with our enterprise-grade security infrastructure.",
                      icon: (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2L20 5V11C20 15.418 16.418 19 12 19C7.582 19 4 15.418 4 11V5L12 2Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 11L11 13L15 9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow duration-200 flex items-start"
                    >
                      <div className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* DeepSeek R1 highlight */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-6 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/30"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M7.5 12.5L10.5 15.5L16.5 9.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-1">
                        Powered by DeepSeek R1
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Experience state-of-the-art reasoning and strategic
                        thinking with our self-hosted DeepSeek R1 model
                        implementation.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* CTA section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="relative flex justify-center"
              >
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                    Select an executive on the right →
                  </div>
                </div>
              </motion.div>

              {/* Social proof / company logos with infinite scroll */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 text-center"
              >
                <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 font-medium">
                  Trusted by innovative teams
                </p>
                <div className="w-full max-w-md mx-auto">
                  <InfiniteLogoScroll logos={companyLogos} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Right-side Content Section */}
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
              {/* Always use demo messages now */}
              {filteredExecutives.length > 0 ? (
                filteredExecutives.map((exec) => {
                  const rawMessage = demoExecutiveMessages[exec.id] || "";
                  const chatMessage = getExcerpt(rawMessage, 100);

                  return (
                    <motion.div key={exec.id} variants={itemVariants}>
                      <Link href={exec.link}>
                        <div className="group flex w-full cursor-pointer items-start space-x-3 rounded-lg px-4 py-3 transition bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700 hover:bg-slate-200 border">
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
                              {chatMessage} {/* Display demo message */}
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
              {/* Always use demo messages now */}
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  const rawMessage = demoEmployeeMessages[emp.id] || "";
                  const chatMessage = getExcerpt(rawMessage, 100);

                  return (
                    <motion.div key={emp.id} variants={itemVariants}>
                      <Link href={emp.link}>
                        <div className="group flex w-full cursor-pointer items-start space-x-3 rounded-lg px-4 py-3 transition bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700 hover:bg-slate-200 border">
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
                              {chatMessage} {/* Display demo message */}
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
