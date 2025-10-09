"""Test if the pipeline can start with proper imports and .env loading"""
import sys
import os
from pathlib import Path

print(f"Python: {sys.version}")
print(f"Working directory: {os.getcwd()}")
print(f"Script directory: {Path(__file__).parent}")

# Try loading .env
print("\n=== Testing .env loading ===")
try:
    from dotenv import load_dotenv
    
    env_path = Path(__file__).parent / '.env'
    print(f"Looking for .env at: {env_path}")
    print(f"File exists: {env_path.exists()}")
    
    if env_path.exists():
        result = load_dotenv(dotenv_path=env_path)
        print(f"load_dotenv result: {result}")
        
        # Check if vars are loaded
        print("\n=== Environment Variables ===")
        for var in ["QDRANT_URL", "QDRANT_API_KEY", "GEMINI_API_KEY"]:
            value = os.getenv(var)
            if value:
                display = value[:30] + "..." if len(value) > 30 else value
                print(f"{var}: {display}")
            else:
                print(f"{var}: NOT SET")
    else:
        print("ERROR: .env file not found!")
        
except Exception as e:
    print(f"ERROR loading .env: {e}")
    import traceback
    traceback.print_exc()

# Try importing agents
print("\n=== Testing Imports ===")
try:
    print("Importing retriever_agent...")
    from retriever_agent import RetrieverAgent
    print("  OK")
    
    print("Importing writer_agent...")
    from writer_agent import WriterAgent
    print("  OK")
    
    print("Importing reviewer_agent...")
    from reviewer_agent import ReviewerAgent
    print("  OK")
    
    print("Importing exporter_agent...")
    from exporter_agent import ExporterAgent
    print("  OK")
    
    print("\nAll imports successful!")
    
except Exception as e:
    print(f"ERROR importing: {e}")
    import traceback
    traceback.print_exc()

# Try initializing RetrieverAgent
print("\n=== Testing RetrieverAgent Initialization ===")
try:
    agent = RetrieverAgent()
    print("RetrieverAgent initialized successfully!")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Test Complete ===")

