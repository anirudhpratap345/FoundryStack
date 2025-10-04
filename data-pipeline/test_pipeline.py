"""
Test script for the RAG pipeline components.
"""

import os
import sys
import json
import tempfile
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_crawler import EnhancedCrawler
from chunker import chunk_text, chunk_document, process_documents
from embedder import DocumentEmbedder


def test_crawler():
    """Test the enhanced crawler with a small sample."""
    print("Testing Enhanced Crawler...")
    
    try:
        crawler = EnhancedCrawler()
        crawler.max_articles_per_site = 2  # Limit for testing
        
        # Test news sites
        articles = crawler.crawl_news_sites()
        print(f"✅ Crawled {len(articles)} news articles")
        
        # Test startup directories
        startups = crawler.crawl_startup_directories()
        print(f"✅ Crawled {len(startups)} startup entries")
        
        # Test tech docs
        docs = crawler.crawl_tech_documentation()
        print(f"✅ Crawled {len(docs)} tech documentation pages")
        
        return True
        
    except Exception as e:
        print(f"❌ Crawler test failed: {e}")
        return False


def test_chunker():
    """Test the document chunker."""
    print("\nTesting Document Chunker...")
    
    try:
        # Test chunk_text function
        sample_text = "This is a sample text for testing the chunker. " * 100
        chunks = chunk_text(sample_text, chunk_size=50, overlap=10)
        print(f"✅ Text chunking: {len(chunks)} chunks created")
        
        # Test chunk_document function
        sample_doc = {
            "id": "test_doc",
            "source": "test",
            "url": "https://test.com",
            "title": "Test Document",
            "content": sample_text,
            "type": "test"
        }
        
        chunked_docs = chunk_document(sample_doc, chunk_size=50, overlap=10)
        print(f"✅ Document chunking: {len(chunked_docs)} chunks created")
        
        # Test with temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            test_data = {
                "metadata": {"total_documents": 1},
                "documents": [sample_doc]
            }
            json.dump(test_data, f)
            temp_file = f.name
        
        try:
            # Test process_documents
            stats = process_documents(temp_file, "test_chunks.json", chunk_size=50, overlap=10)
            print(f"✅ File processing: {stats['total_chunks']} chunks created")
            
            # Clean up
            os.unlink(temp_file)
            if os.path.exists("test_chunks.json"):
                os.unlink("test_chunks.json")
            
        finally:
            if os.path.exists(temp_file):
                os.unlink(temp_file)
        
        return True
        
    except Exception as e:
        print(f"❌ Chunker test failed: {e}")
        return False


def test_embedder():
    """Test the document embedder (without database)."""
    print("\nTesting Document Embedder...")
    
    try:
        # Test model loading
        print("Loading embedding model...")
        model = DocumentEmbedder.__new__(DocumentEmbedder)
        model._load_model()
        print("✅ Model loaded successfully")
        
        # Test embedding generation
        sample_text = "This is a test document for embedding generation."
        embedding = model.generate_embedding(sample_text)
        print(f"✅ Embedding generated: {len(embedding)} dimensions")
        
        return True
        
    except Exception as e:
        print(f"❌ Embedder test failed: {e}")
        return False


def test_pipeline_integration():
    """Test the complete pipeline integration."""
    print("\nTesting Pipeline Integration...")
    
    try:
        # Create a small test dataset
        test_docs = [
            {
                "id": "test_1",
                "source": "Test Source",
                "url": "https://test.com/1",
                "title": "Test Document 1",
                "content": "This is a test document about AI and machine learning. " * 50,
                "type": "test",
                "crawled_at": datetime.now().isoformat()
            },
            {
                "id": "test_2", 
                "source": "Test Source",
                "url": "https://test.com/2",
                "title": "Test Document 2",
                "content": "This is another test document about startup funding and venture capital. " * 50,
                "type": "test",
                "crawled_at": datetime.now().isoformat()
            }
        ]
        
        # Test chunking
        all_chunks = []
        for doc in test_docs:
            chunks = chunk_document(doc, chunk_size=100, overlap=20)
            all_chunks.extend(chunks)
        
        print(f"✅ Integration test: {len(all_chunks)} chunks created from {len(test_docs)} documents")
        
        # Test embedding generation
        model = DocumentEmbedder.__new__(DocumentEmbedder)
        model._load_model()
        
        for i, chunk in enumerate(all_chunks[:3]):  # Test first 3 chunks
            embedding = model.generate_embedding(chunk['content'])
            print(f"✅ Chunk {i+1} embedding: {len(embedding)} dimensions")
        
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("🧪 Running RAG Pipeline Tests")
    print("=" * 50)
    
    tests = [
        ("Crawler", test_crawler),
        ("Chunker", test_chunker),
        ("Embedder", test_embedder),
        ("Integration", test_pipeline_integration)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name}: {status}")
        if success:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Pipeline is ready to use.")
        return True
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
