#!/usr/bin/env python3
"""
Complete FoundryStack AI Pipeline Test
Tests: Retriever Agent → Analyst Agent → Writer Agent
"""

import requests
import json
import time
from datetime import datetime

# Service URLs
RETRIEVER_URL = "http://localhost:8000"
ANALYST_URL = "http://localhost:8002"
WRITER_URL = "http://localhost:8003"

def test_service_health(url, service_name):
    """Test if a service is healthy"""
    try:
        response = requests.get(f"{url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {service_name}: {data.get('status', 'unknown')}")
            return True
        else:
            print(f"❌ {service_name}: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {service_name}: {str(e)}")
        return False

def test_retriever_agent():
    """Test Retriever Agent"""
    print("\n🔍 Testing Retriever Agent...")
    
    test_query = "AI-powered fintech startup for automated trading"
    
    try:
        response = requests.post(f"{RETRIEVER_URL}/enrich", 
                               json={"query": test_query}, 
                               timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retriever Agent: Enriched query in {data.get('processing_time', 0):.3f}s")
            print(f"   Enriched Query: {data.get('enriched_query', 'N/A')[:100]}...")
            return data
        else:
            print(f"❌ Retriever Agent: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Retriever Agent: {str(e)}")
        return None

def test_analyst_agent(retriever_output):
    """Test Analyst Agent with Retriever output"""
    print("\n📊 Testing Analyst Agent...")
    
    if not retriever_output:
        print("❌ Analyst Agent: No retriever output to analyze")
        return None
    
    try:
        # Prepare analysis request
        analysis_request = {
            "idea": "AI-powered fintech startup for automated trading",
            "context": retriever_output.get('context', {}),
            "enriched_query": retriever_output.get('enriched_query', ''),
            "confidence": retriever_output.get('confidence', 0.8)
        }
        
        response = requests.post(f"{ANALYST_URL}/analyze", 
                               json=analysis_request, 
                               timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Analyst Agent: Analysis completed in {data.get('processing_time', 0):.3f}s")
            print(f"   Problem Analysis: {data.get('structured_analysis', {}).get('problem_analysis', {}).get('core_problem', 'N/A')[:100]}...")
            return data
        else:
            print(f"❌ Analyst Agent: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Analyst Agent: {str(e)}")
        return None

def test_writer_agent(analyst_output):
    """Test Writer Agent with Analyst output"""
    print("\n✍️ Testing Writer Agent...")
    
    if not analyst_output:
        print("❌ Writer Agent: No analyst output to write about")
        return None
    
    try:
        # Prepare writer request
        writer_request = {
            "idea": "AI-powered fintech startup for automated trading",
            "structured_analysis": analyst_output.get('structured_analysis', {}),
            "user_context": {
                "audience": "founders",
                "format": "comprehensive"
            }
        }
        
        response = requests.post(f"{WRITER_URL}/write", 
                               json=writer_request, 
                               timeout=20)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Writer Agent: Content generated in {data.get('processing_time', 0):.3f}s")
            print(f"   Founder Report: {len(data.get('founder_report', ''))} characters")
            print(f"   One-Pager: {len(data.get('one_pager', ''))} characters")
            print(f"   Pitch Ready: {len(data.get('pitch_ready', ''))} characters")
            print(f"   Tweet: {len(data.get('tweet', ''))} characters")
            return data
        else:
            print(f"❌ Writer Agent: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Writer Agent: {str(e)}")
        return None

def display_sample_output(writer_output):
    """Display sample output from Writer Agent"""
    if not writer_output:
        return
    
    print("\n" + "="*80)
    print("📄 SAMPLE OUTPUT - FOUNDER REPORT")
    print("="*80)
    print(writer_output.get('founder_report', 'No founder report available')[:1000] + "...")
    
    print("\n" + "="*80)
    print("📱 SAMPLE OUTPUT - TWEET")
    print("="*80)
    print(writer_output.get('tweet', 'No tweet available'))

def main():
    """Run complete pipeline test"""
    print("🧪 FoundryStack Complete AI Pipeline Test")
    print("="*60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test service health
    print("\n🔍 Checking service health...")
    retriever_healthy = test_service_health(RETRIEVER_URL, "Retriever Agent")
    analyst_healthy = test_service_health(ANALYST_URL, "Analyst Agent")
    writer_healthy = test_service_health(WRITER_URL, "Writer Agent")
    
    if not all([retriever_healthy, analyst_healthy, writer_healthy]):
        print("\n❌ Some services are not healthy. Please start all services first.")
        return
    
    # Test complete pipeline
    print("\n🚀 Starting complete pipeline test...")
    
    # Step 1: Retriever Agent
    retriever_output = test_retriever_agent()
    if not retriever_output:
        print("\n❌ Pipeline failed at Retriever Agent")
        return
    
    # Step 2: Analyst Agent
    analyst_output = test_analyst_agent(retriever_output)
    if not analyst_output:
        print("\n❌ Pipeline failed at Analyst Agent")
        return
    
    # Step 3: Writer Agent
    writer_output = test_writer_agent(analyst_output)
    if not writer_output:
        print("\n❌ Pipeline failed at Writer Agent")
        return
    
    # Display results
    print("\n" + "="*60)
    print("🎉 COMPLETE PIPELINE TEST SUCCESSFUL!")
    print("="*60)
    
    display_sample_output(writer_output)
    
    print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n✅ All agents are working correctly!")

if __name__ == "__main__":
    main()
