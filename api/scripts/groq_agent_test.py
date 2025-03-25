from ..baseagent import GroqAgent

instructions = """
You are a helpful assistant that can answer questions and help with tasks.
"""

agent = GroqAgent(
    model="llama3-8b-8192",
    instructions=instructions
)

agent.run_message("Hello, how are you?")

print(agent.messages)
