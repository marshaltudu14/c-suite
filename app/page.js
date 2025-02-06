import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: userData, error } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }
  return <div>DashboardPage</div>;
}
