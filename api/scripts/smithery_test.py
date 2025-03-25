#!/usr/bin/env python3
import asyncio
import base64
import json
import os
import requests
import sys
import dotenv

# Import MCP and Smithery libraries
import smithery
import mcp
from mcp.client.websocket import websocket_client

dotenv.load_dotenv()

# Smithery Registry API base URL
REGISTRY_API_URL = "https://registry.smithery.ai"

def search_mcp_servers(query, api_token):
    """Search for MCP servers based on a keyword query"""
    # Add deployment filter to query
    if "is:deployed" not in query:
        query = f"{query} is:deployed"
    
    headers = {"Authorization": f"Bearer {api_token}"}
    response = requests.get(
        f"{REGISTRY_API_URL}/servers",
        headers=headers,
        params={"q": query, "pageSize": 5}
    )
    
    if response.status_code != 200:
        print(f"Error searching servers: {response.status_code}")
        print(response.text)
        return None
    
    return response.json()

def get_server_details(qualified_name, api_token):
    """Get details for a specific MCP server"""
    headers = {"Authorization": f"Bearer {api_token}"}
    response = requests.get(
        f"{REGISTRY_API_URL}/servers/{qualified_name}",
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"Error getting server details: {response.status_code}")
        print(response.text)
        return None
    
    return response.json()

async def connect_to_mcp_with_url(websocket_url, config):
    """
    Connect to an MCP server using a direct websocket URL and config
    
    Args:
        websocket_url: The WebSocket URL for the MCP server
        config: Dictionary containing configuration parameters
    """
    # Create Smithery URL with server endpoint
    url = smithery.create_smithery_url(websocket_url, config)
    
    print(f"Connecting to: {url}")
    
    try:
        # Connect to the server using websocket client
        async with websocket_client(url) as streams:
            async with mcp.ClientSession(*streams) as session:
                # List available tools
                tools_result = await session.list_tools()
                
                # Print tools list - handle it as a single object with tools property
                try:
                    if hasattr(tools_result, 'tools'):
                        # Access the tools property if available
                        tool_names = [t.name for t in tools_result.tools]
                        print(f"Available tools: {', '.join(tool_names)}")
                    elif hasattr(tools_result, '__iter__') and not isinstance(tools_result, str):
                        # Try to iterate directly if it's an iterable (but not a string)
                        tool_names = []
                        for tool in tools_result:
                            if hasattr(tool, 'name'):
                                tool_names.append(tool.name)
                            else:
                                tool_names.append(str(tool))
                        print(f"Available tools: {', '.join(tool_names)}")
                    else:
                        # Just print the result if we can't process it
                        print(f"Tools result: {tools_result}")
                except Exception as e:
                    print(f"Error processing tools: {e}")
                    print(f"Raw tools_result: {tools_result}")
                
                # Wait for user to specify if they want to call a tool
                while True:
                    command = input("\nEnter tool to call (or 'exit' to quit): ")
                    if command.lower() == 'exit':
                        break
                    
                    try:
                        # Ask for parameters
                        print("\nEnter parameters for the tool:")
                        print("Format: one parameter per line as 'key=value' (empty line when done)")
                        print("Example: repository=user/repo")
                        print("Example: path=path/to/file.txt")
                        
                        params = {}
                        while True:
                            param_line = input("> ")
                            if not param_line:
                                break
                            
                            if "=" in param_line:
                                key, value = param_line.split("=", 1)
                                params[key.strip()] = value.strip()
                            else:
                                print("Invalid format. Use 'key=value'")
                        
                        # Call the tool
                        result = await session.call_tool(command, params)
                        print(f"\nResult: {json.dumps(result, indent=2) if isinstance(result, (dict, list)) else result}")
                    except Exception as e:
                        print(f"Error calling tool: {e}")
    except Exception as e:
        print(f"Connection error: {e}")

async def main():
    # Get API token from environment variable or prompt user
    api_token = os.environ.get("SMITHERY_API_KEY")
    if not api_token:
        api_token = input("Enter your Smithery API token: ")
    
    # Ask if user wants to search for a server or connect directly
    choice = input("Do you want to (1) search for an MCP server or (2) connect directly? [1/2]: ")
    
    if choice == "1":
        # Search and connect flow
        # Get search query from command line or prompt user
        search_query = sys.argv[1] if len(sys.argv) > 1 else input("Enter search term for MCP servers: ")
        
        # Search for MCP servers
        print(f"Searching for MCP servers with query: '{search_query}'")
        results = search_mcp_servers(search_query, api_token)
        
        if not results or not results.get("servers"):
            print("No servers found matching your query.")
            return
        
        # Display search results
        servers = results["servers"]
        print(f"\nFound {len(servers)} servers:")
        for i, server in enumerate(servers):
            print(f"{i+1}. {server['displayName']} ({server['qualifiedName']})")
            print(f"   Description: {server['description']}")
            # Safely access fields that might not exist
            if "homepage" in server:
                print(f"   Homepage: {server['homepage']}")
            print()
        
        # Let user select a server
        selection = int(input("Select a server number to connect to: ")) - 1
        if selection < 0 or selection >= len(servers):
            print("Invalid selection")
            return
        
        selected_server = servers[selection]
        qualified_name = selected_server["qualifiedName"]
        
        # Get server details to determine connection and config requirements
        server_details = get_server_details(qualified_name, api_token)
        if not server_details:
            return
        
        # Find WebSocket connection details
        ws_connection = next((conn for conn in server_details.get("connections", []) 
                              if conn.get("type") == "ws"), None)
        
        if not ws_connection:
            print(f"No WebSocket connection available for {qualified_name}")
            return
        
        # Get the deployment URL and append websocket path
        deployment_url = server_details.get("deploymentUrl")
        
        # Construct the WebSocket URL
        if deployment_url:
            server_url = f"{deployment_url}/ws"
        elif ws_connection.get("url"):
            server_url = ws_connection.get("url")
        else:
            # Fallback to standard URL format using qualifiedName
            server_url = f"wss://server.smithery.ai/{qualified_name}/ws"
        
        print(f"Using WebSocket URL: {server_url}")
        
        # Get config schema and prompt for required fields
        config_schema = ws_connection.get("configSchema", {})
        required_fields = config_schema.get("required", [])
        properties = config_schema.get("properties", {})
        
        config = {}
        if required_fields:
            print("\nServer requires the following configuration:")
            for field in required_fields:
                field_type = properties.get(field, {}).get("type", "string")
                field_desc = properties.get(field, {}).get("description", "")
                print(f"- {field} ({field_type}): {field_desc}")
                config[field] = input(f"Enter value for {field}: ")
        
        # Connect to the selected MCP server
        await connect_to_mcp_with_url(server_url, config)
    
    else:
        # Direct connection flow
        ws_url = input("Enter WebSocket URL (e.g., wss://server.smithery.ai/@smithery-ai/github/ws): ")
        
        # Get server config interactively
        print("\nEnter configuration parameters:")
        print("(For example, for GitHub MCP enter 'githubPersonalAccessToken' and your token value)")
        config = {}
        while True:
            param_name = input("Parameter name (or press enter when done): ")
            if not param_name:
                break
            param_value = input(f"Value for {param_name}: ")
            config[param_name] = param_value
        
        # Connect directly to the specified MCP server
        await connect_to_mcp_with_url(ws_url, config)

if __name__ == "__main__":
    asyncio.run(main())
