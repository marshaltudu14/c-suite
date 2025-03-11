"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Define a schema for password validation, ensuring compliance with strong-security best practices.
const passwordMatchSchema = z
  .object({
    password: z
      .string({ required_error: "A password is required." })
      .min(6, "Your password must be at least 6 characters long.")
      .regex(/[0-9]/, "Your password must include at least one digit.")
      .regex(
        /[A-Z]/,
        "Your password must include at least one uppercase letter."
      )
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Your password must include at least one special character."
      ),
    passwordConfirm: z
      .string({ required_error: "Please confirm your password." })
      .min(1, "Please confirm your password."),
  })
  // We use refine to ensure that the two password fields match.
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: "The two passwords do not match. Please try again.",
    path: ["passwordConfirm"],
  });

// Combine email schema with password validation for comprehensive user registration checks.
const newUserSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required." })
      .email("Please enter a valid email address."),
  })
  .and(passwordMatchSchema);

export async function registerUser({ email, password, passwordConfirm }) {
  // 1. Validate input against our newUserSchema.
  const validation = newUserSchema.safeParse({
    email,
    password,
    passwordConfirm,
  });

  // 2. If validation fails, immediately return with an error message.
  if (!validation.success) {
    const message =
      validation.error.issues[0]?.message ||
      "An error occurred while creating your account.";
    return {
      error: true,
      message,
    };
  }

  // 3. Create a Supabase client.
  const supabase = await createClient();

  // 4. Attempt to sign up the user with the provided credentials.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      error: true,
      message: error.message,
    };
  }

  // 6. If the user object is returned with no identities or an empty identities array,
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      error: true,
      message: "Email is already in use. Please use another email.",
    };
  }

  // 7. Successful sign-up.
  return {
    sucess: true,
    message:
      "Your account has been created. Check your email for a confirmation link.",
  };
}
