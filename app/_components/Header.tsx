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

import Link from "next/link";
import { ChevronDown, User as UserIcon, LogOut, Settings, HelpCircle } from "lucide-react"; // Renamed User icon import


export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

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
                <span className="text-white font-bold text-lg">C</span>
              </motion.div>
              <motion.span
                className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Suite
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
            <div className="border-l pl-4 border-gray-200 dark:border-gray-700">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
