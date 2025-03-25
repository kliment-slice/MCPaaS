from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import Optional
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import potentially conflicting libraries with appropriate error handling
try:
    from groq import Groq
except ImportError as e:
    raise ImportError(f"Failed to import Groq: {e}. Try installing a newer version of fastapi that's compatible with anyio>=4.5")

try:
    from toolhouse import Toolhouse
    th = Toolhouse(api_key=os.getenv("TOOLHOUSE_API_KEY"))
except ImportError as e:
    raise ImportError(f"Failed to import Toolhouse: {e}")

class ScrapeRequest(BaseModel):
    url: str

class EmptyRequest(BaseModel):
    pass

@app.post("/api/groq/query")
async def groq_query(request: Request):
    """Execute a Groq query using the llama-3.3-70b-versatile model"""
    try:
        data = await request.json()
        if 'prompt' not in data:
            return {"error": "Missing required 'prompt' in request body"}, 400
        
        response = await run_groq_query(
            prompt=data['prompt'],
            model="llama-3.3-70b-versatile"
        )
        return {"result": response}
        
    except Exception as e:
        return {"error": str(e)}, 500

async def run_groq_query(prompt: str, model: str = "llama-3.3-70b-versatile") -> str:
    """Execute a Groq query using the specified model"""
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[{
                "role": "user",
                "content": prompt
            }],
            temperature=0.5,
            max_tokens=1024
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise RuntimeError(f"Groq API error: {str(e)}")


@app.get("/api/mcphack/summarizescrape")
async def mcphack_summarize_scrape():
    """Scrape the GitHub commits page and return a tweet summary with author tags"""
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        url = "https://github.com/kliment-slice/MCPaaS/commits"
        
        # Get mcphack tools to find firecrawl_scrape
        mcphacks_tools = th.get_tools("mcphack")
        
        # Find the firecrawl_scrape tool
        firecrawl_tool = None
        for tool in mcphacks_tools:
            if tool.get('function', {}).get('name') == 'firecrawl_scrape':
                firecrawl_tool = tool
                break
                
        if not firecrawl_tool:
            return {"error": "The firecrawl_scrape tool is not available"}
        
        # Scrape the commits page
        scrape_prompt = f"Use firecrawl_scrape to scrape the GitHub commits page: {url}"
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": scrape_prompt}],
            tools=[firecrawl_tool],
            tool_choice={"type": "function", "function": {"name": "firecrawl_scrape"}}
        )
        
        # Execute tool calls
        tool_results = th.run_tools(response)
        
        # Extract scraped content
        scraped_content = ""
        for result in tool_results:
            if result.get("role") == "tool" and result.get("content") and result.get("content") != "Success":
                scraped_content = result.get("content")
                break
        
        if not scraped_content.strip():
            return {"error": "No content was returned from scraper"}
        
        # Extract commit authors from scraped content
        authors = []
        if "SailingSF" in scraped_content:
            authors.append("SailingSF")
        if "kliment-slice" in scraped_content:
            authors.append("kliment-slice")
        if "eduuusama" in scraped_content:
            authors.append("eduuusama")
        
        # Map GitHub usernames to Twitter handles
        author_mapping = {
            "SailingSF": "@goodinvesting1",
            "kliment-slice": "@minchev",
            "eduuusama": "@eduardo_samayoa"
        }
        
        # Get Twitter handles for authors
        twitter_handles = [author_mapping.get(author) for author in authors if author in author_mapping]
        
        # Generate tweet based on scraped content
        tweet_prompt = f"""
        Create a concise tweet summarizing these GitHub commits:
        
        {scraped_content}
        
        Make it engaging and informative. DO NOT include any Twitter handles or tags.
        """
        
        tweet_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": tweet_prompt}]
        )
        
        tweet_content = tweet_response.choices[0].message.content.strip()
        
        # Add Twitter handles at the end of the tweet
        if twitter_handles:
            # Make sure the tweet is not too long when we add handles
            max_length = 280 - (sum(len(handle) + 1 for handle in twitter_handles) + 1)
            if len(tweet_content) > max_length:
                tweet_content = tweet_content[:max_length-3] + "..."
            
            tweet_content = f"{tweet_content} {' '.join(twitter_handles)}"
        
        return {
            "tweet": tweet_content,
            "authors": authors,
            "twitter_handles": twitter_handles
        }
        
    except Exception as e:
        return {"error": f"Error: {str(e)}"}

@app.post("/api/mcphack/composio/tweet")
async def mcphack_composio_tweet(request: Request):
    """Post a tweet using Composio"""
    try:
        body = await request.json()
        tweet_prompt = body.get("prompt", "")
        
        if not tweet_prompt:
            return {"error": "Missing 'prompt' in request body"}
            
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        # Get the composio tools
        mcphacks_tools = th.get_tools("compo")
        
        # Find the composio_toolset tool
        composio_tool = None
        for tool in mcphacks_tools:
            if tool.get('function', {}).get('name') == 'composio_toolset':
                composio_tool = tool
                break
                
        if not composio_tool:
            return {"error": "The composio_toolset tool is not available"}
        
        # Create a simple prompt for posting the tweet
        post_tweet_prompt = f"""
        Use the composio_toolset to post this tweet:

        "{tweet_prompt}"
        """
        
        # Execute the tool with the prompt
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": post_tweet_prompt}],
            tools=[composio_tool],
            tool_choice={"type": "function", "function": {"name": "composio_toolset"}}
        )
        
        # Execute tool calls
        th.run_tools(response)
        
        return {"status": "success"}
        
    except Exception as e:
        return {"error": f"Error: {str(e)}"}