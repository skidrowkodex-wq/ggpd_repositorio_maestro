#!/usr/bin/env python3
"""
⚡ VibeHost MCP Deployer
Calls the VibeHost MCP JSON-RPC endpoint at https://api.vibehost.com/mcp
"""

import os
import json
import hashlib
import mimetypes
import requests
from pathlib import Path

MCP_URL = "https://api.vibehost.com/mcp"
PAT_TOKEN = os.environ.get("VIBEHOST_TOKEN", "***REMOVED***")

HEADERS = {
    "Authorization": f"Bearer {PAT_TOKEN}",
    "Content-Type": "application/json"
}

def mcp_call(method_name, arguments=None):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": method_name,
            "arguments": arguments or {}
        }
    }
    try:
        r = requests.post(MCP_URL, headers=HEADERS, json=payload, timeout=15)
        print(f"[{method_name}] HTTP {r.status_code}: {r.text[:300]}")
        if r.ok:
            return r.json()
    except Exception as e:
        print(f"[{method_name}] Error: {e}")
    return None

def list_mcp_tools():
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/list",
        "params": {}
    }
    r = requests.post(MCP_URL, headers=HEADERS, json=payload, timeout=10)
    print(f"[tools/list] HTTP {r.status_code}: {r.text[:400]}")
    return r.json() if r.ok else None

if __name__ == "__main__":
    print("1. Consultando herramientas disponibles en VibeHost MCP...")
    tools = list_mcp_tools()
    print("\n2. Listando aplicaciones existentes...")
    mcp_call("list_apps")
