from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# Create FastAPI app instance
app = FastAPI(
    title="MCPaaS API",
    description="API for MCPaaS tool interactions with Groq and Toolhouse",
    version="1.0.0"
)

# Configure Cross-Origin Resource Sharing (CORS)
# This allows the API to be called from different domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import potentially conflicting libraries with appropriate error handling
try:
    # Import Groq for LLM API access
    from groq import Groq
except ImportError as e:
    raise ImportError(f"Failed to import Groq: {e}. Try installing a newer version of fastapi that's compatible with anyio>=4.5")

try:
    # Import Toolhouse for tools access and initialize with API key
    from toolhouse import Toolhouse
    th = Toolhouse(api_key=os.getenv("TOOLHOUSE_API_KEY"))
except ImportError as e:
    raise ImportError(f"Failed to import Toolhouse: {e}")

def get_groq_client() -> Groq:
    """
    Create and return a configured Groq client using API key from environment variables.
    
    Returns:
        Groq: An initialized Groq client ready for API calls
        
    Raises:
        HTTPException: If GROQ_API_KEY environment variable is not set
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable not set")
    return Groq(api_key=api_key)

class ScrapeRequest(BaseModel):
    """Pydantic model for scrape request payload"""
    url: str

class EmptyRequest(BaseModel):
    """Pydantic model for empty request payload"""
    pass

@app.post("/api/groq/query")
async def groq_query(request: Request) -> Dict[str, Any]:
    """
    Execute a Groq query using the llama-3.3-70b-versatile model.
    
    Args:
        request (Request): FastAPI request object containing 'prompt' in JSON body
        
    Returns:
        Dict[str, Any]: JSON response with result or error
        
    Example request:
        POST /api/groq/query
        {"prompt": "Tell me about AI"}
    """
    try:
        # Parse request body
        data = await request.json()
        
        # Validate required fields
        if 'prompt' not in data:
            return {"error": "Missing required 'prompt' in request body"}, 400
        
        # Execute Groq query with the provided prompt
        response = await run_groq_query(
            prompt=data['prompt'],
            model="llama-3.3-70b-versatile"
        )
        return {"result": response}
        
    except Exception as e:
        # Return error information
        return {"error": str(e)}, 500

async def run_groq_query(prompt: str, model: str = "llama-3.3-70b-versatile") -> str:
    """
    Execute a Groq query using the specified model.
    
    Args:
        prompt (str): The prompt text to send to the model
        model (str, optional): The model identifier. Defaults to "llama-3.3-70b-versatile"
        
    Returns:
        str: The generated text response
        
    Raises:
        RuntimeError: If an error occurs during the API call
    """
    # Get Groq client
    client = get_groq_client()
    
    try:
        # Create a chat completion with the specified parameters
        completion = client.chat.completions.create(
            model=model,
            messages=[{
                "role": "user",
                "content": prompt
            }],
            temperature=0.5,  # Controls randomness: lower is more deterministic
            max_tokens=1024   # Limits response length
        )
        # Extract and return just the text content
        return completion.choices[0].message.content
    except Exception as e:
        raise RuntimeError(f"Groq API error: {str(e)}")


@app.get("/api/mcphack/summarizescrape")
async def mcphack_summarize_scrape() -> Dict[str, Any]:
    """
    Scrape the GitHub commits page and return a tweet summary with author tags.
    
    This endpoint:
    1. Uses Toolhouse's firecrawl_scrape to extract GitHub commit data
    2. Extracts author information from the scraped content
    3. Generates a concise tweet summarizing the commits
    4. Adds appropriate Twitter handles for the commit authors
    
    Returns:
        Dict[str, Any]: JSON response containing the tweet text, authors, and Twitter handles
        
    Example response:
        {
            "tweet": "New commits: improved error handling and UI updates #github",
            "authors": ["SailingSF", "kliment-slice"],
            "twitter_handles": ["@goodinvesting1", "@minchev"]
        }
    """
    try:
        # Initialize the Groq client
        client = get_groq_client()
        
        # Define the target GitHub commits URL
        url = "https://github.com/kliment-slice/MCPaaS/commits"
        
        # ---- STEP 1: Get the web scraping tool ----
        # Get mcphack tools to find firecrawl_scrape
        mcphacks_tools = th.get_tools("mcphack")
        
        # Find the firecrawl_scrape tool from the available tools
        firecrawl_tool = None
        for tool in mcphacks_tools:
            if tool.get('function', {}).get('name') == 'firecrawl_scrape':
                firecrawl_tool = tool
                break
                
        if not firecrawl_tool:
            return {"error": "The firecrawl_scrape tool is not available"}
        
        # ---- STEP 2: Scrape the commits page ----
        # Create a prompt for the scraping operation
        scrape_prompt = f"Use firecrawl_scrape to scrape the GitHub commits page: {url}"
        
        # Execute the tool using Groq to scrape the page
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": scrape_prompt}],
            tools=[firecrawl_tool],
            tool_choice={"type": "function", "function": {"name": "firecrawl_scrape"}}
        )
        
        # Use Toolhouse to execute the tool calls generated by Groq
        tool_results = th.run_tools(response)
        
        # ---- STEP 3: Extract content from the scrape results ----
        scraped_content = ""
        for result in tool_results:
            if result.get("role") == "tool" and result.get("content") and result.get("content") != "Success":
                scraped_content = result.get("content")
                break
        
        # Validate that we received content
        if not scraped_content.strip():
            return {"error": "No content was returned from scraper"}
        
        # ---- STEP 4: Extract commit authors from scraped content ----
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
        
        # Get Twitter handles for authors found in the commits
        twitter_handles = [author_mapping.get(author) for author in authors if author in author_mapping]
        
        # ---- STEP 5: Generate tweet based on scraped content ----
        tweet_prompt = f"""
        Create a concise tweet summarizing these GitHub commits:
        
        {scraped_content}
        
        Make it engaging and informative. DO NOT include any Twitter handles or tags.
        """
        
        # Generate tweet text using Groq
        tweet_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": tweet_prompt}]
        )
        
        # Extract the tweet content
        tweet_content = tweet_response.choices[0].message.content.strip()
        
        # ---- STEP 6: Add Twitter handles at the end of the tweet ----
        if twitter_handles:
            # Calculate space needed for Twitter handles
            # Make sure the tweet is not too long when we add handles (Twitter limit: 280 chars)
            max_length = 280 - (sum(len(handle) + 1 for handle in twitter_handles) + 1)
            if len(tweet_content) > max_length:
                tweet_content = tweet_content[:max_length-3] + "..."
            
            # Append Twitter handles to the tweet
            tweet_content = f"{tweet_content} {' '.join(twitter_handles)}"
        
        # Return the final result
        return {
            "tweet": tweet_content,
            "authors": authors,
            "twitter_handles": twitter_handles
        }
        
    except Exception as e:
        return {"error": f"Error: {str(e)}"}

@app.post("/api/mcphack/composio/tweet")
async def mcphack_composio_tweet(request: Request) -> Dict[str, Any]:
    """
    Post a tweet using Composio tool integration.
    
    This endpoint:
    1. Takes a tweet prompt from the request
    2. Uses Toolhouse's composio_toolset to post the tweet
    
    Args:
        request (Request): FastAPI request object containing 'prompt' in JSON body
        
    Returns:
        Dict[str, Any]: JSON response with status or error
        
    Example request:
        POST /api/mcphack/composio/tweet
        {"prompt": "Just released a new version of MCPaaS with improved AI tools!"}
    """
    try:
        # Parse the request body
        body = await request.json()
        tweet_prompt = body.get("prompt", "")
        
        # Validate required fields
        if not tweet_prompt:
            return {"error": "Missing 'prompt' in request body"}
            
        # Initialize the Groq client
        client = get_groq_client()
        
        # ---- STEP 1: Get the Composio tweet tool ----
        # Retrieve available composio tools
        mcphacks_tools = th.get_tools("compo")
        
        # Find the composio_toolset tool
        composio_tool = None
        for tool in mcphacks_tools:
            if tool.get('function', {}).get('name') == 'composio_toolset':
                composio_tool = tool
                break
                
        if not composio_tool:
            return {"error": "The composio_toolset tool is not available"}
        
        # ---- STEP 2: Create prompt for posting the tweet ----
        post_tweet_prompt = f"""
        Use the composio_toolset to post this tweet:

        "{tweet_prompt}"
        """
        
        # ---- STEP 3: Execute the Composio tool to post the tweet ----
        # Use Groq to generate the tool call
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": post_tweet_prompt}],
            tools=[composio_tool],
            tool_choice={"type": "function", "function": {"name": "composio_toolset"}}
        )
        
        # Execute the tool call with Toolhouse
        th.run_tools(response)
        
        # Return success response
        return {"status": "success"}
        
    except Exception as e:
        return {"error": f"Error: {str(e)}"}