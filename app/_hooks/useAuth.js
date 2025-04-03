"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingUser(true);
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
          // Only redirect if not on the homepage
          if (pathname !== "/") {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        if (!data?.user) {
          // If user is null, force a login
          // Only redirect if not on the homepage
          if (pathname !== "/") {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error("Error checking user:", err);
        // Only redirect if not on the homepage
        if (pathname !== "/") {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [router, pathname]);

  return { user, loadingUser };
}
