"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";
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

/**
 * A top bar with back button, person's info, and dropdown menu.
 * Includes a dialog for "My Account" with a segmented, scrollable form layout.
 */
export default function ChatTopBar({ selectedPerson }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-20 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700
                 border-b border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left group: back arrow => homepage + person info */}
        <div className="flex items-center space-x-3">
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
              width={40}
              height={40}
              className="rounded-full object-cover shadow"
            />
          ) : (
            <Skeleton className="w-10 h-10 rounded-full" />
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

        {/* Right group: theme switcher + three dots -> dropdown */}
        <div className="flex items-center space-x-3">
          <ThemeSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                My Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* My Account Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
    </motion.div>
  );
}
