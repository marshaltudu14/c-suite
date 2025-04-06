"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginUser } from "./action";

// Shadcn/UI imports
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Icons
import { Loader2 } from "lucide-react";

// Optional Google sign-in component
import GoogleSignin from "./GoogleSignin";

// Enhanced Zod validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

// Infer type from Zod schema
type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null); // Allow string or null
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const urlParams = useSearchParams();
  // If a redirect parameter is provided, use that; otherwise default:
  const redirectTo = urlParams.get("redirect") || "/";

  const form = useForm<LoginFormValues>({ // Add type argument to useForm
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: LoginFormValues) => { // Type the values parameter
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
      });

      if (response.error) {
        setServerError(response.message);
      } else {
        router.push(redirectTo);
      }
    } catch (error) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // For "Forgot Password" link
  const email = form.getValues("email");

  return (
    <main
      className="
        flex
        items-center
        justify-center
        min-h-screen
        px-4
      "
    >
      <div>
        <Card
          className="
            w-full
            max-w-md
            min-w-[350px]
            shadow-lg
            rounded-lg
            border
            border-gray-200
            dark:border-gray-800
            transition-colors
            bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950
          "
        >
          <CardHeader className="text-center">
            <div>
              <CardTitle className="text-2xl font-bold tracking-wide">
                Welcome Back
              </CardTitle>
              <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">
                Please sign in to continue
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col space-y-4"
              >
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="you@example.com"
                          className="
                            focus:ring-2
                            focus:ring-blue-500
                            dark:focus:ring-blue-400
                          "
                        />
                      </FormControl>
                      <FormMessage
                        className="
                          text-sm
                          mt-1
                          text-red-600
                          dark:text-red-400
                        "
                      />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          className="
                            focus:ring-2
                            focus:ring-blue-500
                            dark:focus:ring-blue-400
                          "
                        />
                      </FormControl>
                      <FormMessage
                        className="
                          text-sm
                          mt-1
                          text-red-600
                          dark:text-red-400
                        "
                      />
                    </FormItem>
                  )}
                />

                {/* Server Error */}
                {serverError && (
                  <div className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {serverError}
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="
                      w-full
                    "
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing In...
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>

                {/* Or Google Sign In */}
                <div>
                  <GoogleSignin />
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col items-center space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <Link
                href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
                className="underline hover:text-blue-600 dark:hover:text-blue-400"
              >
                Register
              </Link>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Forgot your password?{" "}
              <Link
                href={`/forgot-password${
                  email ? `?email=${encodeURIComponent(email)}` : ""
                }`}
                className="underline hover:text-blue-600 dark:hover:text-blue-400"
              >
                Reset Here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
