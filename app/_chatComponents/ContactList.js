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

import { getExcerpt } from "@/app/_chatComponents/Components";
import { containerVariants, itemVariants } from "@/app/_utils/FramerAnimations";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

/**
 * The left panel (desktop only) listing all executives/employees.
 */
export default function ContactsList({
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
                  // If user is logged in, show Supabase-sourced data, otherwise show demo
                  const rawMessage = user
                    ? executivesChats[exec.id] || ""
                    : demoExecutiveMessages[exec.id] || "";
                  const chatMessage = getExcerpt(rawMessage, 100);

                  const linkHref = `/office/executive/${exec.id}`;
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

                  const linkHref = `/office/employee/${emp.id}`;
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
