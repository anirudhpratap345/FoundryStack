from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import json
import asyncio
from datetime import datetime

app = FastAPI(
    title="FoundryStack Writer Agent",
    description="Converts structured analysis into founder-friendly content formats",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class WriterRequest(BaseModel):
    idea: str
    structured_analysis: Dict[str, Any]
    user_context: Optional[Dict[str, Any]] = None

class WriterResponse(BaseModel):
    founder_report: str
    one_pager: str
    pitch_ready: str
    tweet: str
    processing_time: float
    timestamp: str

class WriterAgent:
    def __init__(self):
        self.templates = {
            "fintech": {
                "founder_report": self._generate_fintech_founder_report,
                "one_pager": self._generate_fintech_one_pager,
                "pitch_ready": self._generate_fintech_pitch,
                "tweet": self._generate_fintech_tweet
            },
            "healthcare": {
                "founder_report": self._generate_healthcare_founder_report,
                "one_pager": self._generate_healthcare_one_pager,
                "pitch_ready": self._generate_healthcare_pitch,
                "tweet": self._generate_healthcare_tweet
            },
            "general": {
                "founder_report": self._generate_general_founder_report,
                "one_pager": self._generate_general_one_pager,
                "pitch_ready": self._generate_general_pitch,
                "tweet": self._generate_general_tweet
            }
        }
    
    def detect_industry(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Detect industry based on idea and analysis content"""
        idea_lower = idea.lower()
        analysis_text = json.dumps(analysis).lower()
        
        if any(keyword in idea_lower for keyword in ['fintech', 'finance', 'banking', 'payment', 'crypto', 'trading']):
            return 'fintech'
        elif any(keyword in idea_lower for keyword in ['healthcare', 'medical', 'health', 'patient', 'doctor', 'clinic']):
            return 'healthcare'
        else:
            return 'general'
    
    def safe_get(self, data: Any, key: str, default: Any = None) -> Any:
        """Safely get value from data, handling both dict and list cases"""
        if isinstance(data, dict):
            return data.get(key, default)
        elif isinstance(data, list) and len(data) > 0:
            return data[0] if key == 0 else default
        return default
    
    async def generate_content(self, request: WriterRequest) -> WriterResponse:
        """Generate all content formats based on structured analysis"""
        start_time = datetime.now()
        
        try:
            # Detect industry
            industry = self.detect_industry(request.idea, request.structured_analysis)
            print(f"DEBUG: Industry detected: {industry}")
            
            # Get appropriate templates
            templates = self.templates.get(industry, self.templates['general'])
            print(f"DEBUG: Templates loaded for {industry}")
            
            # Generate all content formats
            print("DEBUG: Generating founder report...")
            founder_report = await templates['founder_report'](request.idea, request.structured_analysis)
            print("DEBUG: Founder report generated")
            
            print("DEBUG: Generating one-pager...")
            one_pager = await templates['one_pager'](request.idea, request.structured_analysis)
            print("DEBUG: One-pager generated")
            
            print("DEBUG: Generating pitch...")
            pitch_ready = await templates['pitch_ready'](request.idea, request.structured_analysis)
            print("DEBUG: Pitch generated")
            
            print("DEBUG: Generating tweet...")
            tweet = await templates['tweet'](request.idea, request.structured_analysis)
            print("DEBUG: Tweet generated")
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return WriterResponse(
                founder_report=founder_report,
                one_pager=one_pager,
                pitch_ready=pitch_ready,
                tweet=tweet,
                processing_time=processing_time,
                timestamp=datetime.now().isoformat()
            )
        except Exception as e:
            print(f"DEBUG: Error in generate_content: {str(e)}")
            print(f"DEBUG: Error type: {type(e)}")
            import traceback
            traceback.print_exc()
            raise e
    
    # Fintech Templates
    async def _generate_fintech_founder_report(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate detailed fintech founder report"""
        return f"""# 🚀 {idea} - Founder Report

## Executive Summary
{idea} represents a significant opportunity in the fintech space. Our analysis reveals a 7/10 complexity solution with strong market potential.

## Problem Analysis
**Core Problem**: Financial processes are inefficient and error-prone
**Target Audience**: Financial institutions and fintech companies
**Urgency Level**: High

## Technical Strategy
**Recommended Stack**: Next.js, Node.js, PostgreSQL, Redis
**Architecture**: Microservices with API Gateway
**Security Focus**: Bank-grade encryption and compliance

## Business Model
**Revenue Streams**: SaaS subscriptions, API usage, premium features
**Pricing Strategy**: Tiered pricing starting at $99/month
**Go-to-Market**: Direct sales to financial institutions

## Risk Assessment
**Technical Risks**: API reliability, data security, compliance
**Market Risks**: Regulatory changes, competition, market saturation
**Overall Risk Score**: 6/10

## Implementation Roadmap
1. Week 1-2: Technical architecture setup and security audit
2. Week 3-4: MVP development and testing
3. Week 5-6: Compliance review and regulatory approval
4. Week 7-8: Beta launch with select financial partners

## Success Metrics
- **User Acquisition**: 1000+ users in first 6 months
- **Revenue Target**: $100K ARR by month 12
- **Market Share**: 5% of target market within 2 years

## Next Steps
1. **Week 1-2**: Technical architecture setup and security audit
2. **Week 3-4**: MVP development and testing
3. **Week 5-6**: Compliance review and regulatory approval
4. **Week 7-8**: Beta launch with select financial partners

---
*Generated by FoundryStack Writer Agent - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*"""
    
    async def _generate_fintech_one_pager(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate concise fintech one-pager"""
        return f"""# {idea} - One-Pager

**Problem**: Financial processes are inefficient

**Solution**: {idea} - AI-powered financial automation platform

**Market**: Fintech and financial services

**Tech Stack**: Next.js, Node.js, PostgreSQL

**Business Model**: SaaS with tiered pricing

**Revenue Target**: $100K ARR by month 12

**Timeline**: 8 weeks to MVP

**Risk Level**: 6/10

**Why Now**: Growing demand for AI in finance"""
    
    async def _generate_fintech_pitch(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate fintech pitch deck summary"""
        return f"""# {idea} - Pitch Deck Summary

• **Problem**: Financial processes are inefficient
• **Solution**: {idea} - AI-powered financial automation
• **Market Size**: $50B+ fintech market
• **Tech Advantage**: Advanced AI and compliance-first approach
• **Business Model**: SaaS with recurring revenue
• **Revenue Projection**: $100K ARR by month 12
• **Execution Plan**: 8 weeks to MVP, 6 months to scale
• **Ask**: Seeking $500K seed round"""
    
    async def _generate_fintech_tweet(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate fintech tweet"""
        return f"""🚀 Just built {idea} - AI-powered financial automation that's going to disrupt the fintech space! 

Solving financial inefficiencies → SaaS platform

$100K ARR target in 12 months 🎯

#Fintech #AI #Startup #BuildInPublic"""
    
    # Healthcare Templates
    async def _generate_healthcare_founder_report(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate detailed healthcare founder report"""
        return f"""# 🏥 {idea} - Founder Report

## Executive Summary
{analysis.get('problem_analysis', {}).get('core_problem', 'Healthcare solution')} addresses critical needs in the healthcare industry. Our analysis shows a {analysis.get('problem_analysis', {}).get('complexity_score', 8)}/10 complexity solution with strong regulatory compliance requirements.

## Problem Analysis
**Core Problem**: {analysis.get('problem_analysis', {}).get('core_problem', 'Healthcare processes need digital transformation')}
**Target Audience**: {analysis.get('problem_analysis', {}).get('target_audience', 'Healthcare providers and patients')}
**Urgency Level**: {analysis.get('problem_analysis', {}).get('urgency_level', 'Critical')}

## Technical Strategy
**Recommended Stack**: {analysis.get('technical_analysis', {}).get('tech_stack', 'React, Python, PostgreSQL, HIPAA-compliant infrastructure')}
**Architecture**: {analysis.get('technical_analysis', {}).get('architecture', 'Secure microservices with audit logging')}
**Compliance**: {analysis.get('technical_analysis', {}).get('compliance', 'HIPAA, SOC 2, FDA guidelines')}

## Business Model
**Revenue Streams**: {analysis.get('business_analysis', {}).get('revenue_streams', 'SaaS subscriptions, per-patient pricing, enterprise licenses')}
**Pricing Strategy**: {analysis.get('business_analysis', {}).get('pricing', 'Value-based pricing starting at $299/month')}
**Go-to-Market**: {analysis.get('business_analysis', {}).get('go_to_market', 'Direct sales to healthcare systems')}

## Risk Assessment
**Technical Risks**: {analysis.get('risk_analysis', {}).get('technical_risks', 'Data security, HIPAA compliance, system reliability')}
**Regulatory Risks**: {analysis.get('risk_analysis', {}).get('regulatory_risks', 'FDA approval, state regulations, privacy laws')}
**Overall Risk Score**: {analysis.get('risk_analysis', {}).get('overall_risk_score', 7)}/10

## Implementation Roadmap
{self._format_roadmap(analysis.get('implementation_priority', []))}

## Success Metrics
- **Provider Adoption**: {analysis.get('success_metrics', {}).get('provider_adoption', '50+ healthcare providers in first year')}
- **Patient Impact**: {analysis.get('success_metrics', {}).get('patient_impact', '10,000+ patients served')}
- **Compliance Score**: {analysis.get('success_metrics', {}).get('compliance_score', '100% HIPAA compliance')}

## Next Steps
1. **Week 1-2**: Regulatory compliance review and legal framework
2. **Week 3-4**: Security architecture and HIPAA implementation
3. **Week 5-6**: MVP development with audit logging
4. **Week 7-8**: Pilot program with select healthcare providers

---
*Generated by FoundryStack Writer Agent - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*"""
    
    async def _generate_healthcare_one_pager(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate concise healthcare one-pager"""
        return f"""# {idea} - One-Pager

**Problem**: {analysis.get('problem_analysis', {}).get('core_problem', 'Healthcare processes need digital transformation')}

**Solution**: {idea} - AI-powered healthcare platform

**Market**: {analysis.get('business_analysis', {}).get('target_market', 'Healthcare providers and patients')}

**Tech Stack**: {analysis.get('technical_analysis', {}).get('tech_stack', 'React, Python, PostgreSQL, HIPAA-compliant')}

**Business Model**: {analysis.get('business_analysis', {}).get('business_model', 'SaaS with value-based pricing')}

**Revenue Target**: {analysis.get('success_metrics', {}).get('revenue_target', '$500K ARR by month 12')}

**Timeline**: {analysis.get('success_metrics', {}).get('timeline', '8 weeks to MVP')}

**Risk Level**: {analysis.get('risk_analysis', {}).get('overall_risk_score', 7)}/10

**Why Now**: {analysis.get('opportunity_analysis', {}).get('market_opportunity', 'Digital health transformation acceleration')}"""
    
    async def _generate_healthcare_pitch(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate healthcare pitch deck summary"""
        return f"""# {idea} - Pitch Deck Summary

• **Problem**: {analysis.get('problem_analysis', {}).get('core_problem', 'Healthcare processes need digital transformation')}
• **Solution**: {idea} - AI-powered healthcare platform
• **Market Size**: {analysis.get('business_analysis', {}).get('market_size', '$200B+ digital health market')}
• **Tech Advantage**: {analysis.get('technical_analysis', {}).get('competitive_advantage', 'HIPAA-compliant AI with audit logging')}
• **Business Model**: {analysis.get('business_analysis', {}).get('business_model', 'SaaS with value-based pricing')}
• **Revenue Projection**: {analysis.get('success_metrics', {}).get('revenue_target', '$500K ARR by month 12')}
• **Execution Plan**: {analysis.get('success_metrics', {}).get('timeline', '8 weeks to MVP, 12 months to scale')}
• **Ask**: {analysis.get('business_analysis', {}).get('funding_ask', 'Seeking $1M seed round')}"""
    
    async def _generate_healthcare_tweet(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate healthcare tweet"""
        return f"""🏥 Just built {idea} - AI-powered healthcare platform that's going to transform patient care! 

{analysis.get('problem_analysis', {}).get('core_problem', 'Solving healthcare inefficiencies')} → {analysis.get('business_analysis', {}).get('business_model', 'HIPAA-compliant SaaS')}

{analysis.get('success_metrics', {}).get('revenue_target', '$500K ARR target')} in 12 months 🎯

#Healthcare #AI #DigitalHealth #Startup #BuildInPublic"""
    
    # General Templates
    async def _generate_general_founder_report(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate detailed general founder report"""
        return f"""# 🚀 {idea} - Founder Report

## Executive Summary
{analysis.get('problem_analysis', {}).get('core_problem', 'Innovative solution')} represents a significant opportunity in the market. Our analysis reveals a {analysis.get('problem_analysis', {}).get('complexity_score', 6)}/10 complexity solution with strong growth potential.

## Problem Analysis
**Core Problem**: {analysis.get('problem_analysis', {}).get('core_problem', 'Market inefficiency needs addressing')}
**Target Audience**: {analysis.get('problem_analysis', {}).get('target_audience', 'Target market segment')}
**Urgency Level**: {analysis.get('problem_analysis', {}).get('urgency_level', 'Medium')}

## Technical Strategy
**Recommended Stack**: {analysis.get('technical_analysis', {}).get('tech_stack', 'Modern web stack with cloud infrastructure')}
**Architecture**: {analysis.get('technical_analysis', {}).get('architecture', 'Scalable microservices architecture')}
**Performance**: {analysis.get('technical_analysis', {}).get('performance', 'High-performance, low-latency system')}

## Business Model
**Revenue Streams**: {analysis.get('business_analysis', {}).get('revenue_streams', 'Multiple revenue streams including subscriptions and usage-based pricing')}
**Pricing Strategy**: {analysis.get('business_analysis', {}).get('pricing', 'Competitive pricing starting at $49/month')}
**Go-to-Market**: {analysis.get('business_analysis', {}).get('go_to_market', 'Multi-channel approach including digital marketing')}

## Risk Assessment
**Technical Risks**: {analysis.get('risk_analysis', {}).get('technical_risks', 'Scalability, performance, security')}
**Market Risks**: {analysis.get('risk_analysis', {}).get('market_risks', 'Competition, market changes, customer adoption')}
**Overall Risk Score**: {analysis.get('risk_analysis', {}).get('overall_risk_score', 5)}/10

## Implementation Roadmap
{self._format_roadmap(analysis.get('implementation_priority', []))}

## Success Metrics
- **User Growth**: {analysis.get('success_metrics', {}).get('user_growth', '1000+ users in first 6 months')}
- **Revenue Target**: {analysis.get('success_metrics', {}).get('revenue_target', '$250K ARR by month 12')}
- **Market Share**: {analysis.get('success_metrics', {}).get('market_share', '2% of target market within 2 years')}

## Next Steps
1. **Week 1-2**: Technical architecture and development setup
2. **Week 3-4**: MVP development and testing
3. **Week 5-6**: User feedback and iteration
4. **Week 7-8**: Launch and marketing campaign

---
*Generated by FoundryStack Writer Agent - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*"""
    
    async def _generate_general_one_pager(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate concise general one-pager"""
        return f"""# {idea} - One-Pager

**Problem**: {analysis.get('problem_analysis', {}).get('core_problem', 'Market inefficiency needs addressing')}

**Solution**: {idea} - Innovative solution platform

**Market**: {analysis.get('business_analysis', {}).get('target_market', 'Target market segment')}

**Tech Stack**: {analysis.get('technical_analysis', {}).get('tech_stack', 'Modern web stack with cloud infrastructure')}

**Business Model**: {analysis.get('business_analysis', {}).get('business_model', 'SaaS with multiple revenue streams')}

**Revenue Target**: {analysis.get('success_metrics', {}).get('revenue_target', '$250K ARR by month 12')}

**Timeline**: {analysis.get('success_metrics', {}).get('timeline', '8 weeks to MVP')}

**Risk Level**: {analysis.get('risk_analysis', {}).get('overall_risk_score', 5)}/10

**Why Now**: {analysis.get('opportunity_analysis', {}).get('market_opportunity', 'Market timing and technology readiness')}"""
    
    async def _generate_general_pitch(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate general pitch deck summary"""
        return f"""# {idea} - Pitch Deck Summary

• **Problem**: {analysis.get('problem_analysis', {}).get('core_problem', 'Market inefficiency needs addressing')}
• **Solution**: {idea} - Innovative solution platform
• **Market Size**: {analysis.get('business_analysis', {}).get('market_size', '$10B+ target market')}
• **Tech Advantage**: {analysis.get('technical_analysis', {}).get('competitive_advantage', 'Modern tech stack with scalability')}
• **Business Model**: {analysis.get('business_analysis', {}).get('business_model', 'SaaS with multiple revenue streams')}
• **Revenue Projection**: {analysis.get('success_metrics', {}).get('revenue_target', '$250K ARR by month 12')}
• **Execution Plan**: {analysis.get('success_metrics', {}).get('timeline', '8 weeks to MVP, 6 months to scale')}
• **Ask**: {analysis.get('business_analysis', {}).get('funding_ask', 'Seeking $300K seed round')}"""
    
    async def _generate_general_tweet(self, idea: str, analysis: Dict[str, Any]) -> str:
        """Generate general tweet"""
        return f"""🚀 Just built {idea} - innovative solution that's going to disrupt the market! 

{analysis.get('problem_analysis', {}).get('core_problem', 'Solving market inefficiencies')} → {analysis.get('business_analysis', {}).get('business_model', 'SaaS platform')}

{analysis.get('success_metrics', {}).get('revenue_target', '$250K ARR target')} in 12 months 🎯

#Startup #Innovation #Tech #BuildInPublic"""
    
    def _format_roadmap(self, roadmap: List[str]) -> str:
        """Format implementation roadmap"""
        if not roadmap:
            return "• Week 1-2: Technical setup and architecture\n• Week 3-4: MVP development\n• Week 5-6: Testing and iteration\n• Week 7-8: Launch and marketing"
        
        formatted = []
        for i, step in enumerate(roadmap, 1):
            formatted.append(f"• Week {i*2-1}-{i*2}: {step}")
        return "\n".join(formatted)

# Initialize Writer Agent
writer_agent = WriterAgent()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "templates": len(writer_agent.templates),
        "supported_industries": list(writer_agent.templates.keys())
    }

@app.post("/write", response_model=WriterResponse)
async def write_content(request: WriterRequest):
    """Generate founder-friendly content in multiple formats"""
    try:
        response = await writer_agent.generate_content(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")

@app.post("/write/simple")
async def write_simple_content(idea: str, analysis: dict):
    """Simple endpoint for quick content generation"""
    try:
        request = WriterRequest(idea=idea, structured_analysis=analysis)
        response = await writer_agent.generate_content(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
