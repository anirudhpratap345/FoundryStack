"""
Enhanced Startup Blueprint Test

Tests the pipeline specifically for comprehensive startup blueprint generation
with focus on high clarity, completeness, and accuracy scores.

Usage:
    python test_startup_blueprint.py
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


async def test_startup_blueprint_pipeline():
    """Test the pipeline for comprehensive startup blueprint generation"""
    print("🚀 Enhanced Startup Blueprint Pipeline Test")
    print("=" * 60)
    
    # Initialize all agents
    print("1. Initializing enhanced agents...")
    try:
        retriever = RetrieverAgent()
        writer = WriterAgent()
        reviewer = ReviewerAgent()
        exporter = ExporterAgent()
        print("✅ All agents initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize agents: {e}")
        return
    
    # Test queries for different types of startups
    test_queries = [
        "Create a comprehensive startup blueprint for an AI-powered fintech platform that helps small businesses with automated accounting and financial planning",
        "Develop a detailed startup plan for a healthtech SaaS platform that connects patients with specialized doctors for rare diseases",
        "Build a complete startup blueprint for a sustainable e-commerce marketplace focused on eco-friendly products"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{'='*60}")
        print(f"TEST CASE {i}: {query[:80]}...")
        print(f"{'='*60}")
        
        # Step 1: Retrieve context
        print(f"\n📚 Step 1: Retrieving context for test case {i}...")
        try:
            context = retriever.retrieve_context(query, limit=5, score_threshold=0.2)
            print(f"✅ Retrieved {context.total_results} documents")
            print(f"   Search time: {context.search_time_ms:.2f}ms")
            print(f"   Sources: {list(context.sources_summary.keys())}")
        except Exception as e:
            print(f"❌ Retrieval failed: {e}")
            continue
        
        # Step 2: Write comprehensive draft
        print(f"\n✍️ Step 2: Writing comprehensive startup blueprint for test case {i}...")
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
            print("✅ Comprehensive draft written successfully")
            
            # Display draft structure
            draft_content = draft.get('draft', {})
            print(f"   Title: {draft_content.get('title', 'N/A')}")
            print(f"   Summary length: {len(draft_content.get('summary', ''))} characters")
            print(f"   Sections: {len(draft_content.get('sections', []))}")
            
            # List sections
            sections = draft_content.get('sections', [])
            if sections:
                print("   Section headings:")
                for j, section in enumerate(sections[:5], 1):  # Show first 5 sections
                    heading = section.get('heading', f'Section {j}')
                    content_length = len(section.get('content', ''))
                    print(f"     {j}. {heading} ({content_length} chars)")
                if len(sections) > 5:
                    print(f"     ... and {len(sections) - 5} more sections")
            
            print(f"   References: {len(draft_content.get('references', []))}")
            
        except Exception as e:
            print(f"❌ Writing failed: {e}")
            continue
        
        # Step 3: Review draft thoroughly
        print(f"\n🔍 Step 3: Thoroughly reviewing startup blueprint for test case {i}...")
        try:
            review = reviewer.review(draft.get('draft', {}))
            print("✅ Draft reviewed successfully")
            
            review_info = review.get('review', {})
            accuracy = review_info.get('accuracy_score', 0)
            clarity = review_info.get('clarity_score', 0)
            completeness = review_info.get('completeness_score', 0)
            recommendation = review_info.get('final_recommendation', 'N/A')
            
            print(f"   📊 Review Scores:")
            print(f"     Accuracy: {accuracy}/10 {'🟢' if accuracy >= 8 else '🟡' if accuracy >= 6 else '🔴'}")
            print(f"     Clarity: {clarity}/10 {'🟢' if clarity >= 8 else '🟡' if clarity >= 6 else '🔴'}")
            print(f"     Completeness: {completeness}/10 {'🟢' if completeness >= 8 else '🟡' if completeness >= 6 else '🔴'}")
            print(f"     Recommendation: {recommendation}")
            
            # Show suggestions
            suggestions = review_info.get('suggestions', [])
            if suggestions:
                print(f"   💡 Suggestions ({len(suggestions)}):")
                for j, suggestion in enumerate(suggestions[:3], 1):  # Show first 3
                    print(f"     {j}. {suggestion}")
                if len(suggestions) > 3:
                    print(f"     ... and {len(suggestions) - 3} more suggestions")
            
            # Calculate overall quality score
            overall_score = (accuracy + clarity + completeness) / 3
            print(f"   🎯 Overall Quality: {overall_score:.1f}/10")
            
        except Exception as e:
            print(f"❌ Review failed: {e}")
            continue
        
        # Step 4: Export results
        print(f"\n📤 Step 4: Exporting comprehensive blueprint for test case {i}...")
        try:
            # Get title for export
            draft_title = draft_content.get('title', f'Startup_Blueprint_{i}')
            exported_files = exporter.export_all(review, ["json", "markdown", "html"], draft_title)
            print("✅ Export completed successfully")
            for format_type, file_path in exported_files.items():
                print(f"   {format_type.upper()}: {file_path}")
        except Exception as e:
            print(f"❌ Export failed: {e}")
            continue
        
        print(f"\n✅ Test case {i} completed successfully!")
        
        # Show quality assessment
        if overall_score >= 8:
            print("   🎉 EXCELLENT quality blueprint!")
        elif overall_score >= 6:
            print("   👍 GOOD quality blueprint with room for improvement")
        else:
            print("   ⚠️  NEEDS IMPROVEMENT - consider enhancing the query or context")
    
    print(f"\n{'='*60}")
    print("🎉 All startup blueprint tests completed!")
    print(f"{'='*60}")


def test_enhanced_individual_agents():
    """Test individual agents with startup-focused sample data"""
    print("\n🧪 Testing Enhanced Individual Agents")
    print("=" * 40)
    
    # Test Writer Agent with startup context
    print("\n1. Testing Enhanced Writer Agent...")
    try:
        writer = WriterAgent()
        startup_contexts = [
            {
                "content": "Fintech startups require robust security measures, PCI DSS compliance, and scalable cloud infrastructure. Key technologies include React/Next.js for frontend, Node.js/Python for backend, PostgreSQL for database, and AWS/GCP for cloud deployment. Revenue models typically include subscription fees, transaction fees, and API licensing.",
                "source": "https://fintech-startup-guide.com",
                "score": 0.95
            },
            {
                "content": "Market analysis shows the global fintech market is valued at $310 billion in 2024, growing at 20% CAGR. Key competitors include Stripe, Square, and PayPal. Target market includes 30+ million small businesses in the US alone. Customer acquisition cost averages $200-500, with lifetime value of $2,000-5,000.",
                "source": "https://fintech-market-research.com",
                "score": 0.92
            }
        ]
        draft = writer.write("Create a comprehensive fintech startup blueprint", startup_contexts)
        print("✅ Enhanced Writer Agent working")
        
        draft_content = draft.get('draft', {})
        print(f"   Draft title: {draft_content.get('title', 'N/A')}")
        print(f"   Sections: {len(draft_content.get('sections', []))}")
        print(f"   Summary length: {len(draft_content.get('summary', ''))} chars")
        
    except Exception as e:
        print(f"❌ Enhanced Writer Agent failed: {e}")
    
    # Test Reviewer Agent with comprehensive startup draft
    print("\n2. Testing Enhanced Reviewer Agent...")
    try:
        reviewer = ReviewerAgent()
        comprehensive_draft = {
            "title": "AI-Powered Fintech Platform - Complete Startup Blueprint",
            "summary": "A comprehensive fintech platform leveraging AI to provide automated accounting, financial planning, and business intelligence for small businesses. The platform addresses the $2.3 trillion small business market with a clear value proposition of reducing financial management time by 80% while improving accuracy.",
            "sections": [
                {
                    "heading": "Executive Summary",
                    "content": "Our AI-powered fintech platform revolutionizes small business financial management through automated accounting, real-time financial insights, and predictive analytics. Targeting the 30+ million small businesses in the US, we project $50M ARR by year 3 with a clear path to profitability."
                },
                {
                    "heading": "Technical Architecture",
                    "content": "Frontend: Next.js 14 with TypeScript, Tailwind CSS. Backend: Node.js with Express, Python for AI/ML services. Database: PostgreSQL with Redis caching. AI/ML: TensorFlow, OpenAI GPT-4 for financial analysis. Cloud: AWS with auto-scaling. Security: End-to-end encryption, SOC 2 compliance, PCI DSS certification."
                },
                {
                    "heading": "Market Analysis",
                    "content": "Total Addressable Market: $2.3 trillion (US small business market). Serviceable Addressable Market: $180 billion (financial services for SMBs). Target customers: 30M small businesses with 1-50 employees. Competitive advantage: AI-first approach with 80% automation vs 20% for competitors."
                },
                {
                    "heading": "Business Model",
                    "content": "Revenue streams: 1) Subscription tiers ($29-199/month), 2) Transaction fees (0.5-2%), 3) API licensing ($0.10/request), 4) Premium AI insights ($50-200/month). Projected ARR: Year 1: $2M, Year 2: $15M, Year 3: $50M. Gross margin: 85%, Customer acquisition cost: $300, Lifetime value: $3,500."
                },
                {
                    "heading": "Implementation Roadmap",
                    "content": "Phase 1 (Months 1-6): MVP development, core accounting features, basic AI integration. Phase 2 (Months 7-12): Advanced AI features, mobile app, integrations. Phase 3 (Months 13-18): Scale infrastructure, enterprise features, international expansion. Team growth: 5 → 15 → 35 employees."
                }
            ],
            "references": [
                {
                    "source": "https://fintech-startup-guide.com",
                    "note": "Technical architecture best practices"
                },
                {
                    "source": "https://fintech-market-research.com",
                    "note": "Market size and competitive analysis"
                }
            ]
        }
        review = reviewer.review(comprehensive_draft)
        print("✅ Enhanced Reviewer Agent working")
        
        review_info = review.get('review', {})
        accuracy = review_info.get('accuracy_score', 0)
        clarity = review_info.get('clarity_score', 0)
        completeness = review_info.get('completeness_score', 0)
        print(f"   Review scores: Accuracy={accuracy}, Clarity={clarity}, Completeness={completeness}")
        print(f"   Recommendation: {review_info.get('final_recommendation', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Enhanced Reviewer Agent failed: {e}")
    
    # Test Exporter Agent
    print("\n3. Testing Exporter Agent...")
    try:
        exporter = ExporterAgent()
        sample_review = {
            "review": {
                "reviewed_draft": comprehensive_draft,
                "accuracy_score": 8.5,
                "clarity_score": 9.0,
                "completeness_score": 8.0,
                "suggestions": ["Add specific financial projections", "Include detailed risk assessment"],
                "final_recommendation": "Approve with minor edits"
            }
        }
        files = exporter.export_all(sample_review, ["json", "markdown", "html"])
        print("✅ Exporter Agent working")
        print(f"   Exported files: {list(files.keys())}")
    except Exception as e:
        print(f"❌ Exporter Agent failed: {e}")


if __name__ == "__main__":
    print("FoundryStack Enhanced Startup Blueprint Pipeline")
    print("=" * 50)
    
    # Check if GEMINI_API_KEY is set
    if not os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
        print("❌ GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required")
        print("   Set it with: $env:GEMINI_API_KEY='your_key_here'")
        sys.exit(1)
    
    # Test individual agents first
    test_enhanced_individual_agents()
    
    # Test complete enhanced pipeline
    print("\n" + "=" * 60)
    print("Testing Enhanced Startup Blueprint Pipeline")
    print("=" * 60)
    
    try:
        asyncio.run(test_startup_blueprint_pipeline())
        print("\n✅ All enhanced tests completed!")
    except Exception as e:
        print(f"\n❌ Enhanced pipeline test failed: {e}")
