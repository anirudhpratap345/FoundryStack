"""
Complete Pipeline Test

Tests the full multi-agent pipeline:
Retriever Agent → Writer Agent → Reviewer Agent → Exporter Agent

Usage:
    python test_complete_pipeline.py
"""

import sys
import os
import json
import asyncio
from datetime import datetime

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from retriever_agent import RetrieverAgent
from writer_agent import WriterAgent
from reviewer_agent import ReviewerAgent
from exporter_agent import ExporterAgent


async def test_complete_pipeline():
    """Test the complete multi-agent pipeline"""
    print("🚀 Starting Complete Pipeline Test")
    print("=" * 50)
    
    # Initialize all agents
    print("1. Initializing agents...")
    try:
        retriever = RetrieverAgent()
        writer = WriterAgent()
        reviewer = ReviewerAgent()
        exporter = ExporterAgent()
        print("✅ All agents initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize agents: {e}")
        return
    
    # Test query
    query = "Explain how Supabase Edge Functions work and their benefits"
    print(f"\n2. Testing with query: '{query}'")
    
    # Step 1: Retrieve context
    print("\n📚 Step 1: Retrieving context...")
    try:
        context = retriever.retrieve_context(query, limit=3, score_threshold=0.3)
        print(f"✅ Retrieved {context.total_results} documents")
        print(f"   Search time: {context.search_time_ms:.2f}ms")
        print(f"   Sources: {list(context.sources_summary.keys())}")
    except Exception as e:
        print(f"❌ Retrieval failed: {e}")
        return
    
    # Step 2: Write draft
    print("\n✍️ Step 2: Writing draft...")
    try:
        # Convert RetrievedDocument objects to dict format for Writer Agent
        contexts = []
        for doc in context.retrieved_documents:
            contexts.append({
                "content": doc.content,
                "source": doc.source,
                "score": doc.relevance_score
            })
        
        draft = writer.write(query, contexts)
        print("✅ Draft written successfully")
        print(f"   Title: {draft.get('draft', {}).get('title', 'N/A')}")
        print(f"   Sections: {len(draft.get('draft', {}).get('sections', []))}")
    except Exception as e:
        print(f"❌ Writing failed: {e}")
        return
    
    # Step 3: Review draft
    print("\n🔍 Step 3: Reviewing draft...")
    try:
        review = reviewer.review(draft.get('draft', {}))
        print("✅ Draft reviewed successfully")
        review_info = review.get('review', {})
        print(f"   Accuracy: {review_info.get('accuracy_score', 'N/A')}/10")
        print(f"   Clarity: {review_info.get('clarity_score', 'N/A')}/10")
        print(f"   Completeness: {review_info.get('completeness_score', 'N/A')}/10")
        print(f"   Recommendation: {review_info.get('final_recommendation', 'N/A')}")
    except Exception as e:
        print(f"❌ Review failed: {e}")
        return
    
    # Step 4: Export results
    print("\n📤 Step 4: Exporting results...")
    try:
        exported_files = exporter.export_all(review, ["json", "markdown", "html"])
        print("✅ Export completed successfully")
        for format_type, file_path in exported_files.items():
            print(f"   {format_type.upper()}: {file_path}")
    except Exception as e:
        print(f"❌ Export failed: {e}")
        return
    
    print("\n🎉 Complete pipeline test successful!")
    print("=" * 50)
    
    # Display summary
    print("\n📊 Pipeline Summary:")
    print(f"   Query: {query}")
    print(f"   Retrieved: {context.total_results} documents")
    print(f"   Draft sections: {len(draft.get('draft', {}).get('sections', []))}")
    print(f"   Review scores: {review_info.get('accuracy_score', 'N/A')}/{review_info.get('clarity_score', 'N/A')}/{review_info.get('completeness_score', 'N/A')}")
    print(f"   Exported formats: {list(exported_files.keys())}")
    
    return {
        "query": query,
        "context": context,
        "draft": draft,
        "review": review,
        "exported_files": exported_files
    }


def test_individual_agents():
    """Test individual agents with sample data"""
    print("\n🧪 Testing Individual Agents")
    print("=" * 30)
    
    # Test Writer Agent
    print("\n1. Testing Writer Agent...")
    try:
        writer = WriterAgent()
        sample_contexts = [
            {
                "content": "Edge Functions are Deno-based serverless functions deployed globally for low latency.",
                "source": "https://supabase.com/docs/edge-functions",
                "score": 0.9
            }
        ]
        draft = writer.write("Explain Supabase Edge Functions", sample_contexts)
        print("✅ Writer Agent working")
        print(f"   Draft title: {draft.get('draft', {}).get('title', 'N/A')}")
    except Exception as e:
        print(f"❌ Writer Agent failed: {e}")
    
    # Test Reviewer Agent
    print("\n2. Testing Reviewer Agent...")
    try:
        reviewer = ReviewerAgent()
        sample_draft = {
            "title": "Test Document",
            "summary": "This is a test document for review.",
            "sections": [
                {
                    "heading": "Introduction",
                    "content": "This is the introduction section."
                }
            ],
            "references": []
        }
        review = reviewer.review(sample_draft)
        print("✅ Reviewer Agent working")
        print(f"   Review recommendation: {review.get('review', {}).get('final_recommendation', 'N/A')}")
    except Exception as e:
        print(f"❌ Reviewer Agent failed: {e}")
    
    # Test Exporter Agent
    print("\n3. Testing Exporter Agent...")
    try:
        exporter = ExporterAgent()
        sample_review = {
            "review": {
                "reviewed_draft": {
                    "title": "Test Document",
                    "summary": "This is a test document.",
                    "sections": [{"heading": "Test", "content": "Test content"}],
                    "references": []
                },
                "accuracy_score": 8.0,
                "clarity_score": 8.0,
                "completeness_score": 7.0,
                "suggestions": ["Add more examples"],
                "final_recommendation": "Approve"
            }
        }
        files = exporter.export_all(sample_review, ["json", "markdown"])
        print("✅ Exporter Agent working")
        print(f"   Exported files: {list(files.keys())}")
    except Exception as e:
        print(f"❌ Exporter Agent failed: {e}")


if __name__ == "__main__":
    print("FoundryStack Multi-Agent Pipeline Test")
    print("=====================================")
    
    # Check if GEMINI_API_KEY is set
    if not os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
        print("❌ GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required")
        print("   Set it with: $env:GEMINI_API_KEY='your_key_here'")
        sys.exit(1)
    
    # Test individual agents first
    test_individual_agents()
    
    # Test complete pipeline
    print("\n" + "=" * 50)
    print("Testing Complete Pipeline")
    print("=" * 50)
    
    try:
        result = asyncio.run(test_complete_pipeline())
        if result:
            print("\n✅ All tests passed!")
        else:
            print("\n❌ Pipeline test failed")
    except Exception as e:
        print(f"\n❌ Pipeline test failed: {e}")
