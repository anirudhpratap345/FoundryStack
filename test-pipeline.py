#!/usr/bin/env python3
"""
Test script for the complete Retriever → Analyst → AI Generation pipeline
"""

import requests
import json
import time

def test_retriever_agent():
    """Test the Retriever Agent"""
    print("🔍 Testing Retriever Agent...")
    
    url = "http://localhost:8000/enrich"
    payload = {
        "query": "create a blueprint for AI fintech startup that helps small businesses manage their finances"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        print(f"✅ Retriever Agent: Success")
        print(f"   Industry: {result['analysis']['industry']}")
        print(f"   Confidence: {result['confidence']:.1%}")
        print(f"   Processing Time: {result['processing_time']:.3f}s")
        
        return result
    except Exception as e:
        print(f"❌ Retriever Agent failed: {e}")
        return None

def test_analyst_agent(retriever_result):
    """Test the Analyst Agent"""
    print("\n🔍 Testing Analyst Agent...")
    
    if not retriever_result:
        print("❌ No retriever result to analyze")
        return None
    
    url = "http://localhost:8002/analyze"
    
    try:
        response = requests.post(url, json=retriever_result, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        print(f"✅ Analyst Agent: Success")
        print(f"   Query: {result['query']}")
        print(f"   Confidence: {result['confidence']:.1%}")
        print(f"   Processing Time: {result['processing_time']:.3f}s")
        
        # Show structured analysis
        analysis = result['analysis']
        print(f"\n📊 Structured Analysis:")
        print(f"   Core Problem: {analysis['problem_analysis']['core_problem']}")
        print(f"   Target Audience: {analysis['problem_analysis']['target_audience']}")
        print(f"   Business Model: {analysis['business_analysis']['business_model']}")
        print(f"   Risk Score: {analysis['risk_analysis']['risk_score']}/10")
        print(f"   Timeline: {analysis['timeline_estimate']}")
        
        return result
    except Exception as e:
        print(f"❌ Analyst Agent failed: {e}")
        return None

def test_full_pipeline():
    """Test the complete pipeline"""
    print("🚀 Testing Complete Pipeline: Retriever → Analyst")
    print("=" * 60)
    
    # Step 1: Test Retriever Agent
    retriever_result = test_retriever_agent()
    
    if not retriever_result:
        print("\n❌ Pipeline failed at Retriever Agent")
        return False
    
    # Step 2: Test Analyst Agent
    analyst_result = test_analyst_agent(retriever_result)
    
    if not analyst_result:
        print("\n❌ Pipeline failed at Analyst Agent")
        return False
    
    # Pipeline Success
    print("\n🎉 Pipeline Success!")
    print("=" * 60)
    print("✅ Retriever Agent: Context enrichment completed")
    print("✅ Analyst Agent: Structured analysis completed")
    print(f"📊 Total Processing Time: {retriever_result['processing_time'] + analyst_result['processing_time']:.3f}s")
    
    return True

def main():
    """Main test function"""
    print("🧪 FoundryStack AI Pipeline Test")
    print("=" * 60)
    
    # Check if services are running
    print("🔍 Checking service health...")
    
    # Check Retriever Agent
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Retriever Agent: Running")
        else:
            print("❌ Retriever Agent: Not responding")
            return
    except:
        print("❌ Retriever Agent: Not running")
        return
    
    # Check Analyst Agent
    try:
        response = requests.get("http://localhost:8002/health", timeout=5)
        if response.status_code == 200:
            print("✅ Analyst Agent: Running")
        else:
            print("❌ Analyst Agent: Not responding")
            return
    except:
        print("❌ Analyst Agent: Not running")
        return
    
    print("\n🚀 Starting pipeline test...")
    
    # Run the full pipeline test
    success = test_full_pipeline()
    
    if success:
        print("\n🎉 All tests passed! The pipeline is working correctly.")
    else:
        print("\n❌ Pipeline test failed. Check the logs above.")

if __name__ == "__main__":
    main()
