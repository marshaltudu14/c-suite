import LoginForm from "@/app/login/login-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: "Login",
    description: "Login to your account",
  };
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const redirectUrl = params?.redirect || "/";

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error retreiving user:", error.message);
  }

  if (user) {
    return redirect(redirectUrl);
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
