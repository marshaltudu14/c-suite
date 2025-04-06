// app/login/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LoginForm from "./login-form";
import Header from "../_components/Header";

export async function generateMetadata() {
  return {
    title: "Login",
    description: "Login to your account",
  };
}

// Use 'any' as a workaround for persistent PageProps type error
export default async function LoginPage({ params, searchParams }: any) {
  // Handle potential string array for redirectUrl
  let redirectUrl = "/"; // Default
  const redirectParam = searchParams?.redirect;
  if (Array.isArray(redirectParam)) {
    redirectUrl = redirectParam[0] || "/"; // Take first element or default
  } else if (typeof redirectParam === 'string') {
    redirectUrl = redirectParam;
  }

  // Create Supabase client (returns a typed instance if you've defined Database)
  const supabase = await createClient();

  // Check if the user is already logged in
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error retrieving user:", error.message);
  }

  if (user) {
    // If the user is already logged in, redirect
    redirect(redirectUrl);
  }

  // If not logged in, show the login form
  return (
    <>
      <Header />
      <LoginForm />
    </>
  );
}
