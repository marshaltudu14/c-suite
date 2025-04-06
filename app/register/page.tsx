import { createClient } from "@/utils/supabase/server";
import SignupForm from "./signup-form";
import { redirect as nextRedirect } from "next/navigation";
import Header from "../_components/Header";

export const metadata = {
  title: "Create an Account",
  description: "Register a new Account.",
};

// Define type for Page props
interface SignupPageProps {
  params: { [key: string]: string | string[] | undefined };
}

// Use 'any' as a workaround for persistent PageProps type error
export default async function SignupPage({ params, searchParams }: any) {
  // Correctly get redirectUrl from searchParams
  let redirectUrl = "/"; // Default
  const redirectParam = searchParams?.redirect;
  if (Array.isArray(redirectParam)) {
    redirectUrl = redirectParam[0] || "/"; // Take first element or default
  } else if (typeof redirectParam === 'string') {
    redirectUrl = redirectParam;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.log("Error fetching user:", error.message);
  }
  if (user) {
    nextRedirect(redirectUrl);
  }
  return (
    <>
      <Header />
      <SignupForm />
    </>
  );
}
