"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Import our separated dialog components
import MyAccountDialog from "@/app/_chatComponents/MyAccountDialog";
import SettingsDialog from "@/app/_chatComponents/SettingsDialog";
import Image from "next/image";

/**
 * A top bar (header) with a back button, theme switcher,
 * "My Account" dialog, and a "Settings" dialog containing a Logout button.
 */
export default function ChatTopBar({ selectedPerson }) {
  const router = useRouter();

  // Dialog states
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-20 bg-gradient-to-r from-gray-50 to-gray-100 
                 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 
                 dark:border-gray-700 shadow-sm"
    >
      {/* Header content */}
      <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left group: back arrow + title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/")}
            className="p-1 rounded-full text-gray-600 hover:text-gray-800 
                       dark:text-gray-300 dark:hover:text-white transition-colors"
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
              <p className="text-sm font-semibold text-red-500">User</p>
            )}
          </div>
        </div>

        {/* Right group: theme switcher + dropdown */}
        <div className="flex items-center space-x-3">
          <ThemeSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded-full text-gray-600 hover:text-gray-800 
                           dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsAccountDialogOpen(true)}>
                My Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* My Account Dialog */}
      <MyAccountDialog
        open={isAccountDialogOpen}
        onOpenChange={setIsAccountDialogOpen}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      />
    </motion.div>
  );
}
