"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

/**
 * Personalized demo messages for AI Virtual Executives (if user is NOT logged in).
 * Keeping them slightly longer to demonstrate the excerpt functionality.
 */
const demoExecutiveMessages = {
  ceo: "I've analyzed the market trends and prepared a strategic growth plan for next quarter. Let me know your thoughts on the updated proposal!",
  cfo: "The latest financial forecasts indicate a solid revenue increase, but we must allocate more resources to R&D. Thoughts?",
  cmo: "The recent ad campaign is performing above expectations, but we need to engage more on social channels to further boost conversion.",
  coo: "Logistics and operations look smooth, but I'd love your input on automating a few workflow processes next month.",
  cto: "We're testing the new platform update tonight to improve performance significantly. Any final checks before deployment?",
};

/**
 * Personalized demo messages for AI Virtual Employees (if user is NOT logged in).
 */
const demoEmployeeMessages = {
  bda: "A potential B2B lead reached out with interest. I've drafted a proposal and would like your review.",
  cw: "The editorial calendar is ready, and I have a fresh batch of blog topics that'll grab audience attention!",
  cs: "A user encountered a billing issue, but we've resolved it. Let me know if there's anything else you'd like me to improve!",
  da: "I've cleaned the sales dataset and visualized the new insights. A summary is waiting in the dashboard!",
  hre: "I've scheduled two candidate interviews and drafted an internal survey about remote working preferences.",
  la: "There's a new regulation that affects our standard client contract. I've prepared an updated draft for your review.",
  me: "Our new campaign is performing well, but we can boost ROI by tweaking audience targeting slightly.",
  se: "I've updated the pipeline; there's a hot lead we should reach out to by tomorrow to secure a potential deal.",
  swe: "The new feature is almost complete, but I found a bug in the checkout flow. Investigating now!",
  uxd: "I've revised the latest wireframes with a new color palette and streamlined navigation. Ready for feedback!",
  smm: "Engagement is high on Instagram, but we could try short-form videos on TikTok to reach a younger audience.",
  sc: "Our inventory is running low, and the next shipment arrives next week. Just a heads-up on scheduling.",
};

/**
 * Example Data: all images are empty to demonstrate Skeleton usage.
 * In a real scenario, you can replace with actual URLs or user-uploaded images.
 */
const executivesData = [
  {
    id: "ceo",
    name: "Satya",
    position: "CEO",
    image: "",
    link: "/office/executive/ceo",
  },
  {
    id: "cfo",
    name: "Deepak",
    position: "CFO",
    image: "",
    link: "/office/executive/cfo",
  },
  {
    id: "cmo",
    name: "Zunaid",
    position: "CMO",
    image: "",
    link: "/office/executive/cmo",
  },
  {
    id: "coo",
    name: "Gaurav",
    position: "COO",
    image: "",
    link: "/office/executive/coo",
  },
  {
    id: "cto",
    name: "Marshal",
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
        const supabase = createClient();
        // Replace with your real queries. For now, placeholders:
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
        <p className="text-gray-600 dark:text-gray-300">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Container for overall layout */}
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
              filteredExecutives.map((exec) => {
                // If user is logged in, show real chat from supabase (placeholder).
                // Otherwise, show the personalized demo message.
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
                          {/* Excerpt of the last message */}
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
                // If user is logged in, show real chat from supabase (placeholder).
                // Otherwise, show the personalized demo message.
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
                          {/* Excerpt of the last message */}
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
      </div>
    </div>
  );
}
