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

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  // Get the redirect URL or default to "/my-account"
  const redirectUrl = params?.redirect || "/";

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
