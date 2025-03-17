// app/api/chat-history/route.js
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const agent = url.searchParams.get("agent") || null;

    // Build query
    let query = supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    // Filter by agent if provided
    if (agent) {
      query = query.eq("agent", agent);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching chat history:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in /api/chat-history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const agent = url.searchParams.get("agent") || null;

    // Build query
    let query = supabase.from("chat_history").delete().eq("user_id", user.id);

    // Filter by agent if provided
    if (agent) {
      query = query.eq("agent", agent);
    }

    // Execute query
    const { error } = await query;

    if (error) {
      console.error("Error deleting chat history:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/chat-history DELETE:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete chat history" },
      { status: 500 }
    );
  }
}
