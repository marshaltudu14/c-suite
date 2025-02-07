"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

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
      // Simple fade-down animation using Framer Motion
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full "
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="text-white font-extrabold tracking-tight text-2xl sm:text-3xl md:text-4xl">
          MySaaS
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          {user ? (
            // If user is logged in, show "Account"
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-white text-sm sm:text-base md:text-lg font-semibold cursor-pointer"
            >
              Account
            </motion.div>
          ) : (
            // If user is not logged in, show "Login" button
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-medium text-sm sm:text-base md:text-lg">
                Login
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
