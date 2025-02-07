"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input"; // Update this path to match your project
import { Skeleton } from "@/components/ui/skeleton"; // Update this path to match your project
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

// Example Data: All images are empty to demonstrate Skeleton usage
const executivesData = [
  {
    id: "ceo",
    name: "John Doe",
    position: "CEO",
    image: "",
    link: "/office/executive/ceo",
  },
  {
    id: "cfo",
    name: "Jane Smith",
    position: "CFO",
    image: "",
    link: "/office/executive/cfo",
  },
  {
    id: "cmo",
    name: "Robert Johnson",
    position: "CMO",
    image: "",
    link: "/office/executive/cmo",
  },
  {
    id: "coo",
    name: "Emily Davis",
    position: "COO",
    image: "",
    link: "/office/executive/coo",
  },
  {
    id: "cto",
    name: "Michael Brown",
    position: "CTO",
    image: "",
    link: "/office/executive/cto",
  },
];

const employeesData = [
  {
    id: "bda",
    name: "Alice Green",
    position: "Business Development Associate",
    image: "",
    link: "/office/employee/bda",
  },
  {
    id: "cw",
    name: "Bob Martin",
    position: "Content Writer",
    image: "",
    link: "/office/employee/cw",
  },
  {
    id: "cs",
    name: "Chris Kim",
    position: "Customer-Support",
    image: "",
    link: "/office/employee/customer-support",
  },
  {
    id: "da",
    name: "Diana Lee",
    position: "Data-Analyst",
    image: "",
    link: "/office/employee/data-analyst",
  },
  {
    id: "hre",
    name: "Eva Wilson",
    position: "Hr-executive",
    image: "",
    link: "/office/employee/hr-executive",
  },
  {
    id: "la",
    name: "Gary Scott",
    position: "Legal Advisor",
    image: "",
    link: "/office/employee/legal-advisor",
  },
  {
    id: "me",
    name: "Helen Clark",
    position: "Marketing Executive",
    image: "",
    link: "/office/employee/marketing-executive",
  },
  {
    id: "se",
    name: "Ian Turner",
    position: "Sales Executive",
    image: "",
    link: "/office/employee/sales-executive",
  },
  {
    id: "swe",
    name: "Jack Li",
    position: "Software Engineer",
    image: "",
    link: "/office/employee/software-engineer",
  },
  {
    id: "uxd",
    name: "Karen Walker",
    position: "UI/UX Designer",
    image: "",
    link: "/office/employee/ui-ux-designer",
  },
  {
    id: "smm",
    name: "Luke Anderson",
    position: "Social Media Manager",
    image: "",
    link: "/office/employee/social-media-manager",
  },
  {
    id: "sc",
    name: "Mia Perez",
    position: "Supply Chain",
    image: "",
    link: "/office/employee/supply-chain",
  },
];

// Framer Motion variants for neat staggered appearance
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

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExecutives = executivesData.filter((exec) => {
    const text = `${exec.name} ${exec.position}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const filteredEmployees = employeesData.filter((emp) => {
    const text = `${emp.name} ${emp.position}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Container for overall "chat-like" layout */}
      <div className="w-full max-w-2xl flex flex-col space-y-4">
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
              filteredExecutives.map((exec) => (
                <motion.div key={exec.id} variants={itemVariants}>
                  <Link href={exec.link}>
                    <div className="group flex w-full cursor-pointer items-start space-x-3 rounded-2xl bg-white px-4 py-3 shadow hover:bg-gray-50 transition dark:bg-gray-800 dark:hover:bg-gray-700">
                      {/* Skeleton in place of images */}
                      {!exec.image ? (
                        <Skeleton className="h-12 w-12 rounded-full" />
                      ) : (
                        <img
                          src={exec.image}
                          alt={exec.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col text-gray-700 dark:text-gray-200">
                        <p className="font-semibold text-base md:text-md">
                          {exec.name}{" "}
                          <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                            ({exec.position})
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
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
              filteredEmployees.map((emp) => (
                <motion.div key={emp.id} variants={itemVariants}>
                  <Link href={emp.link}>
                    <div className="group flex w-full cursor-pointer items-start space-x-3 rounded-2xl bg-white px-4 py-3 shadow hover:bg-gray-50 transition dark:bg-gray-800 dark:hover:bg-gray-700">
                      {!emp.image ? (
                        <Skeleton className="h-12 w-12 rounded-full" />
                      ) : (
                        <img
                          src={emp.image}
                          alt={emp.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col text-gray-700 dark:text-gray-200">
                        <p className="font-semibold text-base md:text-md">
                          {emp.name}
                          <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                            ({emp.position})
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No employees found.
              </p>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
