// app/api/account-details/route.js
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Server-side Zod schema ensuring required fields
// Enforce `industry_size` as an integer (int8 in DB).
const accountDetailsSchema = z.object({
  user_name: z.string().min(1, "user_name is required"),
  user_role: z.string().optional(),
  company_name: z.string().min(1, "company_name is required"),
  industry_type: z.string().optional(),
  industry_stage: z.string().optional(),
  // Accept either null or integer
  industry_size: z.number().int().nullable().optional(),
  company_details: z.string().optional(),
  company_mission: z.string().optional(),
  company_vision: z.string().optional(),
  company_policy: z.string().optional(),
  extra_details: z.string().optional(),
});

export async function GET() {
  const supabase = await createClient();

  try {
    // Get the currently authenticated user
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

    // Fetch the existing account details for this user
    const { data, error } = await supabase
      .from("account_details")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // If no row found, data will be null
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  console.log("POST is working.");
  const supabase = await createClient();

  try {
    const body = await request.json();

    // Because the front-end sends industry_size as a string or null,
    // we manually parse it to a number before validating with zod.
    // If empty or null, we treat it as null; else convert to integer.
    const parsedBody = {
      ...body,
      industry_size:
        body.industry_size === null || body.industry_size === ""
          ? null
          : parseInt(body.industry_size, 10),
    };

    // Validate input using Zod
    const formData = accountDetailsSchema.parse(parsedBody);

    // Get the authenticated user
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

    // Upsert into "account_details" table using user_id as the unique key
    const { data, error } = await supabase.from("account_details").upsert(
      [
        {
          user_id: user.id,
          user_name: formData.user_name,
          user_role: formData.user_role,
          company_name: formData.company_name,
          industry_type: formData.industry_type,
          industry_stage: formData.industry_stage,
          industry_size: formData.industry_size, // int8 column
          company_details: formData.company_details,
          company_mission: formData.company_mission,
          company_vision: formData.company_vision,
          company_policy: formData.company_policy,
          extra_details: formData.extra_details,
        },
      ],
      { onConflict: "user_id" } // Make sure user_id has a unique constraint in your DB
    );

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
