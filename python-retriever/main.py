"""
Python Retriever Agent - FastAPI Server
Enriches user queries with contextual information for AI blueprint generation
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
    title="Retriever Agent API",
    description="AI-powered context enrichment for startup blueprint generation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CompetitorInfo(BaseModel):
    name: str
    description: str
    funding: str
    market_share: str
    strengths: List[str]
    weaknesses: List[str]
    pricing: str
    key_features: List[str]

class ApiInfo(BaseModel):
    name: str
    description: str
    category: str
    pricing: str
    documentation: str
    popularity: int
    use_cases: List[str]

class MarketSizeInfo(BaseModel):
    tam: str  # Total Addressable Market
    sam: str  # Serviceable Addressable Market
    som: str  # Serviceable Obtainable Market
    growth_rate: str
    key_drivers: List[str]

class UserPersona(BaseModel):
    name: str
    description: str
    pain_points: List[str]
    goals: List[str]
    budget: str
    tech_savviness: str
    influence: str

class RetrievalContext(BaseModel):
    industry: str
    market_trends: List[str]
    tech_stacks: List[str]
    competitors: List[CompetitorInfo]
    apis: List[ApiInfo]
    regulations: List[str]
    market_size: MarketSizeInfo
    user_personas: List[UserPersona]
    business_models: List[str]
    challenges: List[str]
    opportunities: List[str]

class QueryAnalysis(BaseModel):
    industry: str
    keywords: List[str]
    business_type: str
    target_audience: str
    complexity: str

class EnrichmentRequest(BaseModel):
    query: str

class EnrichmentResponse(BaseModel):
    success: bool
    original_query: str
    enriched_query: str
    context: RetrievalContext
    analysis: QueryAnalysis
    confidence: float
    processing_time: float
    timestamp: str

class RetrieverAgent:
    def __init__(self):
        self.industry_database = {}
        self.initialize_industry_database()
        logger.info("Retriever Agent initialized")

    def initialize_industry_database(self):
        """Initialize industry database with comprehensive data"""
        self.industry_database = {
            'fintech': {
                'industry': 'fintech',
                'market_trends': [
                    'Open banking adoption increasing 40% YoY',
                    'AI-powered fraud detection becoming standard',
                    'Cryptocurrency integration in traditional banking',
                    'Real-time payment systems gaining traction',
                    'Regulatory sandbox programs expanding globally',
                    'Embedded finance solutions growing rapidly',
                    'Digital wallets replacing traditional banking',
                    'BNPL (Buy Now Pay Later) market expanding'
                ],
                'tech_stacks': [
                    'React/Next.js for frontend',
                    'Node.js/Python for backend',
                    'PostgreSQL/MongoDB for data',
                    'Redis for caching',
                    'Docker for deployment',
                    'AWS/Azure for cloud infrastructure',
                    'Stripe/Plaid for payments',
                    'Web3.js for blockchain integration',
                    'TensorFlow/PyTorch for AI/ML',
                    'Kubernetes for orchestration'
                ],
                'competitors': [
                    {
                        'name': 'Stripe',
                        'description': 'Payment processing platform',
                        'funding': '$2.2B',
                        'market_share': '15%',
                        'strengths': ['Developer-friendly', 'Global reach', 'Strong API', 'Easy integration'],
                        'weaknesses': ['High fees', 'Limited customization', 'Vendor lock-in'],
                        'pricing': '2.9% + 30¢ per transaction',
                        'key_features': ['Payment processing', 'Subscription billing', 'Marketplace payments', 'Fraud detection']
                    },
                    {
                        'name': 'Plaid',
                        'description': 'Bank account connectivity platform',
                        'funding': '$734M',
                        'market_share': '8%',
                        'strengths': ['Bank connections', 'Data security', 'Compliance', 'Reliability'],
                        'weaknesses': ['Limited bank coverage', 'API complexity', 'High costs'],
                        'pricing': '$0.50-$2.00 per account',
                        'key_features': ['Account verification', 'Transaction data', 'Identity verification', 'Risk assessment']
                    },
                    {
                        'name': 'Square',
                        'description': 'Point-of-sale and payment solutions',
                        'funding': '$1.2B',
                        'market_share': '12%',
                        'strengths': ['Small business focus', 'Hardware integration', 'All-in-one solution'],
                        'weaknesses': ['Limited enterprise features', 'Geographic limitations'],
                        'pricing': '2.6% + 10¢ per transaction',
                        'key_features': ['POS systems', 'Online payments', 'Inventory management', 'Analytics']
                    }
                ],
                'apis': [
                    {
                        'name': 'Stripe API',
                        'description': 'Payment processing and billing',
                        'category': 'Payments',
                        'pricing': '2.9% + 30¢ per transaction',
                        'documentation': 'https://stripe.com/docs',
                        'popularity': 95,
                        'use_cases': ['Payment processing', 'Subscription billing', 'Marketplace payments', 'International payments']
                    },
                    {
                        'name': 'Plaid API',
                        'description': 'Bank account connectivity',
                        'category': 'Banking',
                        'pricing': '$0.50-$2.00 per account',
                        'documentation': 'https://plaid.com/docs',
                        'popularity': 85,
                        'use_cases': ['Account verification', 'Transaction data', 'Identity verification', 'Risk assessment']
                    },
                    {
                        'name': 'OpenAI API',
                        'description': 'AI and machine learning services',
                        'category': 'AI/ML',
                        'pricing': '$0.002-$0.12 per 1K tokens',
                        'documentation': 'https://platform.openai.com/docs',
                        'popularity': 90,
                        'use_cases': ['Fraud detection', 'Customer support', 'Risk assessment', 'Document processing']
                    }
                ],
                'regulations': [
                    'PCI DSS compliance required',
                    'GDPR for EU users',
                    'SOX compliance for public companies',
                    'AML/KYC requirements',
                    'State money transmitter licenses',
                    'CFPB regulations',
                    'Basel III compliance',
                    'MiFID II for EU financial services'
                ],
                'market_size': {
                    'tam': '$12.6T',
                    'sam': '$1.2T',
                    'som': '$120B',
                    'growth_rate': '15% annually',
                    'key_drivers': ['Digital transformation', 'Mobile payments', 'Open banking', 'AI adoption']
                },
                'user_personas': [
                    {
                        'name': 'Tech-Savvy Entrepreneur',
                        'description': 'Early-stage startup founder',
                        'pain_points': ['Complex compliance', 'High transaction fees', 'Integration complexity', 'Limited technical resources'],
                        'goals': ['Fast market entry', 'Scalable solution', 'Cost efficiency', 'Easy integration'],
                        'budget': '$10K-50K monthly',
                        'tech_savviness': 'High',
                        'influence': 'Decision maker'
                    },
                    {
                        'name': 'Small Business Owner',
                        'description': 'Local business owner looking to digitize',
                        'pain_points': ['Limited technical knowledge', 'High costs', 'Complex setup', 'Security concerns'],
                        'goals': ['Easy payment processing', 'Cost savings', 'Customer convenience', 'Business growth'],
                        'budget': '$1K-10K monthly',
                        'tech_savviness': 'Medium',
                        'influence': 'Decision maker'
                    }
                ],
                'business_models': [
                    'Transaction-based fees',
                    'Subscription SaaS',
                    'Freemium with premium features',
                    'Marketplace commission',
                    'White-label solutions',
                    'API usage-based pricing',
                    'Enterprise licensing',
                    'Revenue sharing'
                ],
                'challenges': [
                    'Regulatory compliance complexity',
                    'High customer acquisition costs',
                    'Security and fraud prevention',
                    'Integration with legacy systems',
                    'Competition from incumbents',
                    'Data privacy concerns',
                    'Scalability challenges',
                    'Market saturation'
                ],
                'opportunities': [
                    'Open banking initiatives',
                    'Cryptocurrency integration',
                    'AI-powered fraud detection',
                    'Real-time payment systems',
                    'Cross-border payments',
                    'Embedded finance',
                    'BNPL market growth',
                    'Digital identity solutions'
                ]
            },
            'healthcare': {
                'industry': 'healthcare',
                'market_trends': [
                    'Telemedicine adoption increasing 300% post-COVID',
                    'AI-powered diagnostics becoming mainstream',
                    'Wearable health devices growing rapidly',
                    'Personalized medicine on the rise',
                    'Digital therapeutics gaining FDA approval',
                    'Remote patient monitoring expanding',
                    'Healthcare data interoperability improving',
                    'Precision medicine advancing'
                ],
                'tech_stacks': [
                    'React/Next.js for patient portals',
                    'Python/Django for backend',
                    'PostgreSQL for medical data',
                    'Docker for deployment',
                    'AWS/Azure for HIPAA compliance',
                    'TensorFlow/PyTorch for AI/ML',
                    'FHIR for data standards',
                    'Kubernetes for orchestration',
                    'Redis for caching',
                    'Elasticsearch for search'
                ],
                'competitors': [
                    {
                        'name': 'Teladoc',
                        'description': 'Telemedicine platform',
                        'funding': '$1.2B',
                        'market_share': '25%',
                        'strengths': ['Market leader', 'Provider network', 'Insurance partnerships'],
                        'weaknesses': ['High costs', 'Limited specialty care', 'Quality concerns'],
                        'pricing': '$49-$75 per visit',
                        'key_features': ['Video consultations', 'Prescription management', 'Health records', 'Insurance billing']
                    },
                    {
                        'name': 'Babylon Health',
                        'description': 'AI-powered healthcare platform',
                        'funding': '$800M',
                        'market_share': '8%',
                        'strengths': ['AI diagnostics', 'Symptom checker', 'Global reach'],
                        'weaknesses': ['Regulatory challenges', 'Accuracy concerns', 'Limited human oversight'],
                        'pricing': '$9.99-$19.99 monthly',
                        'key_features': ['AI symptom checker', 'Video consultations', 'Health monitoring', 'Prescription management']
                    }
                ],
                'apis': [
                    {
                        'name': 'Epic MyChart API',
                        'description': 'Electronic health records integration',
                        'category': 'EHR',
                        'pricing': 'Custom pricing',
                        'documentation': 'https://fhir.epic.com/',
                        'popularity': 80,
                        'use_cases': ['Patient data access', 'Appointment scheduling', 'Prescription management', 'Test results']
                    },
                    {
                        'name': 'Google Health API',
                        'description': 'Healthcare data and AI services',
                        'category': 'AI/ML',
                        'pricing': 'Pay-per-use',
                        'documentation': 'https://developers.google.com/health',
                        'popularity': 70,
                        'use_cases': ['Medical imaging analysis', 'Clinical decision support', 'Drug discovery', 'Health insights']
                    }
                ],
                'regulations': [
                    'HIPAA compliance required',
                    'FDA approval for medical devices',
                    'GDPR for EU patients',
                    'SOC 2 Type II certification',
                    'State medical licensing',
                    'CLIA certification for labs',
                    'DEA registration for controlled substances',
                    'HITECH Act compliance'
                ],
                'market_size': {
                    'tam': '$4.1T',
                    'sam': '$400B',
                    'som': '$40B',
                    'growth_rate': '12% annually',
                    'key_drivers': ['Aging population', 'Chronic disease management', 'Digital health adoption', 'AI integration']
                },
                'user_personas': [
                    {
                        'name': 'Primary Care Physician',
                        'description': 'Family doctor using digital tools',
                        'pain_points': ['Time constraints', 'Administrative burden', 'Patient communication', 'Data management'],
                        'goals': ['Improved patient outcomes', 'Efficient workflows', 'Better diagnostics', 'Reduced paperwork'],
                        'budget': '$5K-20K monthly',
                        'tech_savviness': 'Medium',
                        'influence': 'Decision maker'
                    },
                    {
                        'name': 'Healthcare Administrator',
                        'description': 'Hospital or clinic administrator',
                        'pain_points': ['Cost management', 'Regulatory compliance', 'Staff efficiency', 'Patient satisfaction'],
                        'goals': ['Cost reduction', 'Compliance', 'Operational efficiency', 'Quality improvement'],
                        'budget': '$50K-200K monthly',
                        'tech_savviness': 'High',
                        'influence': 'Decision maker'
                    }
                ],
                'business_models': [
                    'Per-consultation fees',
                    'Subscription SaaS',
                    'Outcome-based pricing',
                    'Insurance partnerships',
                    'B2B licensing',
                    'Freemium models',
                    'Value-based care',
                    'Platform commissions'
                ],
                'challenges': [
                    'Regulatory compliance complexity',
                    'Data privacy and security',
                    'Provider adoption resistance',
                    'Insurance reimbursement',
                    'Quality assurance',
                    'Integration with existing systems',
                    'Patient trust and adoption',
                    'Clinical validation requirements'
                ],
                'opportunities': [
                    'AI-powered diagnostics',
                    'Remote patient monitoring',
                    'Personalized medicine',
                    'Digital therapeutics',
                    'Wearable device integration',
                    'Preventive care solutions',
                    'Mental health services',
                    'Chronic disease management'
                ]
            }
        }

    async def analyze_query(self, query: str) -> QueryAnalysis:
        """Analyze user query to extract key information"""
        query_lower = query.lower()
        
        # Industry detection
        industry = self.detect_industry(query_lower)
        
        # Extract keywords
        keywords = self.extract_keywords(query_lower)
        
        # Determine business type
        business_type = self.detect_business_type(query_lower)
        
        # Determine target audience
        target_audience = self.detect_target_audience(query_lower)
        
        # Assess complexity
        complexity = self.assess_complexity(query_lower, keywords)
        
        return QueryAnalysis(
            industry=industry,
            keywords=keywords,
            business_type=business_type,
            target_audience=target_audience,
            complexity=complexity
        )

    def detect_industry(self, query: str) -> str:
        """Detect industry from query"""
        industry_patterns = {
            'fintech': ['fintech', 'financial', 'banking', 'payment', 'crypto', 'blockchain', 'trading', 'investment', 'fintech'],
            'healthcare': ['healthcare', 'medical', 'health', 'pharma', 'telemedicine', 'diagnosis', 'treatment', 'doctor', 'patient'],
            'ecommerce': ['ecommerce', 'e-commerce', 'retail', 'shopping', 'marketplace', 'store', 'selling'],
            'education': ['education', 'edtech', 'learning', 'school', 'university', 'course', 'training'],
            'logistics': ['logistics', 'shipping', 'delivery', 'supply chain', 'transportation', 'warehouse'],
            'real estate': ['real estate', 'property', 'housing', 'rental', 'construction', 'architecture'],
            'agriculture': ['agriculture', 'farming', 'crop', 'livestock', 'food', 'sustainability'],
            'energy': ['energy', 'renewable', 'solar', 'wind', 'battery', 'power', 'electricity'],
            'transportation': ['transportation', 'mobility', 'autonomous', 'ride sharing', 'public transit'],
            'entertainment': ['entertainment', 'gaming', 'media', 'streaming', 'content', 'social'],
            'ai': ['ai', 'artificial intelligence', 'machine learning', 'automation', 'intelligent'],
            'saas': ['saas', 'software as a service', 'platform', 'tool', 'application'],
            'b2b': ['b2b', 'business to business', 'enterprise', 'corporate', 'professional'],
            'b2c': ['b2c', 'business to consumer', 'consumer', 'individual', 'personal']
        }

        for industry, patterns in industry_patterns.items():
            if any(pattern in query for pattern in patterns):
                return industry

        return 'general'

    def extract_keywords(self, query: str) -> List[str]:
        """Extract keywords from query"""
        keywords = []
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'create', 'blueprint', 'startup', 'business'}
        
        words = query.split()
        words = [word.lower().strip('.,!?;:') for word in words]
        words = [word for word in words if len(word) > 2 and word not in common_words]
        
        return list(set(words))

    def detect_business_type(self, query: str) -> str:
        """Detect business type from query"""
        if 'startup' in query or 'new business' in query:
            return 'startup'
        elif 'platform' in query or 'marketplace' in query:
            return 'platform'
        elif 'app' in query or 'application' in query:
            return 'app'
        elif 'service' in query or 'saas' in query:
            return 'service'
        elif 'tool' in query or 'software' in query:
            return 'tool'
        return 'business'

    def detect_target_audience(self, query: str) -> str:
        """Detect target audience from query"""
        if 'enterprise' in query or 'b2b' in query:
            return 'enterprise'
        elif 'consumer' in query or 'b2c' in query:
            return 'consumer'
        elif 'developer' in query or 'technical' in query:
            return 'developer'
        elif 'small business' in query or 'sme' in query:
            return 'small_business'
        return 'general'

    def assess_complexity(self, query: str, keywords: List[str]) -> str:
        """Assess query complexity"""
        complexity_score = len(keywords) + (2 if len(query) > 100 else 0)
        
        if complexity_score <= 3:
            return 'simple'
        elif complexity_score <= 6:
            return 'medium'
        return 'complex'

    async def retrieve_context(self, analysis: QueryAnalysis) -> RetrievalContext:
        """Retrieve context for the industry"""
        industry = analysis.industry
        
        if industry in self.industry_database:
            context_data = self.industry_database[industry]
        else:
            context_data = self.industry_database.get('general', self.get_default_context())
        
        # Convert to Pydantic models
        competitors = [CompetitorInfo(**comp) for comp in context_data['competitors']]
        apis = [ApiInfo(**api) for api in context_data['apis']]
        market_size = MarketSizeInfo(**context_data['market_size'])
        user_personas = [UserPersona(**persona) for persona in context_data['user_personas']]
        
        return RetrievalContext(
            industry=context_data['industry'],
            market_trends=context_data['market_trends'],
            tech_stacks=context_data['tech_stacks'],
            competitors=competitors,
            apis=apis,
            regulations=context_data['regulations'],
            market_size=market_size,
            user_personas=user_personas,
            business_models=context_data['business_models'],
            challenges=context_data['challenges'],
            opportunities=context_data['opportunities']
        )

    def get_default_context(self) -> Dict[str, Any]:
        """Get default context for unknown industries"""
        return {
            'industry': 'general',
            'market_trends': ['Digital transformation accelerating', 'AI adoption increasing', 'Remote work becoming standard'],
            'tech_stacks': ['React/Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
            'competitors': [],
            'apis': [],
            'regulations': ['GDPR compliance', 'Data protection laws'],
            'market_size': {'tam': '$1T', 'sam': '$100B', 'som': '$10B', 'growth_rate': '10%', 'key_drivers': ['Digital adoption']},
            'user_personas': [],
            'business_models': ['SaaS', 'Marketplace', 'Subscription'],
            'challenges': ['Competition', 'Customer acquisition', 'Technology complexity'],
            'opportunities': ['Digital transformation', 'AI integration', 'Market expansion']
        }

    def enrich_query_with_context(self, original_query: str, context: RetrievalContext, analysis: QueryAnalysis) -> str:
        """Enrich query with context"""
        enriched_query = f"""
CONTEXT-ENRICHED QUERY:

Original Query: "{original_query}"

INDUSTRY CONTEXT: {context.industry.upper()}
COMPLEXITY: {analysis.complexity.upper()}
BUSINESS TYPE: {analysis.business_type.upper()}
TARGET AUDIENCE: {analysis.target_audience.upper()}

MARKET TRENDS:
{chr(10).join(f"- {trend}" for trend in context.market_trends)}

RECOMMENDED TECH STACK:
{chr(10).join(f"- {tech}" for tech in context.tech_stacks)}

KEY COMPETITORS:
{chr(10).join(f"- {comp.name}: {comp.description} (${comp.funding} funding, {comp.market_share} market share)" for comp in context.competitors)}

RELEVANT APIs:
{chr(10).join(f"- {api.name}: {api.description} ({api.pricing})" for api in context.apis)}

REGULATORY CONSIDERATIONS:
{chr(10).join(f"- {reg}" for reg in context.regulations)}

MARKET SIZE:
- TAM: {context.market_size.tam}
- SAM: {context.market_size.sam}
- SOM: {context.market_size.som}
- Growth Rate: {context.market_size.growth_rate}

TARGET USER PERSONAS:
{chr(10).join(f"- {persona.name}: {persona.description}" for persona in context.user_personas)}

BUSINESS MODELS:
{chr(10).join(f"- {model}" for model in context.business_models)}

KEY CHALLENGES:
{chr(10).join(f"- {challenge}" for challenge in context.challenges)}

OPPORTUNITIES:
{chr(10).join(f"- {opportunity}" for opportunity in context.opportunities)}

ENRICHED PROMPT:
Based on the above context, create a comprehensive business blueprint for: "{original_query}"

Focus on:
1. Industry-specific market analysis
2. Competitive positioning against the mentioned competitors
3. Technology stack recommendations from the suggested options
4. Regulatory compliance considerations
5. Target user personas and their specific needs
6. Business model recommendations
7. Market size and growth opportunities
8. Risk mitigation strategies
9. Implementation roadmap with industry best practices
10. Success metrics and KPIs

Make the analysis specific, actionable, and grounded in current market realities.
        """.strip()

        return enriched_query

    def calculate_confidence(self, analysis: QueryAnalysis, context: RetrievalContext) -> float:
        """Calculate confidence score"""
        confidence = 0.5  # Base confidence
        
        # Industry detection confidence
        if analysis.industry != 'general':
            confidence += 0.2
        
        # Keyword richness
        if len(analysis.keywords) > 3:
            confidence += 0.1
        if len(analysis.keywords) > 6:
            confidence += 0.1
        
        # Context completeness
        if len(context.competitors) > 0:
            confidence += 0.1
        if len(context.apis) > 0:
            confidence += 0.1
        
        # Query complexity
        if analysis.complexity == 'complex':
            confidence += 0.1
        
        return min(confidence, 1.0)

    async def enrich_query(self, query: str) -> EnrichmentResponse:
        """Main method to enrich user query with context"""
        start_time = time.time()
        
        logger.info(f"🔍 Retriever Agent: Analyzing query... {query}")
        
        # Analyze query
        analysis = await self.analyze_query(query)
        
        # Retrieve context
        context = await self.retrieve_context(analysis)
        
        # Enrich query
        enriched_query = self.enrich_query_with_context(query, context, analysis)
        
        # Calculate confidence
        confidence = self.calculate_confidence(analysis, context)
        
        processing_time = time.time() - start_time
        
        logger.info(f"✅ Retriever Agent: Context enriched with confidence: {confidence:.1%} ({processing_time:.2f}s)")
        
        return EnrichmentResponse(
            success=True,
            original_query=query,
            enriched_query=enriched_query,
            context=context,
            analysis=analysis,
            confidence=confidence,
            processing_time=processing_time,
            timestamp=datetime.now().isoformat()
        )

# Initialize the retriever agent
retriever_agent = RetrieverAgent()

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Python Retriever Agent API",
        "version": "1.0.0",
        "status": "running",
        "available_industries": list(retriever_agent.industry_database.keys())
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "available_industries": len(retriever_agent.industry_database)
    }

@app.post("/enrich", response_model=EnrichmentResponse)
async def enrich_query(request: EnrichmentRequest):
    """Enrich user query with contextual information"""
    try:
        if not request.query or not request.query.strip():
            raise HTTPException(status_code=400, detail="Query is required")
        
        result = await retriever_agent.enrich_query(request.query.strip())
        return result
        
    except Exception as e:
        logger.error(f"Error enriching query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to enrich query: {str(e)}")

@app.get("/industries")
async def get_available_industries():
    """Get list of available industries"""
    return {
        "industries": list(retriever_agent.industry_database.keys()),
        "count": len(retriever_agent.industry_database)
    }

@app.get("/context/{industry}")
async def get_industry_context(industry: str):
    """Get context for a specific industry"""
    if industry not in retriever_agent.industry_database:
        raise HTTPException(status_code=404, detail=f"Industry '{industry}' not found")
    
    return {
        "industry": industry,
        "context": retriever_agent.industry_database[industry]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
