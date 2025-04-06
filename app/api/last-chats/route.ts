// app/api/last-chats/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server"; // Import NextRequest

// Define interface for the RPC result
interface LastChatResult {
  agent: string | null;
  message: string | null;
  created_at: string | null; // Assuming string representation
}

export async function GET(req: NextRequest) { // Type req
  try {
    const supabase = await createClient();

    // Get the currently authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Last chats API - Auth Error:", userError?.message);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Query to get the latest message for each agent for the user
    // We use a common table expression (CTE) with row_number() to achieve this efficiently
    const { data, error } = await supabase.rpc("get_latest_user_chats", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error fetching last chats:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Type the data from RPC call
    const typedData = data as LastChatResult[] | null;

    // Format the result into an object: { agentSlug: messageContent, ... }
    const lastChats = (typedData || []).reduce((acc: { [key: string]: string | null }, chat: LastChatResult) => { // Type accumulator and chat
      // Ensure agent is not null and is a string before using it as a key
      if (chat.agent && typeof chat.agent === "string") {
        acc[chat.agent] = chat.message;
      }
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: lastChats });
  } catch (error) {
    console.error("Error in /api/last-chats:", error);
    // Type check the error
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch last chats";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/*
Note: The above code assumes a PostgreSQL function `get_latest_user_chats` exists.
If it doesn't, we need to create it via a migration. Here's the SQL for the function:

-- SQL Migration to create the function
CREATE OR REPLACE FUNCTION get_latest_user_chats(p_user_id UUID)
RETURNS TABLE(agent TEXT, message TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  WITH RankedMessages AS (
    SELECT
      ch.agent,
      ch.message,
      ch.created_at,
      ROW_NUMBER() OVER(PARTITION BY ch.agent ORDER BY ch.created_at DESC) as rn
    FROM
      chat_history ch
    WHERE
      ch.user_id = p_user_id
  )
  SELECT
    rm.agent,
    rm.message,
    rm.created_at
  FROM
    RankedMessages rm
  WHERE
    rm.rn = 1;
END;
$$ LANGUAGE plpgsql;

-- End of SQL Migration

If this function doesn't exist, I'll need to use the Supabase MCP tool to execute this SQL.
*/
