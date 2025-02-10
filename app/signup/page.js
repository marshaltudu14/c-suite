import { createClient } from "@/utils/supabase/server";
import SignupForm from "./signup-form";
import { redirect as nextRedirect } from "next/navigation";

export const metadata = {
  title: "Create an Account",
  description: "Register a new Account.",
};

export default async function SignupPage({ params }) {
  const redirectUrl = params.redirectUrl || "/";
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.log("error fetch user:", error.message);
  }
  if (user) {
    nextRedirect(redirectUrl);
  }
  return <SignupForm />;
}
