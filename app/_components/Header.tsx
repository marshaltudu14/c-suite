"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ChevronDown, User as UserIcon, LogOut, Settings, HelpCircle } from "lucide-react"; // Renamed User icon import
import { User } from "@supabase/supabase-js"; // Import Supabase User type

export default function Header() {
  const [user, setUser] = useState<User | null>(null); // Explicitly type useState
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = await createClient();
        const {
          data: { user: userData },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
        } else {
          setUser(userData);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    fetchUser();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Documentation", href: "/docs" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        sticky top-0 z-50 w-full backdrop-blur-md
        ${
          scrolled
            ? "shadow-md bg-white/80 dark:bg-slate-900/80"
            : "bg-transparent"
        }
        transition-all duration-300 ease-in-out
      `}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">N</span>
              </motion.div>
              <motion.span
                className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                NAYEX
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex ml-10">
              <ul className="flex space-x-8">
                {navItems.map((item) => (
                  <motion.li key={item.name} whileHover={{ y: -2 }}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right Side - Auth and Theme */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 cursor-pointer bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-full"
                  >
                    <Avatar className="h-8 w-8 border-2 border-blue-100 dark:border-slate-700">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.email}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline">
                      {user.email?.split("@")[0] || "Account"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" /> {/* Use renamed icon */}
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="hidden sm:block"
                  >
                    <Link href="/register">
                      <Button variant="outline" className="font-medium">
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                </AnimatePresence>
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg">
                      Login
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
            <div className="border-l pl-4 border-gray-200 dark:border-gray-700">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
