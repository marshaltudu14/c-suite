from fastapi import FastAPI
from sse_starlette.sse import EventSourceResponse
from redis.asyncio import Redis
import asyncio
import uuid

app = FastAPI()
redis_client = Redis(host="localhost", port=6379, db=0, decode_responses=True)

@app.get("/api/chat/stream")
async def stream_chat(prompt: str, user_id: str = None):
    request_id = user_id or str(uuid.uuid4())
    await redis_client.lpush("chat_queue", f"{request_id}:{prompt}")
    
    async def event_generator():
        try:
            while True:
                chunk = await redis_client.lpop(f"stream:{request_id}")
                if chunk == "[[DONE]]":
                    yield {"event": "done", "data": ""}
                    break
                elif chunk:
                    yield {"event": "message", "data": chunk}
                else:
                    await asyncio.sleep(0.05)  # Reduced polling interval
        except Exception as e:
            yield {"event": "error", "data": str(e)}
        finally:
            await redis_client.delete(f"stream:{request_id}")

    return EventSourceResponse(event_generator(), headers={"X-Request-ID": request_id})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)