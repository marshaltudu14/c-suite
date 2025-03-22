import http from "http";

export async function GET(request) {
  const { searchParams } = new URL(request.url, "http://localhost");
  const prompt = searchParams.get("prompt");
  const user_id = searchParams.get("user_id");

  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 8000,
        path: `/api/chat/stream?prompt=${encodeURIComponent(
          prompt
        )}&user_id=${encodeURIComponent(user_id)}`,
        method: "GET",
      },
      (backendRes) => {
        const headers = {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        };

        resolve(
          new Response(backendRes, {
            status: backendRes.statusCode,
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
