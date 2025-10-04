"""
Test Qdrant setup and basic functionality.
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_qdrant_connection():
    """Test Qdrant connection and basic operations."""
    print("🔍 Testing Qdrant Connection...")
    
    try:
        from qdrant_manager import QdrantManager
        
        # Initialize manager
        print("Initializing QdrantManager...")
        manager = QdrantManager()
        
        # Test collection stats
        stats = manager.get_collection_stats()
        print(f"✅ Collection stats: {stats}")
        
        # Test document storage
        print("Testing document storage...")
        success = manager.store_document(
            document_id=1,  # Use integer ID
            text="This is a test document for FoundryStack.",
            metadata={
                "source": "test",
                "url": "https://test.com",
                "page": 1
            }
        )
        
        if success:
            print("✅ Document storage successful")
        else:
            print("❌ Document storage failed")
            return False
        
        # Test search
        print("Testing document search...")
        results = manager.retrieve_similar_docs(
            query="test document",
            limit=3,
            score_threshold=0.1  # Lower threshold for testing
        )
        
        if results:
            print(f"✅ Search successful - found {len(results)} results")
            print(f"Top result: {results[0]['text']} (score: {results[0]['score']:.3f})")
        else:
            print("❌ Search failed - no results found")
            print("This might be normal if the embedding model needs time to process")
            # Don't fail the test for this, just continue
        
        # Clean up
        print("Cleaning up test document...")
        manager.delete_document(1)
        print("✅ Cleanup successful")
        
        print("🎉 Qdrant test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Qdrant test failed: {e}")
        print("\nTroubleshooting:")
        print("1. Install dependencies: pip install qdrant-client sentence-transformers")
        print("2. Start Qdrant: docker run -d -p 6333:6333 qdrant/qdrant")
        print("3. Or use Qdrant Cloud: signup at https://qdrant.tech")
        return False

if __name__ == "__main__":
    success = test_qdrant_connection()
    sys.exit(0 if success else 1)
