"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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

/**
 * Top bar with back button, person's info, and dropdown menu.
 */
export default function ChatTopBar({ selectedPerson }) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left group: back arrow => homepage + person info */}
      <div className="flex items-center space-x-2">
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
            <p className="text-sm font-semibold text-red-500">Unknown route</p>
          )}
        </div>
      </div>

      {/* Right group: three dots -> dropdown */}
      <div className="flex items-center justify-center">
        <ThemeSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>New Chat</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Chat History</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>My Account</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
