import http from "http";
import { NextRequest, NextResponse } from "next/server"; // Import NextRequest
import { Readable } from "stream"; // Import Readable for typing backendRes

// Explicitly type the return value as Promise<Response>
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url); // No need for base URL with NextRequest
  const prompt = searchParams.get("prompt") || ""; // Add fallback for null
  const user_id = searchParams.get("user_id") || ""; // Add fallback for null

  // Explicitly type the Promise resolve function
  return new Promise((resolve: (value: Response | PromiseLike<Response>) => void) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 8000,
        path: `/api/chat/stream?prompt=${encodeURIComponent(
          prompt
        )}&user_id=${encodeURIComponent(user_id)}`,
        method: "GET",
      },
      (backendRes: http.IncomingMessage) => { // Type backendRes
        const headers = {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        };

        // Cast backendRes to ReadableStream<any> or handle appropriately
        // For simplicity, casting to 'any' first, but a proper stream conversion might be needed
        resolve(
          new Response(backendRes as any, { // Cast backendRes
            status: backendRes.statusCode || 500, // Add fallback for status code
            headers,
          })
        );
      }
    );

    req.on("error", (err) => {
      console.error("Proxy error:", err);
      resolve(new Response("Internal Server Error", { status: 500 }));
    });

    req.end();
  });
}
