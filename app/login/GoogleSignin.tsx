"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function GoogleSignin() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const searchParams = useSearchParams();

  const next = searchParams.get("next");

  const { toast } = useToast();

  async function signInWithGoogle() {
    setIsGoogleLoading(true);
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${window.location.origin}/auth/callback${
            next ? `?next=${encodeURIComponent(next)}` : ""
          }`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast({
        title: "Please try again.",
        description: "There was an error logging in with Google.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={signInWithGoogle}
        disabled={isGoogleLoading}
        className="w-full"
      >
        <div className="flex gap-2 items-center justify-center">
          {isGoogleLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Image
              src="/Google Logo.svg"
              alt="Google logo"
              width={20}
              height={20}
              className="mr-2"
            />
          )}{" "}
          Sign in with Google
        </div>
      </Button>
    </div>
  );
}
