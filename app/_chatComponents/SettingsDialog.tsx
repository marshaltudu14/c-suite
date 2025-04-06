"use client";

import { motion } from "framer-motion";
import { logout } from "@/app/_chatComponents/action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js"; // Import User type

// Define props interface
interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [user, setUser] = useState<User | null>(null); // Add User type

  //Fetch user
  useEffect(() => {
    async function getUser() {
      const supabase = await createClient();
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        console.log("Error fetching user:", userError);
      }

      setUser(userData.user); // userData.user is already of type User | null
    }
    getUser();
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            {/* You could add more settings or preferences here */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
              <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                General Preferences
              </h3>
              {/* Add your additional settings fields/components if needed */}
            </div>

            {/* Logout button */}
            {user && (
              <div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
