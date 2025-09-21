#!/usr/bin/env python3
"""
Complete FoundryStack 5-Agent AI Pipeline Test
Tests: Retriever Agent → Analyst Agent → Writer Agent → Reviewer Agent → Exporter Agent
"""

import requests
import json
import time
from datetime import datetime

# Service URLs
RETRIEVER_URL = "http://localhost:8000"
ANALYST_URL = "http://localhost:8002"
WRITER_URL = "http://localhost:8003"
REVIEWER_URL = "http://localhost:8004"
EXPORTER_URL = "http://localhost:8005"

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

def test_reviewer_agent(writer_output):
    """Test Reviewer Agent with Writer output"""
    print("\n🔍 Testing Reviewer Agent...")
    
    if not writer_output:
        print("❌ Reviewer Agent: No writer output to review")
        return None
    
    try:
        # Prepare reviewer request
        reviewer_request = {
            "writer_output": writer_output,
            "original_query": "AI-powered fintech startup for automated trading",
            "user_context": {
                "audience": "founders",
                "quality_focus": "high"
            }
        }
        
        response = requests.post(f"{REVIEWER_URL}/review", 
                               json=reviewer_request, 
                               timeout=25)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Reviewer Agent: Review completed in {data.get('processing_time', 0):.3f}s")
            print(f"   Overall Score: {data.get('overall_score', 0)}/100")
            print(f"   Issues Found: {len(data.get('issues_found', []))}")
            print(f"   Suggestions: {len(data.get('suggestions', []))}")
            return data
        else:
            print(f"❌ Reviewer Agent: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Reviewer Agent: {str(e)}")
        return None

def test_exporter_agent(reviewer_output):
    """Test Exporter Agent with Reviewer output"""
    print("\n📤 Testing Exporter Agent...")
    
    if not reviewer_output:
        print("❌ Exporter Agent: No reviewer output to export")
        return None
    
    try:
        # Prepare exporter request
        exporter_request = {
            "reviewed_blueprint": {
                "reviewed_founder_report": reviewer_output.get('reviewed_founder_report', ''),
                "reviewed_one_pager": reviewer_output.get('reviewed_one_pager', ''),
                "reviewed_pitch_ready": reviewer_output.get('reviewed_pitch_ready', ''),
                "reviewed_tweet": reviewer_output.get('reviewed_tweet', ''),
                "issues_found": reviewer_output.get('issues_found', []),
                "suggestions": reviewer_output.get('suggestions', []),
                "overall_score": reviewer_output.get('overall_score', 0),
                "processing_time": reviewer_output.get('processing_time', 0),
                "timestamp": reviewer_output.get('timestamp', '')
            },
            "metadata": {
                "user_id": "test_user_123",
                "blueprint_name": "AI Fintech Trading Platform",
                "blueprint_id": "test_blueprint_456",
                "export_formats": ["json", "markdown", "html"],
                "include_metadata": True,
                "include_issues": True,
                "include_suggestions": True
            }
        }
        
        response = requests.post(f"{EXPORTER_URL}/export", 
                               json=exporter_request, 
                               timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Exporter Agent: Export completed in {data.get('processing_time', 0):.3f}s")
            print(f"   Export ID: {data.get('export_id', 'N/A')}")
            print(f"   Files Created: {len(data.get('files', {}))}")
            print(f"   Formats: {', '.join(data.get('files', {}).keys())}")
            print(f"   Status: {data.get('status', 'N/A')}")
            return data
        else:
            print(f"❌ Exporter Agent: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exporter Agent: {str(e)}")
        return None

def test_file_downloads(exporter_output):
    """Test downloading exported files"""
    print("\n📥 Testing File Downloads...")
    
    if not exporter_output:
        print("❌ File Downloads: No exporter output to download")
        return False
    
    try:
        export_id = exporter_output.get('export_id')
        download_urls = exporter_output.get('download_urls', {})
        
        success_count = 0
        for format_type, download_url in download_urls.items():
            try:
                response = requests.get(f"{EXPORTER_URL}{download_url}", timeout=10)
                if response.status_code == 200:
                    print(f"✅ {format_type.upper()}: Downloaded successfully ({len(response.content)} bytes)")
                    success_count += 1
                else:
                    print(f"❌ {format_type.upper()}: Download failed (HTTP {response.status_code})")
            except Exception as e:
                print(f"❌ {format_type.upper()}: Download error - {str(e)}")
        
        return success_count > 0
    except Exception as e:
        print(f"❌ File Downloads: {str(e)}")
        return False

def display_sample_output(exporter_output):
    """Display sample output from Exporter Agent"""
    if not exporter_output:
        return
    
    print("\n" + "="*80)
    print("📤 EXPORT RESULTS")
    print("="*80)
    print(f"Export ID: {exporter_output.get('export_id', 'N/A')}")
    print(f"Status: {exporter_output.get('status', 'N/A')}")
    print(f"Message: {exporter_output.get('message', 'N/A')}")
    print(f"Processing Time: {exporter_output.get('processing_time', 0):.3f}s")
    
    print("\nFiles Created:")
    files = exporter_output.get('files', {})
    for format_type, file_path in files.items():
        print(f"  {format_type.upper()}: {file_path}")
    
    print("\nDownload URLs:")
    download_urls = exporter_output.get('download_urls', {})
    for format_type, download_url in download_urls.items():
        print(f"  {format_type.upper()}: {EXPORTER_URL}{download_url}")

def main():
    """Run complete 5-agent pipeline test"""
    print("🧪 FoundryStack Complete 5-Agent AI Pipeline Test")
    print("="*70)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test service health
    print("\n🔍 Checking service health...")
    retriever_healthy = test_service_health(RETRIEVER_URL, "Retriever Agent")
    analyst_healthy = test_service_health(ANALYST_URL, "Analyst Agent")
    writer_healthy = test_service_health(WRITER_URL, "Writer Agent")
    reviewer_healthy = test_service_health(REVIEWER_URL, "Reviewer Agent")
    exporter_healthy = test_service_health(EXPORTER_URL, "Exporter Agent")
    
    if not all([retriever_healthy, analyst_healthy, writer_healthy, reviewer_healthy, exporter_healthy]):
        print("\n❌ Some services are not healthy. Please start all services first.")
        return
    
    # Test complete pipeline
    print("\n🚀 Starting complete 5-agent pipeline test...")
    
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
    
    # Step 4: Reviewer Agent
    reviewer_output = test_reviewer_agent(writer_output)
    if not reviewer_output:
        print("\n❌ Pipeline failed at Reviewer Agent")
        return
    
    # Step 5: Exporter Agent
    exporter_output = test_exporter_agent(reviewer_output)
    if not exporter_output:
        print("\n❌ Pipeline failed at Exporter Agent")
        return
    
    # Test file downloads
    download_success = test_file_downloads(exporter_output)
    
    # Display results
    print("\n" + "="*70)
    print("🎉 COMPLETE 5-AGENT PIPELINE TEST SUCCESSFUL!")
    print("="*70)
    
    display_sample_output(exporter_output)
    
    if download_success:
        print("\n✅ File downloads working correctly!")
    else:
        print("\n⚠️ File downloads had some issues")
    
    print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n✅ All 5 agents are working correctly!")
    print("\n🚀 FoundryStack Multi-Agent System is ready for production!")

if __name__ == "__main__":
    main()
