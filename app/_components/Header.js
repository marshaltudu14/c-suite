"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function Header() {
  const [user, setUser] = useState(null);

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

    fetchUser();
  }, []);

  return (
    <motion.header
      // Fade-down animation
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        w-full
        border-b
        bg-gradient-to-b
        from-white via-gray-100 to-white
        dark:from-slate-900 dark:via-slate-950 dark:to-slate-900
      "
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <Link href="/">
          <div className="font-bold tracking-tight">C-Suite</div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {user ? (
            // If user is logged in, show "Account"
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="font-semibold cursor-pointer"
            >
              Account
            </motion.div>
          ) : (
            // If user is not logged in, show "Login" button
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button className="font-medium">Login</Button>
              </motion.div>
            </Link>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </motion.header>
  );
}
