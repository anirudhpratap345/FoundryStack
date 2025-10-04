"""
Test Qdrant search functionality.
"""

from qdrant_manager import QdrantManager

def test_search():
    print("🔍 Testing Qdrant Search...")
    
    manager = QdrantManager()
    
    # Test queries
    queries = [
        "FastAPI documentation",
        "Next.js app router",
        "Redis configuration", 
        "API development",
        "web framework"
    ]
    
    for query in queries:
        print(f"\nSearching: '{query}'")
        results = manager.retrieve_similar_docs(
            query=query,
            limit=3,
            score_threshold=0.1
        )
        
        print(f"Found {len(results)} results:")
        for i, result in enumerate(results):
            print(f"  {i+1}. Score: {result['score']:.3f}")
            print(f"     Source: {result['metadata'].get('source', 'unknown')}")
            print(f"     Text: {result['text'][:100]}...")
    
    # Get collection stats
    stats = manager.get_collection_stats()
    print(f"\n📊 Collection Stats:")
    print(f"  Vectors: {stats.get('vectors_count', 0)}")
    print(f"  Dimension: {stats.get('dimension', 0)}")
    print(f"  Status: {stats.get('status', 'unknown')}")

if __name__ == "__main__":
    test_search()
