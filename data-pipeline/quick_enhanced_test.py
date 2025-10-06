"""
Quick Enhanced Pipeline Test

Quick test to demonstrate the enhanced startup blueprint generation.
"""

import sys
import os
import json

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from writer_agent import WriterAgent
from reviewer_agent import ReviewerAgent


def quick_test():
    """Quick test of enhanced agents"""
    print("🚀 Quick Enhanced Pipeline Test")
    print("=" * 40)
    
    # Test with a comprehensive startup query
    query = "Create a comprehensive startup blueprint for an AI-powered SaaS platform that helps restaurants optimize their operations, reduce food waste, and increase profitability through predictive analytics and automated inventory management"
    
    # Sample context (simulating retrieved documents)
    contexts = [
        {
            "content": "Restaurant industry faces 30% food waste costing $162 billion annually. AI-powered solutions can reduce waste by 40-60% through predictive analytics, demand forecasting, and automated inventory management. Key technologies include machine learning algorithms, IoT sensors, and real-time data processing.",
            "source": "https://restaurant-tech-guide.com",
            "score": 0.95
        },
        {
            "content": "SaaS market for restaurants is $4.2 billion globally, growing at 15% CAGR. Key players include Toast ($2.7B valuation), Square ($100B+ market cap), and Lightspeed. Target market: 660,000 restaurants in US, 15.8 million globally. Average restaurant spends $2,000-5,000/month on tech solutions.",
            "source": "https://restaurant-saas-market.com",
            "score": 0.92
        },
        {
            "content": "Restaurant tech stack typically includes POS systems, inventory management, staff scheduling, customer relationship management, and analytics platforms. Integration challenges include data silos, real-time synchronization, and user adoption. Cloud-based solutions with API-first architecture are preferred.",
            "source": "https://restaurant-tech-architecture.com",
            "score": 0.88
        }
    ]
    
    print(f"Query: {query[:80]}...")
    print(f"Context items: {len(contexts)}")
    
    # Initialize agents
    print("\n1. Initializing enhanced agents...")
    try:
        writer = WriterAgent()
        reviewer = ReviewerAgent()
        print("✅ Agents initialized")
    except Exception as e:
        print(f"❌ Failed: {e}")
        return
    
    # Test Writer Agent
    print("\n2. Testing enhanced Writer Agent...")
    try:
        draft = writer.write(query, contexts)
        draft_content = draft.get('draft', {})
        
        print("✅ Draft generated successfully")
        print(f"   Title: {draft_content.get('title', 'N/A')}")
        print(f"   Summary length: {len(draft_content.get('summary', ''))} chars")
        print(f"   Sections: {len(draft_content.get('sections', []))}")
        
        # Show section details
        sections = draft_content.get('sections', [])
        if sections:
            print("   Section breakdown:")
            for i, section in enumerate(sections, 1):
                heading = section.get('heading', f'Section {i}')
                content_length = len(section.get('content', ''))
                print(f"     {i}. {heading} ({content_length} chars)")
        
        print(f"   References: {len(draft_content.get('references', []))}")
        
    except Exception as e:
        print(f"❌ Writer failed: {e}")
        return
    
    # Test Reviewer Agent
    print("\n3. Testing enhanced Reviewer Agent...")
    try:
        review = reviewer.review(draft.get('draft', {}))
        review_info = review.get('review', {})
        
        accuracy = review_info.get('accuracy_score', 0)
        clarity = review_info.get('clarity_score', 0)
        completeness = review_info.get('completeness_score', 0)
        recommendation = review_info.get('final_recommendation', 'N/A')
        
        print("✅ Review completed successfully")
        print(f"   📊 Scores:")
        print(f"     Accuracy: {accuracy}/10 {'🟢' if accuracy >= 8 else '🟡' if accuracy >= 6 else '🔴'}")
        print(f"     Clarity: {clarity}/10 {'🟢' if clarity >= 8 else '🟡' if clarity >= 6 else '🔴'}")
        print(f"     Completeness: {completeness}/10 {'🟢' if completeness >= 8 else '🟡' if completeness >= 6 else '🔴'}")
        print(f"     Recommendation: {recommendation}")
        
        # Show suggestions
        suggestions = review_info.get('suggestions', [])
        if suggestions:
            print(f"   💡 Suggestions ({len(suggestions)}):")
            for i, suggestion in enumerate(suggestions[:3], 1):
                print(f"     {i}. {suggestion}")
            if len(suggestions) > 3:
                print(f"     ... and {len(suggestions) - 3} more")
        
        # Overall quality
        overall_score = (accuracy + clarity + completeness) / 3
        print(f"   🎯 Overall Quality: {overall_score:.1f}/10")
        
        if overall_score >= 8:
            print("   🎉 EXCELLENT quality blueprint!")
        elif overall_score >= 6:
            print("   👍 GOOD quality with room for improvement")
        else:
            print("   ⚠️  NEEDS IMPROVEMENT")
            
    except Exception as e:
        print(f"❌ Reviewer failed: {e}")
        return
    
    print("\n✅ Enhanced pipeline test completed successfully!")


if __name__ == "__main__":
    # Check if GEMINI_API_KEY is set
    if not os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
        print("❌ GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required")
        print("   Set it with: $env:GEMINI_API_KEY='your_key_here'")
        sys.exit(1)
    
    quick_test()
