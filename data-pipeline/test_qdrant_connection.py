"""Quick test to diagnose Qdrant connection issues"""
import os
from dotenv import load_dotenv

# Load .env from current directory
load_dotenv()

# Get credentials
url = os.getenv("QDRANT_URL")
api_key = os.getenv("QDRANT_API_KEY")

print("=" * 60)
print("🔍 Qdrant Connection Diagnostics")
print("=" * 60)

print(f"\n1. Environment Variables:")
print(f"   QDRANT_URL: {url}")
print(f"   QDRANT_API_KEY: {api_key[:20]}...{api_key[-10:] if api_key else 'NOT SET'}")

if not url:
    print("\n❌ ERROR: QDRANT_URL not set in .env file!")
    exit(1)

if not api_key:
    print("\n❌ ERROR: QDRANT_API_KEY not set in .env file!")
    exit(1)

print(f"\n2. Testing connection to: {url}")

try:
    from qdrant_client import QdrantClient
    
    # Try connecting
    print("   Creating QdrantClient...")
    client = QdrantClient(
        url=url,
        api_key=api_key,
        timeout=10
    )
    
    print("   ✅ Client created successfully")
    
    # Try listing collections
    print("\n3. Testing API access (list collections)...")
    collections = client.get_collections()
    
    print(f"   ✅ API access successful!")
    print(f"   📦 Found {len(collections.collections)} collections:")
    for col in collections.collections:
        print(f"      - {col.name}")
    
    print("\n🎉 Qdrant connection is WORKING!")
    print("\nNext step: Run 'python qdrant_embedder.py --embed chunks.json' to load data")
    
except Exception as e:
    print(f"\n❌ Connection failed: {e}")
    print("\nPossible issues:")
    print("1. API key is invalid or expired")
    print("   → Check Qdrant Cloud dashboard for correct key")
    print("2. URL is incorrect")
    print("   → Verify cluster URL from Qdrant dashboard")
    print("3. Cluster is paused/deleted")
    print("   → Check if cluster is active in Qdrant Cloud")
    print("4. Network/firewall blocking connection")
    print("   → Try from a different network or disable VPN")
    exit(1)

