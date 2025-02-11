import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Zod schema ensuring `user_name` and `company_name` are required
const accountDetailsSchema = z.object({
  user_name: z.string().min(1, "user_name is required"),
  user_role: z.string().optional(),
  company_name: z.string().min(1, "company_name is required"),
  industry_type: z.string().optional(),
  industry_stage: z.string().optional(),
  industry_size: z.string().optional(),
  company_details: z.string().optional(),
  company_mission: z.string().optional(),
  company_vision: z.string().optional(),
  company_policy: z.string().optional(),
  extra_details: z.string().optional(),
});

export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No authenticated user found." },
        { status: 401 }
      );
    }

    // Query account_details for this user
    const { data, error } = await supabase
      .from("account_details")
      .select("*")
      .eq("user_id", user.id)
      .single(); // single() returns the first record or null

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // If no row found, data will be null
    if (!data) {
      return NextResponse.json({ success: true, data: null }, { status: 200 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // Validate input using Zod
    const formData = accountDetailsSchema.parse(body);

    // Attempt to get the currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No authenticated user found." },
        { status: 401 }
      );
    }

    // Insert or upsert into "account_details" table
    const { error, data } = await supabase.from("account_details").upsert({
      user_id: user.id,
      user_name: formData.user_name,
      user_role: formData.user_role,
      company_name: formData.company_name,
      industry_type: formData.industry_type,
      industry_stage: formData.industry_stage,
      industry_size: formData.industry_size,
      company_details: formData.company_details,
      company_mission: formData.company_mission,
      company_vision: formData.company_vision,
      company_policy: formData.company_policy,
      extra_details: formData.extra_details,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Invalid request data" },
      { status: 400 }
    );
  }
}
