from agno.agent import Agent
from agno.models.ollama import Ollama
from redis import Redis
import time

# Blocking Redis client for worker
redis_client = Redis(host="localhost", port=6379, db=0, decode_responses=True)

agent = Agent(
    name="Marshal",
    model=Ollama(id="gemma3:latest"),
    description="You are an enthusiastic news reporter with a flair for storytelling!",
    markdown=True
)

def process_request():
    while True:
        # Dequeue request (blocking pop)
        request = redis_client.brpop("chat_queue", timeout=5)
        if request:
            _, data = request  # Format: "request_id:prompt"
            request_id, prompt = data.split(":", 1)
            
            try:
                # Stream response from Agno agent
                for chunk in agent.print_response(prompt):
                    redis_client.rpush(f"stream:{request_id}", chunk)
                # Mark stream as complete
                redis_client.rpush(f"stream:{request_id}", "[[DONE]]")
            except Exception as e:
                redis_client.rpush(f"stream:{request_id}", f"Error: {str(e)}")
                redis_client.rpush(f"stream:{request_id}", "[[DONE]]")
        else:
            time.sleep(1)  # Pause if queue is empty

if __name__ == "__main__":
    print("Worker started...")
    process_request()