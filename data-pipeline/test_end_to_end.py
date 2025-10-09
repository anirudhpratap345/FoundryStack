"""
End-to-end test of the blueprint generation pipeline
Tests that different industries get different blueprints
"""

import requests
import json
from datetime import datetime

PIPELINE_URL = "http://localhost:8015"

def test_blueprint(query: str, industry: str):
    """Test blueprint generation for a specific query"""
    print(f"\n{'='*60}")
    print(f"Testing: {industry.upper()}")
    print(f"Query: {query}")
    print(f"{'='*60}")
    
    try:
        # Generate blueprint
        response = requests.post(
            f"{PIPELINE_URL}/generate",
            json={"query": query},
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None
        
        result = response.json()
        draft = result.get("draft", {})
        
        # Extract key information
        title = draft.get("title", "No title")
        summary = draft.get("summary", "No summary")[:200]
        sections = draft.get("sections", [])
        
        print(f"\n✅ Blueprint Generated:")
        print(f"   Title: {title}")
        print(f"   Summary: {summary}...")
        print(f"   Sections ({len(sections)}):")
        for i, section in enumerate(sections[:5], 1):
            heading = section.get("heading", "No heading")
            print(f"      {i}. {heading}")
        if len(sections) > 5:
            print(f"      ... and {len(sections) - 5} more")
        
        return result
        
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def main():
    """Run end-to-end tests"""
    print("🚀 End-to-End Pipeline Test")
    print(f"Time: {datetime.now().isoformat()}")
    print(f"Pipeline: {PIPELINE_URL}")
    
    # Check health
    try:
        health = requests.get(f"{PIPELINE_URL}/health").json()
        print(f"\n📊 Pipeline Health:")
        print(f"   Status: {health.get('status')}")
        print(f"   Agents: {json.dumps(health.get('agents', {}), indent=6)}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test different industries
    tests = [
        ("Build a comprehensive fintech startup for payment processing", "Fintech"),
        ("Build a healthcare AI platform for patient diagnosis", "Healthcare"),
        ("Build an ecommerce marketplace for handmade crafts", "Ecommerce"),
    ]
    
    results = []
    for query, industry in tests:
        result = test_blueprint(query, industry)
        if result:
            results.append((industry, result))
    
    # Compare results
    print(f"\n\n{'='*60}")
    print("📊 COMPARISON: Are blueprints different?")
    print(f"{'='*60}\n")
    
    if len(results) < 2:
        print("❌ Not enough results to compare")
        return
    
    for i in range(len(results)):
        for j in range(i + 1, len(results)):
            industry1, result1 = results[i]
            industry2, result2 = results[j]
            
            title1 = result1.get("draft", {}).get("title", "")
            title2 = result2.get("draft", {}).get("title", "")
            
            sections1 = [s.get("heading", "") for s in result1.get("draft", {}).get("sections", [])]
            sections2 = [s.get("heading", "") for s in result2.get("draft", {}).get("sections", [])]
            
            print(f"Comparing: {industry1} vs {industry2}")
            print(f"  Titles: {title1 == title2 and '❌ SAME' or '✅ DIFFERENT'}")
            print(f"    - {industry1}: {title1}")
            print(f"    - {industry2}: {title2}")
            
            # Check section overlap
            common_sections = set(sections1) & set(sections2)
            overlap_pct = len(common_sections) / max(len(sections1), len(sections2)) * 100 if sections1 or sections2 else 0
            print(f"  Section overlap: {overlap_pct:.1f}% ({len(common_sections)}/{max(len(sections1), len(sections2))})")
            
            if overlap_pct < 50:
                print(f"  ✅ Blueprints are DIFFERENT (good!)")
            else:
                print(f"  ❌ Blueprints are TOO SIMILAR (needs improvement)")
            print()
    
    print("\n🎉 End-to-end test complete!")

if __name__ == "__main__":
    main()

