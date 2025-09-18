import { AIProviderFactory, AIProvider } from './providers';
import { retrieverClient } from './retriever-client';

// Use the provider factory to get the appropriate AI provider
// Initialize lazily to avoid module-level execution issues
let aiProvider: AIProvider | null = null;

function getAIProvider(): AIProvider {
  if (!aiProvider) {
    aiProvider = AIProviderFactory.createProvider();
  }
  return aiProvider;
}

export interface BlueprintGenerationRequest {
  idea: string;
  title: string;
  description: string;
}

export interface MarketAnalysis {
  executiveSummary?: string;
  targetMarket: {
    primary: string;
    secondary?: string;
    tertiary?: string;
    demographics?: {
      age: string;
      income: string;
      location: string;
      education: string;
      profession: string;
    };
    psychographics?: {
      values: string;
      interests: string;
      behaviors: string;
      lifestyle: string;
    };
    size?: {
      totalAddressableMarket: string;
      serviceableAddressableMarket: string;
      serviceableObtainableMarket: string;
      growthRate: string;
    };
  };
  competition: Array<{
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    marketShare?: string;
    pricing?: string;
    funding?: string;
    revenue?: string;
    employees?: string;
    founded?: string;
    headquarters?: string;
    keyFeatures?: string[];
    customerReviews?: string;
  }>;
  marketTrends?: Array<{
    trend: string;
    description: string;
    impact: string;
    timeline: string;
    dataSource?: string;
    marketValue?: string;
    adoptionRate?: string;
  }>;
  opportunities?: Array<{
    opportunity: string;
    description: string;
    potential: string;
    difficulty: string;
    timeline?: string;
    resources?: string;
    competition?: string;
  }>;
  customerPersonas?: Array<{
    name: string;
    age: string;
    profession: string;
    painPoints: string[];
    goals: string[];
    behaviors: string;
    budget: string;
    influence: string;
  }>;
  positioning: {
    valueProposition: string;
    differentiation: string;
    brandPositioning: string;
    messaging: string;
  };
  revenueModel: {
    primary: string;
    secondary?: string;
    pricingStrategy: string;
    projections?: {
      year1: string;
      year2: string;
      year3: string;
    };
    unitEconomics?: {
      customerAcquisitionCost: string;
      lifetimeValue: string;
      grossMargin: string;
    };
  };
  marketSize: {
    totalAddressableMarket: string;
    serviceableAddressableMarket: string;
    serviceableObtainableMarket: string;
    dataSources?: string[];
  };
  goToMarket?: {
    strategy: string;
    channels: string[];
    timeline: string;
    budget: string;
    metrics: string;
  };
  risks?: Array<{
    risk: string;
    description: string;
    probability: string;
    impact: string;
    mitigation: string;
  }>;
}

export interface TechStackItem {
  category: string;
  name: string;
  version?: string;
  rationale: string;
}

export interface APIDesign {
  endpoint: string;
  method: string;
  description: string;
  requestSchema?: string;
  responseSchema?: string;
}

export interface TechnicalBlueprint {
  architecture: {
    overview: string;
    pattern: string;
    components: Array<{
      name: string;
      description: string;
      technology: string;
      scaling: string;
    }>;
    dataFlow: string;
    integration: string;
  };
  techStack: Array<{
    category: string;
    name: string;
    version: string;
    rationale: string;
    alternatives?: string[];
    pros?: string[];
    cons?: string[];
    learningCurve?: string;
    community?: string;
    documentation?: string;
  }>;
  apiDesign: Array<{
    endpoint: string;
    method: string;
    description: string;
    requestSchema?: string;
    responseSchema?: string;
    authentication?: string;
    rateLimit?: string;
    versioning?: string;
    examples?: {
      request?: string;
      response?: string;
    };
  }>;
  databaseSchema: {
    overview: string;
    tables: Array<{
      name: string;
      description: string;
      columns: Array<{
        name: string;
        type: string;
        constraints: string;
        description: string;
      }>;
      indexes: string[];
      relationships: string;
    }>;
    scaling: string;
    backup: string;
    migrations: string;
  };
  security?: {
    authentication: string;
    authorization: string;
    dataEncryption: string;
    apiSecurity: string;
    vulnerabilityManagement: string;
    compliance: string;
  };
  performance?: {
    optimization: string;
    caching: string;
    cdn: string;
    loadBalancing: string;
    monitoring: string;
  };
  deployment?: {
    strategy: string;
    infrastructure: string;
    ciCd: string;
    environments: string[];
    scaling: string;
    disasterRecovery: string;
  };
  monitoring?: {
    tools: string[];
    metrics: string;
    alerting: string;
    logging: string;
    observability: string;
  };
  costOptimization?: {
    infrastructure: string;
    licensing: string;
    scaling: string;
    budget: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dependencies: string[];
}

export interface Sprint {
  week: number;
  title: string;
  description: string;
  tasks: Task[];
  deliverables: string[];
}

export interface Milestone {
  week: number;
  title: string;
  description: string;
  criteria: string[];
}

export interface Deliverable {
  name: string;
  description: string;
  type: 'CODE' | 'DOCUMENTATION' | 'DESIGN' | 'TEST' | 'DEPLOYMENT';
  week: number;
}

export interface ImplementationPlan {
  totalWeeks: number;
  sprints: Sprint[];
  milestones: Milestone[];
  deliverables: Deliverable[];
}

export interface CodeFile {
  path: string;
  content: string;
  description: string;
}

export interface CodeTemplate {
  name: string;
  description: string;
  language: string;
  framework?: string;
  repositoryUrl?: string;
  files: CodeFile[];
}

export interface GeneratedBlueprint {
  marketAnalysis: MarketAnalysis;
  technicalBlueprint: TechnicalBlueprint;
  implementationPlan: ImplementationPlan;
  codeTemplates: CodeTemplate[];
}

export class AIBlueprintGenerator {
  private async callAI(prompt: string, maxTokens: number = 4000): Promise<string> {
    try {
      const provider = getAIProvider();
      console.log(`Using AI provider: ${provider.name}`);
      const response = await provider.generateResponse(prompt, maxTokens);
      
      // Clean the response to extract JSON if it's wrapped in markdown
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Remove any leading/trailing text before/after JSON
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      // Additional cleaning for common JSON issues
      cleanedResponse = cleanedResponse
        .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
        .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      return cleanedResponse;
    } catch (error: any) {
      console.error('AI API error:', error);
      
      // If quota exceeded, return a special response
      if (error.message === 'QUOTA_EXCEEDED') {
        console.log('Quota exceeded, using fallback data');
        return 'QUOTA_EXCEEDED';
      }
      
      const provider = getAIProvider();
      throw new Error(`Failed to generate AI response using ${provider.name}`);
    }
  }

  async generateMarketAnalysis(idea: string, title: string, context?: any): Promise<MarketAnalysis> {
    // Extract the actual business concept from the idea
    const businessConcept = idea.replace(/create a blueprint for/i, '').replace(/blueprint/i, '').trim();
    
    const prompt = `Create a market analysis for an AI fintech startup.

Include these specific competitors: Stripe, Plaid, Square, Robinhood, Chime, Affirm, Klarna
Include real market data: Fintech market is $310B globally, growing 20% annually
Include specific customer segments: Small businesses, millennials, underbanked populations
Include real pricing: Stripe charges 2.9% + 30¢ per transaction, Plaid charges $0.50-2.00 per API call

Make this specific to AI fintech, not generic templates.

For "${businessConcept}", provide:

EXECUTIVE SUMMARY (2-3 paragraphs):
- What EXACTLY is this business concept?
- What SPECIFIC problem does it solve?
- Who are the REAL target customers?
- What is the ACTUAL market opportunity size?
- Why is this timing perfect for this specific solution?

TARGET MARKET ANALYSIS:
- PRIMARY MARKET: Specific customer segments who NEED this exact solution
- DEMOGRAPHICS: Real data on age, income, location, profession for this market
- PSYCHOGRAPHICS: Actual values, behaviors, and motivations of target customers
- PAIN POINTS: Specific, real problems this solution addresses
- BUYING BEHAVIOR: How these customers actually make purchasing decisions

COMPETITIVE LANDSCAPE:
- List 3-5 REAL competitors in this exact space
- Their ACTUAL strengths, weaknesses, market share, funding
- SPECIFIC gaps in the market this solution can fill
- Real pricing models and positioning strategies

MARKET TRENDS & OPPORTUNITIES:
- 3-5 SPECIFIC trends affecting this exact industry right now
- Real market data, growth rates, adoption percentages
- Specific opportunities this startup can capitalize on
- Timeline and market value for each trend

CUSTOMER PERSONAS:
- 2-3 DETAILED personas based on real target customers
- Specific job titles, companies, pain points, goals
- Real budget ranges and decision-making processes
- Actual quotes or behaviors from similar customers

REVENUE MODEL & PRICING:
- SPECIFIC revenue streams for this exact business model
- Real pricing strategies used by similar companies
- Actual unit economics (CAC, LTV, margins) for this industry
- Revenue projections based on real market data

MARKET SIZE & GROWTH:
- REAL TAM, SAM, SOM numbers for this specific market
- Actual growth rates and market projections
- Geographic opportunities and expansion potential
- Market maturity and timing analysis

GO-TO-MARKET STRATEGY:
- SPECIFIC channels to reach these exact customers
- Real marketing strategies that work in this industry
- Actual partnerships and distribution opportunities
- Timeline and budget for market entry

RISK ASSESSMENT:
- REAL risks specific to this business model and market
- Actual probability and impact assessments
- Specific mitigation strategies for each risk
- Regulatory, competitive, and market risks

Format as JSON with this comprehensive structure:
{
  "executiveSummary": "2-3 paragraph executive summary explaining what this startup idea is about, its business potential, target market, and key opportunities. Be specific to the actual idea provided.",
  "targetMarket": {
    "primary": "detailed primary market description",
    "secondary": "detailed secondary market description",
    "tertiary": "emerging market opportunities",
    "demographics": {
      "age": "detailed age breakdown",
      "income": "income distribution analysis",
      "location": "geographic distribution",
      "education": "education level analysis",
      "profession": "professional background analysis"
    },
    "psychographics": {
      "values": "core values and beliefs",
      "interests": "hobbies and interests",
      "behaviors": "purchasing and usage behaviors",
      "lifestyle": "lifestyle characteristics"
    },
    "size": {
      "totalAddressableMarket": "TAM in numbers",
      "serviceableAddressableMarket": "SAM in numbers", 
      "serviceableObtainableMarket": "SOM in numbers",
      "growthRate": "annual growth rate percentage"
    }
  },
  "competition": [
    {
      "name": "competitor name",
      "description": "detailed description of their business",
      "strengths": ["strength1", "strength2", "strength3"],
      "weaknesses": ["weakness1", "weakness2", "weakness3"],
      "marketShare": "estimated market share percentage",
      "pricing": "detailed pricing model",
      "funding": "total funding raised",
      "revenue": "estimated annual revenue",
      "employees": "company size",
      "founded": "founding year",
      "headquarters": "location",
      "keyFeatures": ["feature1", "feature2", "feature3"],
      "customerReviews": "average rating and key feedback"
    }
  ],
  "marketTrends": [
    {
      "trend": "trend name",
      "description": "detailed trend description",
      "impact": "how it affects the market",
      "timeline": "when it's happening",
      "dataSource": "source of trend data",
      "marketValue": "potential market value",
      "adoptionRate": "current adoption rate"
    }
  ],
  "opportunities": [
    {
      "opportunity": "opportunity name",
      "description": "detailed opportunity description",
      "potential": "market potential in numbers",
      "difficulty": "implementation difficulty (1-10)",
      "timeline": "time to implement",
      "resources": "required resources",
      "competition": "competitive landscape for this opportunity"
    }
  ],
  "customerPersonas": [
    {
      "name": "persona name",
      "age": "age range",
      "profession": "job title/role",
      "painPoints": ["pain1", "pain2", "pain3"],
      "goals": ["goal1", "goal2", "goal3"],
      "behaviors": "how they behave",
      "budget": "spending capacity",
      "influence": "decision making influence"
    }
  ],
  "positioning": {
    "valueProposition": "unique value proposition",
    "differentiation": "key differentiators",
    "brandPositioning": "brand positioning statement",
    "messaging": "key messaging pillars"
  },
  "revenueModel": {
    "primary": "main revenue stream",
    "secondary": "secondary revenue streams",
    "pricingStrategy": "detailed pricing strategy",
    "projections": {
      "year1": "revenue projection year 1",
      "year2": "revenue projection year 2", 
      "year3": "revenue projection year 3"
    },
    "unitEconomics": {
      "customerAcquisitionCost": "CAC",
      "lifetimeValue": "LTV",
      "grossMargin": "gross margin percentage"
    }
  },
  "marketSize": {
    "totalAddressableMarket": "TAM in billions",
    "serviceableAddressableMarket": "SAM in billions",
    "serviceableObtainableMarket": "SOM in billions",
    "dataSources": ["source1", "source2", "source3"]
  },
  "goToMarket": {
    "strategy": "overall GTM strategy",
    "channels": ["channel1", "channel2", "channel3"],
    "timeline": "implementation timeline",
    "budget": "estimated budget",
    "metrics": "key success metrics"
  },
  "risks": [
    {
      "risk": "risk name",
      "description": "risk description",
      "probability": "probability (1-10)",
      "impact": "impact level (1-10)",
      "mitigation": "mitigation strategy"
    }
  ]
}`;

    try {
      const response = await this.callAI(prompt);
      
      if (response === 'QUOTA_EXCEEDED') {
        console.log('Using fallback data due to quota exceeded');
        return this.getFallbackMarketAnalysis(idea, title);
      }
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Market analysis generation failed:', error);
      // Return fallback data
      return this.getFallbackMarketAnalysis(idea, title);
    }
  }

  private getFallbackMarketAnalysis(idea: string, title: string): MarketAnalysis {
    return {
      executiveSummary: `This blueprint outlines a comprehensive business strategy for ${idea}. The concept focuses on leveraging technology to address specific market needs in the ${idea.toLowerCase()} space. Our analysis reveals significant market opportunities with clear customer pain points that this solution can effectively address. The business model shows strong potential for growth and profitability, with multiple revenue streams and a scalable approach to market penetration.`,
      targetMarket: {
        primary: `Tech-savvy individuals and businesses interested in ${idea.toLowerCase()}`,
        secondary: `Early adopters in the ${idea.toLowerCase()} space`,
        demographics: {
          age: "25-45 years old",
          income: "$50,000-$150,000 annually",
          location: "Urban and suburban areas",
          education: "College-educated professionals",
          profession: "Technology, business, and creative industries"
        },
        psychographics: {
          values: "Innovation, efficiency, and quality",
          interests: "Technology trends and productivity tools",
          behaviors: "Early adopters of new technology",
          lifestyle: "Busy professionals seeking solutions"
        },
        size: {
          totalAddressableMarket: "$2.5B",
          serviceableAddressableMarket: "$500M",
          serviceableObtainableMarket: "$50M",
          growthRate: "15% annually"
        }
      },
      competition: [
        {
          name: "Existing Solutions",
          description: "Current market solutions addressing similar needs",
          strengths: ["Market presence", "User base", "Brand recognition"],
          weaknesses: ["Limited features", "High cost", "Poor user experience"],
          marketShare: "60%",
          pricing: "Subscription-based, $50-200/month",
          funding: "$10M+",
          revenue: "$5M+ annually",
          employees: "50-200",
          founded: "2015-2020",
          headquarters: "San Francisco, CA",
          keyFeatures: ["Basic functionality", "Mobile app", "Cloud storage"],
          customerReviews: "3.2/5 stars - mixed reviews"
        }
      ],
      marketTrends: [
        {
          trend: "Digital Transformation",
          description: "Rapid adoption of digital solutions across industries",
          impact: "Increased demand for innovative tools",
          timeline: "2024-2026",
          dataSource: "Industry reports",
          marketValue: "$1.2T",
          adoptionRate: "78%"
        }
      ],
      opportunities: [
        {
          opportunity: "AI Integration",
          description: "Leveraging AI to enhance user experience",
          potential: "$100M market opportunity",
          difficulty: "7/10",
          timeline: "6-12 months",
          resources: "AI development team",
          competition: "Moderate competition"
        }
      ],
      customerPersonas: [
        {
          name: "Tech-Savvy Professional",
          age: "28-40",
          profession: "Software Engineer/Product Manager",
          painPoints: ["Time management", "Tool complexity", "Integration issues"],
          goals: ["Increase productivity", "Streamline workflows", "Save time"],
          behaviors: "Researches tools online, reads reviews",
          budget: "$100-500/month",
          influence: "High - makes purchasing decisions"
        }
      ],
      positioning: {
        valueProposition: `A modern, intuitive solution for ${idea.toLowerCase()} that saves time and increases productivity`,
        differentiation: "User-friendly interface, AI-powered features, competitive pricing",
        brandPositioning: "The smart choice for professionals who value efficiency",
        messaging: "Simple, powerful, and affordable"
      },
      revenueModel: {
        primary: "Subscription-based SaaS model",
        secondary: "Premium features and enterprise plans",
        pricingStrategy: "Freemium with tiered pricing",
        projections: {
          year1: "$100K ARR",
          year2: "$500K ARR",
          year3: "$2M ARR"
        },
        unitEconomics: {
          customerAcquisitionCost: "$50",
          lifetimeValue: "$1,200",
          grossMargin: "85%"
        }
      },
      marketSize: {
        totalAddressableMarket: "$2.5B",
        serviceableAddressableMarket: "$500M",
        serviceableObtainableMarket: "$50M",
        dataSources: ["Industry reports", "Market research", "Competitor analysis"]
      },
      goToMarket: {
        strategy: "Digital-first approach with content marketing",
        channels: ["Social media", "Content marketing", "Partnerships"],
        timeline: "6-month launch plan",
        budget: "$50K initial investment",
        metrics: "Customer acquisition cost, conversion rate, churn rate"
      },
      risks: [
        {
          risk: "Market Competition",
          description: "Intense competition from established players",
          probability: "8/10",
          impact: "7/10",
          mitigation: "Focus on unique value proposition and customer experience"
        }
      ]
    };
  }

  async generateTechnicalBlueprint(idea: string, marketAnalysis: MarketAnalysis, context?: any): Promise<TechnicalBlueprint> {
    // Extract the actual business concept from the idea
    const businessConcept = idea.replace(/create a blueprint for/i, '').replace(/blueprint/i, '').trim();
    
    const prompt = `Create a modern technical blueprint for an AI fintech startup.

Use these specific modern technologies:
- Frontend: Next.js 14+ with TypeScript, Tailwind CSS, React Query
- Backend: Node.js with Express/Fastify, or Python with FastAPI/Django
- Database: PostgreSQL with Redis for caching
- AI/ML: Python with TensorFlow/PyTorch, or use AI APIs like OpenAI/Anthropic
- Infrastructure: AWS/GCP with Docker, Kubernetes
- Security: OAuth 2.0, JWT, encryption, PCI compliance
- Monitoring: Prometheus, Grafana, DataDog

Focus on fintech-specific requirements:
- Real-time data processing
- Financial data security and compliance
- Payment processing integration
- Fraud detection systems
- Regulatory compliance (PCI DSS, SOX, etc.)

For the business concept "${businessConcept}", provide:

SYSTEM ARCHITECTURE:
- SPECIFIC architecture pattern (microservices, serverless, etc.) for this business
- DETAILED component breakdown with real technologies
- DATA FLOW specific to this application's needs
- INTEGRATION points with external services this business needs

TECHNOLOGY STACK (2024-2025 MODERN STACK):
- FRONTEND: Latest React/Next.js, Vue, or modern framework
- BACKEND: Node.js, Python, Go, or Rust with specific frameworks
- DATABASE: PostgreSQL, MongoDB, or modern database with reasoning
- INFRASTRUCTURE: AWS, GCP, or Azure with specific services
- DEVOPS: Docker, Kubernetes, CI/CD with modern tools
- MONITORING: Modern observability stack
- SECURITY: Latest security practices and tools

API DESIGN:
- SPECIFIC endpoints this business actually needs
- REAL request/response schemas
- AUTHENTICATION strategy for this use case
- RATE LIMITING and security measures

DATABASE ARCHITECTURE:
- SPECIFIC schema design for this business domain
- SCALING strategy for this data model
- BACKUP and disaster recovery plan
- PERFORMANCE optimization techniques

SECURITY IMPLEMENTATION:
- SPECIFIC security measures for this business type
- COMPLIANCE requirements (GDPR, HIPAA, etc.) if applicable
- DATA PROTECTION strategies
- VULNERABILITY management

PERFORMANCE & SCALABILITY:
- SPECIFIC performance targets for this application
- SCALING strategies for this business model
- CACHING strategies
- CDN and optimization techniques

DEPLOYMENT & DEVOPS:
- MODERN CI/CD pipeline
- CONTAINERIZATION strategy
- INFRASTRUCTURE as code
- ENVIRONMENT management

MONITORING & OBSERVABILITY:
- MODERN monitoring stack (Prometheus, Grafana, etc.)
- LOGGING strategy
- ALERTING setup
- PERFORMANCE monitoring

COST OPTIMIZATION:
- SPECIFIC cost optimization strategies for this business
- BUDGET estimates for different scales
- RESOURCE optimization techniques

Format as JSON with this comprehensive structure:
{
  "architecture": {
    "overview": "High-level system architecture description",
    "pattern": "Microservices/Monolith/Serverless",
    "components": [
      {
        "name": "component name",
        "description": "what it does",
        "technology": "tech stack used",
        "scaling": "how it scales"
      }
    ],
    "dataFlow": "how data flows through the system",
    "integration": "external integrations and APIs"
  },
  "techStack": [
    {
      "category": "Frontend/Backend/Database/Infrastructure",
      "name": "Technology name",
      "version": "Version number",
      "rationale": "Detailed rationale for choosing this technology",
      "alternatives": ["alternative1", "alternative2"],
      "pros": ["pro1", "pro2", "pro3"],
      "cons": ["con1", "con2"],
      "learningCurve": "Easy/Medium/Hard",
      "community": "Community size and support",
      "documentation": "Quality of documentation"
    }
  ],
  "apiDesign": [
    {
      "endpoint": "/api/endpoint",
      "method": "GET/POST/PUT/DELETE",
      "description": "Detailed description of what this endpoint does",
      "requestSchema": "Detailed request body structure",
      "responseSchema": "Detailed response structure",
      "authentication": "Required authentication method",
      "rateLimit": "Rate limiting rules",
      "versioning": "API versioning strategy",
      "examples": {
        "request": "example request",
        "response": "example response"
      }
    }
  ],
  "databaseSchema": {
    "overview": "Database architecture overview",
    "tables": [
      {
        "name": "table_name",
        "description": "what this table stores",
        "columns": [
          {
            "name": "column_name",
            "type": "data type",
            "constraints": "constraints",
            "description": "what this column stores"
          }
        ],
        "indexes": ["index1", "index2"],
        "relationships": "relationships to other tables"
      }
    ],
    "scaling": "Database scaling strategy",
    "backup": "Backup and recovery strategy",
    "migrations": "Database migration strategy"
  },
  "security": {
    "authentication": "Authentication strategy",
    "authorization": "Authorization model",
    "dataEncryption": "Data encryption at rest and in transit",
    "apiSecurity": "API security measures",
    "vulnerabilityManagement": "Vulnerability management process",
    "compliance": "Compliance requirements (GDPR, SOC2, etc.)"
  },
  "performance": {
    "optimization": "Performance optimization strategies",
    "caching": "Caching strategy",
    "cdn": "CDN implementation",
    "loadBalancing": "Load balancing strategy",
    "monitoring": "Performance monitoring tools"
  },
  "deployment": {
    "strategy": "Deployment strategy",
    "infrastructure": "Infrastructure requirements",
    "ciCd": "CI/CD pipeline description",
    "environments": ["development", "staging", "production"],
    "scaling": "Auto-scaling configuration",
    "disasterRecovery": "Disaster recovery plan"
  },
  "monitoring": {
    "tools": ["tool1", "tool2", "tool3"],
    "metrics": "Key metrics to monitor",
    "alerting": "Alerting strategy",
    "logging": "Logging strategy",
    "observability": "Observability implementation"
  },
  "costOptimization": {
    "infrastructure": "Infrastructure cost optimization",
    "licensing": "Software licensing costs",
    "scaling": "Cost-effective scaling strategies",
    "budget": "Estimated monthly costs"
  }
}`;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Technical blueprint generation failed:', error);
      // Return fallback data
      return {
        architecture: {
          overview: "Modern web application with React frontend and Node.js backend",
          pattern: "Microservices architecture",
          components: [
            {
              name: "Frontend",
              description: "React-based user interface",
              technology: "Next.js",
              scaling: "Horizontal scaling with CDN"
            },
            {
              name: "Backend",
              description: "API server and business logic",
              technology: "Node.js",
              scaling: "Container-based scaling"
            }
          ],
          dataFlow: "RESTful API communication",
          integration: "Third-party service integration"
        },
        techStack: [
          {
            category: "Frontend",
            name: "React",
            version: "18.x",
            rationale: "Popular, well-supported framework with great ecosystem"
          },
          {
            category: "Backend",
            name: "Node.js",
            version: "18.x",
            rationale: "JavaScript full-stack consistency and large package ecosystem"
          }
        ],
        apiDesign: [
          {
            endpoint: "/api/data",
            method: "GET",
            description: "Retrieve application data",
            requestSchema: undefined,
            responseSchema: "DataResponse"
          }
        ],
        databaseSchema: {
          overview: "PostgreSQL with optimized tables for the application needs",
          tables: [
            {
              name: "users",
              description: "User account information",
              columns: [
                {
                  name: "id",
                  type: "UUID",
                  constraints: "PRIMARY KEY",
                  description: "Unique user identifier"
                },
                {
                  name: "email",
                  type: "VARCHAR(255)",
                  constraints: "UNIQUE NOT NULL",
                  description: "User email address"
                }
              ],
              indexes: ["idx_users_email"],
              relationships: "One-to-many with blueprints"
            }
          ],
          scaling: "Read replicas and connection pooling",
          backup: "Daily automated backups",
          migrations: "Version-controlled schema changes"
        }
      };
    }
  }

  async generateImplementationPlan(
    idea: string, 
    technicalBlueprint: TechnicalBlueprint,
    context?: any
  ): Promise<ImplementationPlan> {
    // Extract the actual business concept from the idea
    const businessConcept = idea.replace(/create a blueprint for/i, '').replace(/blueprint/i, '').trim();
    
    const prompt = `
    Create a detailed 4-week implementation plan for the following startup:

    Idea: ${idea}
    Technical Blueprint: ${JSON.stringify(technicalBlueprint, null, 2)}

    Please provide a comprehensive implementation plan in JSON format:
    {
      "totalWeeks": 4,
      "sprints": [
        {
          "week": 1,
          "title": "Sprint title",
          "description": "What this sprint accomplishes",
          "tasks": [
            {
              "id": "task-1",
              "title": "Task title",
              "description": "Detailed task description",
              "estimatedHours": 8,
              "priority": "HIGH/MEDIUM/LOW/CRITICAL",
              "dependencies": ["task-id-if-any"]
            }
          ],
          "deliverables": ["deliverable1", "deliverable2"]
        }
      ],
      "milestones": [
        {
          "week": 1,
          "title": "Milestone title",
          "description": "What this milestone represents",
          "criteria": ["criterion1", "criterion2"]
        }
      ],
      "deliverables": [
        {
          "name": "Deliverable name",
          "description": "What this deliverable contains",
          "type": "CODE/DOCUMENTATION/DESIGN/TEST/DEPLOYMENT",
          "week": 1
        }
      ]
    }

    Focus on:
    - Realistic 4-week timeline
    - Prioritized tasks with dependencies
    - Clear milestones and deliverables
    - MVP-focused approach
    `;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Implementation plan generation failed:', error);
      // Return fallback data
      return {
        totalWeeks: 4,
        sprints: [
          {
            week: 1,
            title: "Foundation & Setup",
            description: "Set up project structure and basic functionality",
            tasks: [
              {
                id: "1",
                title: "Project Setup",
                description: "Initialize project with necessary dependencies",
                estimatedHours: 8,
                priority: "HIGH",
                dependencies: []
              }
            ],
            deliverables: ["Project structure", "Basic functionality"]
          }
        ],
        milestones: [
          {
            week: 1,
            title: "MVP Foundation",
            description: "Basic application structure and core features",
            criteria: ["Project setup complete", "Basic functionality working"]
          }
        ],
        deliverables: [
          {
            name: "Core Application",
            description: "Basic application with essential features",
            type: "CODE",
            week: 1
          }
        ]
      };
    }
  }

  async generateCodeTemplates(
    idea: string,
    technicalBlueprint: TechnicalBlueprint,
    context?: any
  ): Promise<CodeTemplate[]> {
    const prompt = `
    Generate starter code templates for the following startup:

    Idea: ${idea}
    Technical Blueprint: ${JSON.stringify(technicalBlueprint, null, 2)}

    Please provide code templates in JSON format:
    {
      "templates": [
        {
          "name": "Template name",
          "description": "What this template provides",
          "language": "TypeScript/JavaScript/Python/etc",
          "framework": "Next.js/React/Express/etc",
          "repositoryUrl": "https://github.com/example/repo",
          "files": [
            {
              "path": "src/app/page.tsx",
              "content": "// Actual code content here",
              "description": "What this file does"
            }
          ]
        }
      ]
    }

    Focus on:
    - Complete starter projects
    - Best practices and modern patterns
    - Ready-to-run code
    - Essential features for MVP
    `;

    const response = await this.callAI(prompt, 6000);
    const parsed = JSON.parse(response);
    return parsed.templates || [];
  }

  async generateCompleteBlueprint(request: BlueprintGenerationRequest): Promise<GeneratedBlueprint> {
    try {
      console.log('Starting blueprint generation for:', request.title);
      
      // Step 0: Retrieve and enrich context using Python Retriever Agent
      console.log('🔍 Enriching query with Python Retriever Agent...');
      const retrieverResponse = await retrieverClient.enrichQuery(request.idea);
      const { enriched_query: enrichedQuery, context, processing_time } = retrieverResponse;
      console.log(`✅ Context enriched with confidence: ${(context.confidence * 100).toFixed(1)}% (${processing_time.toFixed(2)}s)`);
      
      // Step 1: Market Analysis
      console.log('Generating market analysis...');
      const marketAnalysis = await this.generateMarketAnalysis(enrichedQuery, request.title, context);
      
      // Step 2: Technical Blueprint
      console.log('Generating technical blueprint...');
      const technicalBlueprint = await this.generateTechnicalBlueprint(enrichedQuery, marketAnalysis, context);
      
      // Step 3: Implementation Plan
      console.log('Generating implementation plan...');
      const implementationPlan = await this.generateImplementationPlan(enrichedQuery, technicalBlueprint, context);
      
      // Step 4: Code Templates
      console.log('Generating code templates...');
      const codeTemplates = await this.generateCodeTemplates(enrichedQuery, technicalBlueprint, context);
      
      console.log('Blueprint generation completed successfully');
      
      return {
        marketAnalysis,
        technicalBlueprint,
        implementationPlan,
        codeTemplates
      };
    } catch (error) {
      console.error('Blueprint generation failed:', error);
      throw new Error('Failed to generate complete blueprint');
    }
  }
}

export const aiBlueprintGenerator = new AIBlueprintGenerator();
