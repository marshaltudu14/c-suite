from fastapi import FastAPI
from sse_starlette.sse import EventSourceResponse
from redis.asyncio import Redis
import asyncio
import uuid

app = FastAPI()
redis_client = Redis(host="localhost", port=6379, db=0, decode_responses=True)

@app.get("/api/chat/stream")
async def stream_chat(prompt: str, user_id: str = None):
    # Generate a unique request ID
    request_id = user_id or str(uuid.uuid4())
    
    # Enqueue the prompt
    await redis_client.lpush("chat_queue", f"{request_id}:{prompt}")
    
    async def event_generator():
        try:
            # Stream chunks from Redis
            while True:
                chunk = await redis_client.lpop(f"stream:{request_id}")
                if chunk == "[[DONE]]":  # Sentinel value to end stream
                    yield {"event": "done", "data": ""}
                    break
                elif chunk:
                    yield {"event": "message", "data": chunk}
                else:
                    # Wait briefly if no data yet
                    await asyncio.sleep(0.1)
        except Exception as e:
            yield {"event": "error", "data": str(e)}
        finally:
            # Cleanup
            await redis_client.delete(f"stream:{request_id}")

    return EventSourceResponse(event_generator(), headers={"X-Request-ID": request_id})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)