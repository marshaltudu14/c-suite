// app/api/chat-history/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server"; // Import NextRequest

export async function GET(req: NextRequest) { // Type req
  try {
    const supabase = await createClient();

    console.log("Supabase client initialized for user fetch");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("Authenticated user ID:", user?.id);

    if (userError || !user) {
      console.log("Authentication failed with error:", userError?.message);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const agent = url.searchParams.get("agent") || null; // Removed .toUpperCase()
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const order = url.searchParams.get("order") || "asc";
    const beforeId = url.searchParams.get("before") || null;

    console.log("Query params:", { agent, limit, page, order, beforeId });

    const offset = (page - 1) * limit;

    let query = supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: order === "asc" });

    if (agent) {
      query = query.eq("agent", agent);
    }

    if (beforeId) {
      const { data: refMessage } = await supabase
        .from("chat_history")
        .select("created_at")
        .eq("id", beforeId)
        .single();

      console.log("Agent Specific Message:", refMessage);

      if (refMessage) {
        query = query.lt("created_at", refMessage.created_at);
      }
    }

    query = query.limit(limit);

    if (page > 1 && !beforeId) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    console.log("Messages:", data);

    if (error) {
      console.error("Error fetching chat history:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in /api/chat-history GET:", error);
    // Type check the error
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch chat history";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) { // Type req
  try {
    const supabase = await createClient();

    console.log("Supabase client initialized for DELETE");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("DELETE request for user:", user?.id);

    if (userError || !user) {
      console.log("DELETE auth failed:", userError?.message);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const agent = url.searchParams.get("agent") || null; // Removed .toUpperCase()

    console.log("DELETE params:", { agent });

    let query = supabase.from("chat_history").delete().eq("user_id", user.id);

    if (agent) {
      query = query.eq("agent", agent);
    }

    const { error } = await query;

    if (error) {
      console.error("Error deleting chat history:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("Chat history deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/chat-history DELETE:", error);
    // Type check the error
    const errorMessage = error instanceof Error ? error.message : "Failed to delete chat history";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
