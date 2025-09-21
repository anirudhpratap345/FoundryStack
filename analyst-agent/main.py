"""
Analyst Agent - FastAPI Server
Analyzes enriched context from Retriever Agent into structured insights
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import json
import time
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Analyst Agent API",
    description="AI-powered context analysis for startup blueprint generation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ContextData(BaseModel):
    industry: str
    market_trends: List[str]
    tech_stacks: List[str]
    competitors: List[Dict[str, Any]]
    apis: List[Dict[str, Any]]
    regulations: List[str]
    market_size: Dict[str, Any]
    user_personas: List[Dict[str, Any]]
    business_models: List[str]
    challenges: List[str]
    opportunities: List[str]

class AnalysisRequest(BaseModel):
    idea: str
    context: ContextData
    enriched_query: str
    confidence: float

class ProblemAnalysis(BaseModel):
    core_problem: str
    problem_breakdown: List[str]
    target_audience: str
    market_need: str
    urgency_level: str
    complexity_score: int

class TechnicalAnalysis(BaseModel):
    recommended_tech: List[str]
    architecture_pattern: str
    scalability_approach: str
    security_considerations: List[str]
    integration_requirements: List[str]
    performance_requirements: List[str]

class BusinessAnalysis(BaseModel):
    business_model: str
    revenue_streams: List[str]
    pricing_strategy: str
    go_to_market: str
    competitive_advantage: str
    market_positioning: str

class RiskAnalysis(BaseModel):
    technical_risks: List[str]
    market_risks: List[str]
    regulatory_risks: List[str]
    operational_risks: List[str]
    mitigation_strategies: List[str]
    risk_score: int

class OpportunityAnalysis(BaseModel):
    market_opportunities: List[str]
    technology_opportunities: List[str]
    partnership_opportunities: List[str]
    expansion_opportunities: List[str]
    innovation_potential: str

class StructuredAnalysis(BaseModel):
    problem_analysis: ProblemAnalysis
    technical_analysis: TechnicalAnalysis
    business_analysis: BusinessAnalysis
    risk_analysis: RiskAnalysis
    opportunity_analysis: OpportunityAnalysis
    implementation_priority: List[str]
    success_metrics: List[str]
    timeline_estimate: str

class AnalysisResponse(BaseModel):
    structured_analysis: StructuredAnalysis
    processing_time: float
    timestamp: str

class AnalystAgent:
    def __init__(self):
        self.analysis_templates = self.initialize_analysis_templates()
        logger.info("Analyst Agent initialized")

    def initialize_analysis_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize analysis templates for different industries"""
        return {
            'fintech': {
                'core_problems': [
                    'Complex financial regulations and compliance requirements',
                    'High customer acquisition costs in competitive market',
                    'Security and fraud prevention challenges',
                    'Integration with legacy banking systems',
                    'Trust and credibility building with customers'
                ],
                'tech_patterns': [
                    'Microservices architecture for scalability',
                    'Event-driven architecture for real-time processing',
                    'API-first design for third-party integrations',
                    'Multi-tenant SaaS architecture',
                    'Blockchain integration for transparency'
                ],
                'business_models': [
                    'Transaction-based fees (2-3% per transaction)',
                    'Subscription SaaS ($99-$999/month)',
                    'Freemium with premium features',
                    'API usage-based pricing',
                    'White-label licensing'
                ],
                'risks': [
                    'Regulatory compliance violations',
                    'Data breaches and security incidents',
                    'High customer acquisition costs',
                    'Competition from established players',
                    'Technology scalability challenges'
                ]
            },
            'healthcare': {
                'core_problems': [
                    'HIPAA compliance and data privacy requirements',
                    'Integration with existing EHR systems',
                    'Provider adoption and workflow integration',
                    'Clinical validation and FDA approval',
                    'Patient trust and data security concerns'
                ],
                'tech_patterns': [
                    'HIPAA-compliant cloud architecture',
                    'FHIR-based data integration',
                    'AI/ML model deployment pipeline',
                    'Real-time monitoring and alerting',
                    'Secure patient data management'
                ],
                'business_models': [
                    'Per-consultation fees ($50-$200)',
                    'Subscription per provider ($200-$1000/month)',
                    'Outcome-based pricing',
                    'Enterprise licensing',
                    'Insurance partnerships'
                ],
                'risks': [
                    'Regulatory compliance violations',
                    'Clinical accuracy and liability',
                    'Provider adoption resistance',
                    'Data privacy breaches',
                    'Integration complexity'
                ]
            },
            'general': {
                'core_problems': [
                    'Market validation and product-market fit',
                    'Customer acquisition and retention',
                    'Technology scalability and performance',
                    'Competitive differentiation',
                    'Resource and funding constraints'
                ],
                'tech_patterns': [
                    'Modern web application architecture',
                    'Cloud-native deployment',
                    'API-first design',
                    'Microservices for scalability',
                    'DevOps and CI/CD pipeline'
                ],
                'business_models': [
                    'SaaS subscription model',
                    'Freemium with premium features',
                    'Marketplace commission',
                    'Enterprise licensing',
                    'Usage-based pricing'
                ],
                'risks': [
                    'Market competition',
                    'Technology scalability',
                    'Customer acquisition costs',
                    'Product-market fit',
                    'Resource constraints'
                ]
            }
        }

    async def analyze_context(self, request: AnalysisRequest) -> AnalysisResponse:
        """Analyze enriched context into structured insights"""
        start_time = time.time()
        
        logger.info(f"🔍 Analyst Agent: Analyzing context for idea: {request.idea}")
        
        # Extract industry from context
        industry = request.context.industry
        
        # Get analysis template for industry
        template = self.analysis_templates.get(industry, self.analysis_templates['general'])
        
        # Perform structured analysis
        analysis = await self.perform_structured_analysis(request, template)
        
        processing_time = time.time() - start_time
        
        logger.info(f"✅ Analyst Agent: Analysis completed in {processing_time:.3f}s")
        
        return AnalysisResponse(
            structured_analysis=analysis,
            processing_time=processing_time,
            timestamp=datetime.now().isoformat()
        )

    async def perform_structured_analysis(self, request: AnalysisRequest, template: Dict[str, Any]) -> StructuredAnalysis:
        """Perform comprehensive structured analysis"""
        
        # Problem Analysis
        problem_analysis = self.analyze_problem(request, template)
        
        # Technical Analysis
        technical_analysis = self.analyze_technical(request, template)
        
        # Business Analysis
        business_analysis = self.analyze_business(request, template)
        
        # Risk Analysis
        risk_analysis = self.analyze_risks(request, template)
        
        # Opportunity Analysis
        opportunity_analysis = self.analyze_opportunities(request, template)
        
        # Implementation Priority
        implementation_priority = self.determine_implementation_priority(request, template)
        
        # Success Metrics
        success_metrics = self.define_success_metrics(request, template)
        
        # Timeline Estimate
        timeline_estimate = self.estimate_timeline(request, template)
        
        return StructuredAnalysis(
            problem_analysis=problem_analysis,
            technical_analysis=technical_analysis,
            business_analysis=business_analysis,
            risk_analysis=risk_analysis,
            opportunity_analysis=opportunity_analysis,
            implementation_priority=implementation_priority,
            success_metrics=success_metrics,
            timeline_estimate=timeline_estimate
        )

    def analyze_problem(self, request: AnalysisRequest, template: Dict[str, Any]) -> ProblemAnalysis:
        """Analyze the core problem and market need"""
        industry = request.context.industry
        query = request.idea.lower()
        
        # Extract core problem from query
        core_problem = self.extract_core_problem(query, industry)
        
        # Break down problem into components
        problem_breakdown = self.break_down_problem(query, template)
        
        # Determine target audience
        target_audience = self.determine_target_audience(request.context.user_personas)
        
        # Assess market need
        market_need = self.assess_market_need(request.context.market_trends, industry)
        
        # Determine urgency level
        urgency_level = self.assess_urgency(request.context.market_trends, industry)
        
        # Calculate complexity score
        complexity_score = self.calculate_complexity_score(request.context, industry)
        
        return ProblemAnalysis(
            core_problem=core_problem,
            problem_breakdown=problem_breakdown,
            target_audience=target_audience,
            market_need=market_need,
            urgency_level=urgency_level,
            complexity_score=complexity_score
        )

    def analyze_technical(self, request: AnalysisRequest, template: Dict[str, Any]) -> TechnicalAnalysis:
        """Analyze technical requirements and recommendations"""
        context = request.context
        
        # Recommend tech stack based on context
        recommended_tech = self.recommend_tech_stack(context.tech_stacks, context.industry)
        
        # Determine architecture pattern
        architecture_pattern = self.determine_architecture_pattern(context.industry, context.competitors)
        
        # Assess scalability approach
        scalability_approach = self.assess_scalability_approach(context.industry, context.market_size)
        
        # Identify security considerations
        security_considerations = self.identify_security_considerations(context.regulations, context.industry)
        
        # Determine integration requirements
        integration_requirements = self.determine_integration_requirements(context.apis, context.industry)
        
        # Define performance requirements
        performance_requirements = self.define_performance_requirements(context.industry, context.market_size)
        
        return TechnicalAnalysis(
            recommended_tech=recommended_tech,
            architecture_pattern=architecture_pattern,
            scalability_approach=scalability_approach,
            security_considerations=security_considerations,
            integration_requirements=integration_requirements,
            performance_requirements=performance_requirements
        )

    def analyze_business(self, request: AnalysisRequest, template: Dict[str, Any]) -> BusinessAnalysis:
        """Analyze business model and strategy"""
        context = request.context
        
        # Recommend business model
        business_model = self.recommend_business_model(context.business_models, context.industry)
        
        # Identify revenue streams
        revenue_streams = self.identify_revenue_streams(context.business_models, context.industry)
        
        # Recommend pricing strategy
        pricing_strategy = self.recommend_pricing_strategy(context.competitors, context.industry)
        
        # Define go-to-market strategy
        go_to_market = self.define_go_to_market(context.user_personas, context.industry)
        
        # Identify competitive advantage
        competitive_advantage = self.identify_competitive_advantage(context.competitors, context.opportunities)
        
        # Define market positioning
        market_positioning = self.define_market_positioning(context.competitors, context.industry)
        
        return BusinessAnalysis(
            business_model=business_model,
            revenue_streams=revenue_streams,
            pricing_strategy=pricing_strategy,
            go_to_market=go_to_market,
            competitive_advantage=competitive_advantage,
            market_positioning=market_positioning
        )

    def analyze_risks(self, request: AnalysisRequest, template: Dict[str, Any]) -> RiskAnalysis:
        """Analyze risks and mitigation strategies"""
        context = request.context
        industry = context.industry
        
        # Identify technical risks
        technical_risks = self.identify_technical_risks(context.tech_stacks, industry)
        
        # Identify market risks
        market_risks = self.identify_market_risks(context.competitors, context.challenges)
        
        # Identify regulatory risks
        regulatory_risks = self.identify_regulatory_risks(context.regulations, industry)
        
        # Identify operational risks
        operational_risks = self.identify_operational_risks(context.challenges, industry)
        
        # Develop mitigation strategies
        mitigation_strategies = self.develop_mitigation_strategies(technical_risks, market_risks, regulatory_risks)
        
        # Calculate risk score
        risk_score = self.calculate_risk_score(technical_risks, market_risks, regulatory_risks, operational_risks)
        
        return RiskAnalysis(
            technical_risks=technical_risks,
            market_risks=market_risks,
            regulatory_risks=regulatory_risks,
            operational_risks=operational_risks,
            mitigation_strategies=mitigation_strategies,
            risk_score=risk_score
        )

    def analyze_opportunities(self, request: AnalysisRequest, template: Dict[str, Any]) -> OpportunityAnalysis:
        """Analyze opportunities and growth potential"""
        context = request.context
        industry = context.industry
        
        # Identify market opportunities
        market_opportunities = self.identify_market_opportunities(context.opportunities, context.market_trends)
        
        # Identify technology opportunities
        technology_opportunities = self.identify_technology_opportunities(context.tech_stacks, context.apis)
        
        # Identify partnership opportunities
        partnership_opportunities = self.identify_partnership_opportunities(context.competitors, context.apis)
        
        # Identify expansion opportunities
        expansion_opportunities = self.identify_expansion_opportunities(context.market_size, context.opportunities)
        
        # Assess innovation potential
        innovation_potential = self.assess_innovation_potential(context.tech_stacks, context.opportunities)
        
        return OpportunityAnalysis(
            market_opportunities=market_opportunities,
            technology_opportunities=technology_opportunities,
            partnership_opportunities=partnership_opportunities,
            expansion_opportunities=expansion_opportunities,
            innovation_potential=innovation_potential
        )

    # Helper methods for analysis
    def extract_core_problem(self, query: str, industry: str) -> str:
        """Extract core problem from query"""
        if 'fintech' in industry:
            return f"Financial technology solution addressing: {query.replace('create a blueprint for', '').replace('blueprint', '').strip()}"
        elif 'healthcare' in industry:
            return f"Healthcare technology solution addressing: {query.replace('create a blueprint for', '').replace('blueprint', '').strip()}"
        else:
            return f"Technology solution addressing: {query.replace('create a blueprint for', '').replace('blueprint', '').strip()}"

    def break_down_problem(self, query: str, template: Dict[str, Any]) -> List[str]:
        """Break down problem into components"""
        return template.get('core_problems', [
            'Market validation and product-market fit',
            'Customer acquisition and retention',
            'Technology scalability and performance'
        ])

    def determine_target_audience(self, user_personas: List[Dict[str, Any]]) -> str:
        """Determine target audience from user personas"""
        if not user_personas:
            return "General business users"
        
        primary_persona = user_personas[0]
        return f"{primary_persona.get('name', 'Target users')}: {primary_persona.get('description', 'Business professionals')}"

    def assess_market_need(self, market_trends: List[str], industry: str) -> str:
        """Assess market need based on trends"""
        if not market_trends:
            return "Growing market demand for digital solutions"
        
        return f"Strong market demand driven by: {', '.join(market_trends[:3])}"

    def assess_urgency(self, market_trends: List[str], industry: str) -> str:
        """Assess urgency level"""
        if any('increasing' in trend.lower() or 'growing' in trend.lower() for trend in market_trends):
            return "High - Market is rapidly evolving"
        return "Medium - Steady market growth"

    def calculate_complexity_score(self, context: ContextData, industry: str) -> int:
        """Calculate complexity score (1-10)"""
        score = 5  # Base score
        
        # Add complexity based on regulations
        score += len(context.regulations) // 2
        
        # Add complexity based on competitors
        score += len(context.competitors) // 3
        
        # Add complexity based on tech stack
        score += len(context.tech_stacks) // 5
        
        return min(score, 10)

    def recommend_tech_stack(self, tech_stacks: List[str], industry: str) -> List[str]:
        """Recommend technology stack"""
        if not tech_stacks:
            return ["React/Next.js", "Node.js", "PostgreSQL", "Docker", "AWS"]
        
        # Return top 5 most relevant technologies
        return tech_stacks[:5]

    def determine_architecture_pattern(self, industry: str, competitors: List[Dict[str, Any]]) -> str:
        """Determine recommended architecture pattern"""
        if industry == 'fintech':
            return "Microservices architecture with event-driven design for real-time financial processing"
        elif industry == 'healthcare':
            return "HIPAA-compliant microservices with FHIR-based data integration"
        else:
            return "Modern web application with microservices for scalability"

    def assess_scalability_approach(self, industry: str, market_size: Dict[str, Any]) -> str:
        """Assess scalability approach"""
        if market_size.get('tam', '').endswith('T'):
            return "Cloud-native architecture with auto-scaling and global distribution"
        return "Modular architecture with horizontal scaling capabilities"

    def identify_security_considerations(self, regulations: List[str], industry: str) -> List[str]:
        """Identify security considerations"""
        if not regulations:
            return ["Data encryption", "Secure authentication", "Regular security audits"]
        
        return regulations[:5]  # Return top 5 regulations

    def determine_integration_requirements(self, apis: List[Dict[str, Any]], industry: str) -> List[str]:
        """Determine integration requirements"""
        if not apis:
            return ["RESTful API design", "Third-party service integration", "Data synchronization"]
        
        return [f"Integrate with {api['name']} for {api['category']}" for api in apis[:3]]

    def define_performance_requirements(self, industry: str, market_size: Dict[str, Any]) -> List[str]:
        """Define performance requirements"""
        if industry == 'fintech':
            return ["Sub-second response times", "99.9% uptime", "Real-time transaction processing"]
        elif industry == 'healthcare':
            return ["HIPAA-compliant data handling", "Secure patient data access", "Reliable system availability"]
        else:
            return ["Fast page load times", "Scalable infrastructure", "Reliable service delivery"]

    def recommend_business_model(self, business_models: List[str], industry: str) -> str:
        """Recommend business model"""
        if not business_models:
            return "SaaS subscription model"
        
        return business_models[0]  # Return primary business model

    def identify_revenue_streams(self, business_models: List[str], industry: str) -> List[str]:
        """Identify revenue streams"""
        if not business_models:
            return ["Subscription fees", "Premium features", "Enterprise licensing"]
        
        return business_models[:3]  # Return top 3 revenue streams

    def recommend_pricing_strategy(self, competitors: List[Dict[str, Any]], industry: str) -> str:
        """Recommend pricing strategy"""
        if not competitors:
            return "Freemium model with tiered pricing"
        
        # Analyze competitor pricing
        pricing_info = [comp.get('pricing', '') for comp in competitors if comp.get('pricing')]
        if pricing_info:
            return f"Competitive pricing based on market rates: {pricing_info[0]}"
        
        return "Value-based pricing with market positioning"

    def define_go_to_market(self, user_personas: List[Dict[str, Any]], industry: str) -> str:
        """Define go-to-market strategy"""
        if not user_personas:
            return "Direct sales and digital marketing"
        
        primary_persona = user_personas[0]
        return f"Target {primary_persona.get('name', 'primary users')} through {primary_persona.get('influence', 'direct channels')}"

    def identify_competitive_advantage(self, competitors: List[Dict[str, Any]], opportunities: List[str]) -> str:
        """Identify competitive advantage"""
        if not competitors:
            return "Innovative technology and superior user experience"
        
        # Analyze competitor weaknesses
        weaknesses = []
        for comp in competitors:
            weaknesses.extend(comp.get('weaknesses', []))
        
        if weaknesses:
            return f"Addressing key market gaps: {', '.join(weaknesses[:3])}"
        
        return "Unique value proposition and market positioning"

    def define_market_positioning(self, competitors: List[Dict[str, Any]], industry: str) -> str:
        """Define market positioning"""
        if not competitors:
            return "Innovative market leader"
        
        # Analyze market share
        market_shares = [comp.get('market_share', '') for comp in competitors if comp.get('market_share')]
        if market_shares:
            return f"Competitive positioning in {industry} market with {market_shares[0]} target share"
        
        return f"Emerging player in {industry} market"

    def identify_technical_risks(self, tech_stacks: List[str], industry: str) -> List[str]:
        """Identify technical risks"""
        risks = ["Technology scalability challenges", "Integration complexity", "Performance bottlenecks"]
        
        if industry == 'fintech':
            risks.extend(["Security vulnerabilities", "Regulatory compliance", "Data privacy concerns"])
        elif industry == 'healthcare':
            risks.extend(["HIPAA compliance", "Clinical accuracy", "Data security"])
        
        return risks[:5]

    def identify_market_risks(self, competitors: List[Dict[str, Any]], challenges: List[str]) -> List[str]:
        """Identify market risks"""
        risks = ["High customer acquisition costs", "Market competition", "Economic downturns"]
        
        if challenges:
            risks.extend(challenges[:3])
        
        return risks[:5]

    def identify_regulatory_risks(self, regulations: List[str], industry: str) -> List[str]:
        """Identify regulatory risks"""
        if not regulations:
            return ["Compliance requirements", "Data protection laws", "Industry regulations"]
        
        return regulations[:5]

    def identify_operational_risks(self, challenges: List[str], industry: str) -> List[str]:
        """Identify operational risks"""
        risks = ["Resource constraints", "Team scalability", "Operational complexity"]
        
        if challenges:
            risks.extend(challenges[:3])
        
        return risks[:5]

    def develop_mitigation_strategies(self, technical_risks: List[str], market_risks: List[str], regulatory_risks: List[str]) -> List[str]:
        """Develop mitigation strategies"""
        strategies = [
            "Implement robust testing and quality assurance",
            "Develop comprehensive risk management plan",
            "Establish regulatory compliance framework",
            "Create scalable operational processes",
            "Build strong partnerships and alliances"
        ]
        return strategies

    def calculate_risk_score(self, technical_risks: List[str], market_risks: List[str], regulatory_risks: List[str], operational_risks: List[str]) -> int:
        """Calculate overall risk score (1-10)"""
        total_risks = len(technical_risks) + len(market_risks) + len(regulatory_risks) + len(operational_risks)
        return min(total_risks, 10)

    def identify_market_opportunities(self, opportunities: List[str], market_trends: List[str]) -> List[str]:
        """Identify market opportunities"""
        if not opportunities:
            return ["Market expansion", "New customer segments", "Product innovation"]
        
        return opportunities[:5]

    def identify_technology_opportunities(self, tech_stacks: List[str], apis: List[Dict[str, Any]]) -> List[str]:
        """Identify technology opportunities"""
        opportunities = ["AI/ML integration", "Cloud-native architecture", "API ecosystem development"]
        
        if apis:
            opportunities.extend([f"Leverage {api['name']} for {api['category']}" for api in apis[:3]])
        
        return opportunities[:5]

    def identify_partnership_opportunities(self, competitors: List[Dict[str, Any]], apis: List[Dict[str, Any]]) -> List[str]:
        """Identify partnership opportunities"""
        opportunities = ["Strategic partnerships", "Technology integrations", "Channel partnerships"]
        
        if competitors:
            opportunities.append("Potential acquisition targets")
        
        return opportunities

    def identify_expansion_opportunities(self, market_size: Dict[str, Any], opportunities: List[str]) -> List[str]:
        """Identify expansion opportunities"""
        expansion = ["Geographic expansion", "Product line extension", "Market vertical expansion"]
        
        if market_size.get('growth_rate', '').endswith('%'):
            expansion.append("Rapid market growth opportunities")
        
        return expansion

    def assess_innovation_potential(self, tech_stacks: List[str], opportunities: List[str]) -> str:
        """Assess innovation potential"""
        if any('ai' in tech.lower() or 'ml' in tech.lower() for tech in tech_stacks):
            return "High - AI/ML integration enables innovative solutions"
        elif opportunities:
            return "Medium - Multiple growth opportunities available"
        else:
            return "Standard - Focus on execution and market penetration"

    def determine_implementation_priority(self, request: AnalysisRequest, template: Dict[str, Any]) -> List[str]:
        """Determine implementation priority"""
        return [
            "1. Market validation and MVP development",
            "2. Core technology stack implementation",
            "3. Security and compliance setup",
            "4. User interface and experience design",
            "5. Integration with third-party services",
            "6. Testing and quality assurance",
            "7. Launch and go-to-market execution"
        ]

    def define_success_metrics(self, request: AnalysisRequest, template: Dict[str, Any]) -> List[str]:
        """Define success metrics"""
        industry = request.context.industry
        
        if industry == 'fintech':
            return [
                "Monthly Recurring Revenue (MRR)",
                "Customer Acquisition Cost (CAC)",
                "Transaction volume and processing speed",
                "Regulatory compliance score",
                "Customer satisfaction and retention"
            ]
        elif industry == 'healthcare':
            return [
                "Provider adoption rate",
                "Patient engagement metrics",
                "Clinical accuracy and outcomes",
                "HIPAA compliance score",
                "Revenue per provider"
            ]
        else:
            return [
                "Monthly Active Users (MAU)",
                "Revenue growth rate",
                "Customer acquisition and retention",
                "Product-market fit score",
                "Operational efficiency metrics"
            ]

    def estimate_timeline(self, request: AnalysisRequest, template: Dict[str, Any]) -> str:
        """Estimate implementation timeline"""
        complexity = request.context.industry
        if complexity == 'fintech':
            return "6-12 months for MVP, 12-18 months for full platform"
        elif complexity == 'healthcare':
            return "8-15 months for MVP, 15-24 months for full platform"
        else:
            return "4-8 months for MVP, 8-12 months for full platform"

# Initialize the analyst agent
analyst_agent = AnalystAgent()

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Analyst Agent API",
        "version": "1.0.0",
        "status": "running",
        "description": "Analyzes enriched context into structured insights"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "analysis_templates": len(analyst_agent.analysis_templates)
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_context(request: AnalysisRequest):
    """Analyze enriched context from Retriever Agent"""
    try:
        if not request.idea or not request.idea.strip():
            raise HTTPException(status_code=400, detail="Idea is required")
        
        result = await analyst_agent.analyze_context(request)
        return result
        
    except Exception as e:
        logger.error(f"Error analyzing context: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze context: {str(e)}")

@app.get("/templates")
async def get_analysis_templates():
    """Get available analysis templates"""
    return {
        "templates": list(analyst_agent.analysis_templates.keys()),
        "count": len(analyst_agent.analysis_templates)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
