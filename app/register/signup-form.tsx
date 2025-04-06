"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

// Shadcn/ui components
import { Button } from "@/components/ui/button";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Supabase registration action
import { registerUser } from "./action";

// Zod validation schema
const passwordMatchSchema = z
  .object({
    password: z
      .string({ required_error: "A password is required." })
      .min(6, "Your password must be at least 6 characters long.")
      .regex(/[0-9]/, "Your password must contain at least one number.")
      .regex(
        /[A-Z]/,
        "Your password must contain at least one uppercase letter."
      )
      .regex(
        /[!@#$%^&*()<>?":{}|<>]/,
        "Your password must contain at least one special character."
      ),
    passwordConfirm: z
      .string({ required_error: "Please confirm your password." })
      .min(1, "Please confirm your password."),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: "The two passwords do not match. Please try again.",
    path: ["passwordConfirm"],
  });

const formSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required." })
      .email("Please enter a valid email address."),
  })
  .and(passwordMatchSchema);

// Infer type from Zod schema
type SignupFormValues = z.infer<typeof formSchema>;

export default function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null); // Type state
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const urlParams = useSearchParams();
  const redirectTo = urlParams.get("redirect") || "/";

  const form = useForm<SignupFormValues>({ // Add type argument to useForm
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const handleSubmit = async (data: SignupFormValues) => { // Type data parameter
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await registerUser({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });

      if (response.error) {
        setServerError(response.message);
      } else {
        router.push("/register/confirmation");
      }
    } catch (error) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Optional background gradient or decorative elements */}
      <div className="absolute inset-0 pointer-events-none -z-10" />

      <Card className="w-full max-w-md shadow-xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">
            Create an Account
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            Sign up to build your own AI Virtual Workforce
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., johndoe@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Server error */}
              {serverError && (
                <p className="text-red-500 text-sm mt-1">{serverError}</p>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-semibold"
              >
                {isLoading ? (
                  <div className="flex gap-2 items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${redirectTo}`}
              className="underline hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
