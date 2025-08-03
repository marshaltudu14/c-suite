"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, Search } from "lucide-react";

import {
  executivesData,
  employeesData,
  demoExecutiveMessages,
  demoEmployeeMessages,
} from "@/app/_components/OfficeData";
import { useChatPreviews } from "@/app/_context/ChatPreviewsContext"; // Import context hook

import { getExcerpt } from "@/app/_chatComponents/Components";
import { containerVariants, itemVariants } from "@/app/_utils/FramerAnimations";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import React, { ChangeEvent, Dispatch, SetStateAction } from "react"; // Import necessary types

// Define basic types/interfaces for props (adjust as needed based on actual data structures)
interface User {
  id: string; // Example user property
  // Add other relevant user properties
}

interface PersonIdentifier {
  id: string | number;
}

interface ContactsListProps {
  currentCategory: string | null | undefined; // Category could be null/undefined
  currentPersonId: string | number | null | undefined; // ID could be null/undefined
}

// Type for objects indexed by string keys (like chatPreviews, demoMessages)
interface StringIndexed {
  [key: string]: string;
}


/**
 * The left panel (desktop only) listing all executives/employees.
 */
export default function ContactsList({
  currentCategory,
  currentPersonId,
}: ContactsListProps) { // Apply props type
  // Apply StringIndexed type to chatPreviews from context
  const { chatPreviews, loadingPreviews }: { chatPreviews: StringIndexed, loadingPreviews: boolean } = useChatPreviews();

  // Filter logic
  const filteredExecutives = executivesData;

  const filteredEmployees = employeesData;

  return (
    <div className="hidden md:flex md:flex-col w-1/3 h-full border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
      

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
              {loadingPreviews ? ( // Show skeletons if logged in and loading previews
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={`exec-skel-${index}`}
                    className="h-16 w-full rounded-lg"
                  />
                ))
              ) : filteredExecutives.length > 0 ? (
                filteredExecutives.map((exec) => {
                  // Use context previews if logged in, otherwise use demo messages
                  // Cast demo messages to StringIndexed to allow string indexing
                                    const rawMessage = (demoExecutiveMessages as StringIndexed)[exec.id] || ""; // Use demo message
                  const chatMessage = getExcerpt(rawMessage, 100);

                  const linkHref = exec.link; // Use link from updated OfficeData
                  const isActive =
                    currentCategory === "executive" &&
                    currentPersonId === exec.id;

                  return (
                    <motion.div key={exec.id} variants={itemVariants}>
                      <Link href={linkHref}>
                        <div
                          className={`group flex w-full cursor-pointer items-start space-x-3 rounded-lg px-4 py-3 transition bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700 hover:bg-slate-200 border ${
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
                              {chatMessage || "No recent messages"}{" "}
                              {/* Handle empty preview */}
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
              {loadingPreviews ? ( // Show skeletons if logged in and loading previews
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={`emp-skel-${index}`}
                    className="h-16 w-full rounded-lg"
                  />
                ))
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  // Use context previews if logged in, otherwise use demo messages
                  // Cast demo messages to StringIndexed to allow string indexing
                  const rawMessage = (demoEmployeeMessages as StringIndexed)[emp.id] || ""; // Use demo message
                  const chatMessage = getExcerpt(rawMessage, 100);

                  const linkHref = emp.link; // Use link from updated OfficeData
                  const isActive =
                    currentCategory === "employee" &&
                    currentPersonId === emp.id;

                  return (
                    <motion.div key={emp.id} variants={itemVariants}>
                      <Link href={linkHref}>
                        <div
                          className={`group flex w-full cursor-pointer items-start space-x-3 rounded-lg px-4 py-3 bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700 hover:bg-slate-200 border ${
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
                              {chatMessage || "No recent messages"}{" "}
                              {/* Handle empty preview */}
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
        
    </div>
  );
}
