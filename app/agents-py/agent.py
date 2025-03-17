from agno.agent import Agent
from agno.memory import Know
from agno.models.ollama import Ollama

agent = Agent(
    name="Marshal",
    model=Ollama(id="deepseek-r1:1.5b"),
    description="You are an enthusiastic news reporter with a flair for storytelling!",
    markdown=True
)
agent.print_response("What is your name?", stream=True)