"""
Debug chunks file to understand the structure.
"""

import json

try:
    with open('chunks.json', 'rb') as f:
        raw_data = f.read()
    print(f"Raw file size: {len(raw_data)} bytes")
    
    # Try UTF-8 first
    try:
        with open('chunks.json', 'r', encoding='utf-8') as f:
            chunks_data = json.load(f)
        print("✅ UTF-8 encoding successful")
    except UnicodeDecodeError:
        # Try with error handling
        with open('chunks.json', 'r', encoding='utf-8', errors='ignore') as f:
            chunks_data = json.load(f)
        print("⚠️ UTF-8 with error ignoring")
    
    # Handle chunks data structure
    if isinstance(chunks_data, dict) and "chunks" in chunks_data:
        chunks = chunks_data["chunks"]
        print(f"📊 Structured format - Total chunks: {len(chunks)}")
    elif isinstance(chunks_data, list):
        chunks = chunks_data
        print(f"📝 List format - Total chunks: {len(chunks)}")
    else:
        chunks = []
        print(f"❓ Unknown format: {type(chunks_data)}")
    
    if chunks:
        print(f"Sample chunk keys: {list(chunks[0].keys())}")
        content = chunks[0].get('content') or chunks[0].get('chunk', 'No content')
        print(f"Sample content: {content[:100]}...")
        print(f"Source: {chunks[0].get('source', 'No source')}")
        print(f"ID: {chunks[0].get('id', 'No ID')}")
        
except Exception as e:
    print(f"❌ Error reading chunks: {e}")