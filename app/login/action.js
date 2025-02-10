"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// Define server-side login schema for extra safety
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

export async function loginUser({ email, password }) {
  // Validate login data
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      error: true,
      message: parsed.error.issues[0]?.message ?? "Invalid login details.",
    };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }

    if (!data.user) {
      return {
        error: true,
        message: "Login failed. Please try again.",
      };
    }

    // Success
    return {
      success: true,
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  } catch (err) {
    return {
      error: true,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
