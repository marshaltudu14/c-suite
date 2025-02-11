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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Initialize Supabase client (assuming environment variables are set)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * A top bar (header) with a back button, theme switcher,
 * "My Account" dialog, and a "Settings" dialog containing a Logout button.
 */
export default function ChatTopBar() {
  const router = useRouter();

  // States for opening/closing dialogs
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  // Logout handler
  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // You might show a toast notification or alert in real-world usage
    }
  }

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
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Chat
          </h2>
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
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent
          className="sm:max-w-md w-full mx-auto bg-white dark:bg-gray-900
                     rounded-md shadow-lg p-4 sm:p-6
                     max-h-[80vh] overflow-y-auto
                     scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent
                     dark:scrollbar-thumb-gray-600"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Manage Account Info
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Update your personal and company information
              </DialogDescription>
            </DialogHeader>

            {/* Segmented form layout */}
            <div className="flex flex-col space-y-6 mt-4 w-full">
              {/* Section 1: Personal Information */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
                <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                  Personal Information
                </h3>
                <div className="flex flex-col space-y-4">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Your Name
                    </label>
                    <Input
                      placeholder="Enter your full name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      User Role
                    </label>
                    <Input placeholder="Enter your role" className="w-full" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Company Name
                    </label>
                    <Input
                      placeholder="Enter your company name"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Company & Industry */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
                <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                  Company &amp; Industry
                </h3>
                <div className="flex flex-col space-y-4">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Industry Type
                    </label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose industry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it-services">IT Services</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Industry Stage
                    </label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose industry stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start-up">Start-up</SelectItem>
                        <SelectItem value="mid-size">Mid-Size</SelectItem>
                        <SelectItem value="big-size">Big-Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Industry Size
                    </label>
                    <Input placeholder="e.g. 50 employees" className="w-full" />
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Details */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
                <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                  Additional Details
                </h3>
                <div className="flex flex-col space-y-4">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      About Your Company
                    </label>
                    <Textarea
                      placeholder="Briefly describe your company"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Company Mission
                    </label>
                    <Textarea
                      placeholder="Describe your company's mission"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Company Vision
                    </label>
                    <Textarea
                      placeholder="Share the vision statement"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Company Policy
                    </label>
                    <Textarea
                      placeholder="Outline any essential policies"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Extra Details
                    </label>
                    <Textarea
                      placeholder="Add any additional info here"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <Button variant="default" className="w-full">
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog (with Logout) */}
      <Dialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      >
        <DialogContent
          className="sm:max-w-md w-full mx-auto bg-white dark:bg-gray-900
                     rounded-md shadow-lg p-4 sm:p-6
                     max-h-[80vh] overflow-y-auto
                     scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent
                     dark:scrollbar-thumb-gray-600"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                App Settings
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Adjust your preferences or log out
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col space-y-4 mt-4 w-full">
              {/* Here you can add your app-specific settings */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
                <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                  General Preferences
                </h3>
              </div>

              {/* Logout button */}
              <div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
