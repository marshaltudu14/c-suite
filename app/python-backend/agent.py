from agno.agent import Agent
from agno.models.ollama import Ollama
from redis import Redis
import time
import io
import sys

# Blocking Redis client for worker
redis_client = Redis(host="localhost", port=6379, db=0, decode_responses=True)

agent = Agent(
    name="Marshal",
    model=Ollama(id="gemma3:latest"),
    description="You are an enthusiastic news reporter with a flair for storytelling!",
    markdown=True
)

class StreamCapture(io.StringIO):
    def __init__(self, request_id):
        super().__init__()
        self.request_id = request_id

    def write(self, text):
        if text.strip():
            redis_client.rpush(f"stream:{self.request_id}", text.strip())

def process_request():
    while True:
        request = redis_client.brpop("chat_queue", timeout=5)
        if request:
            _, data = request
            request_id, prompt = data.split(":", 1)
            try:
                # Redirect stdout to capture print_response output
                output_buffer = StreamCapture(request_id)
                sys.stdout = output_buffer
                agent.print_response(prompt)  # Streams tokens to stdout
                sys.stdout = sys.__stdout__  # Restore stdout
                redis_client.rpush(f"stream:{request_id}", "[[DONE]]")
            except Exception as e:
                redis_client.rpush(f"stream:{request_id}", f"Error: {str(e)}")
                redis_client.rpush(f"stream:{request_id}", "[[DONE]]")
        else:
            time.sleep(1)

if __name__ == "__main__":
    print("Worker started...")
    process_request()