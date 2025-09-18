// Retriever Agent - Enriches user queries with contextual information
export interface RetrievalContext {
  industry: string;
  marketTrends: string[];
  techStacks: string[];
  competitors: CompetitorInfo[];
  apis: ApiInfo[];
  regulations: string[];
  marketSize: MarketSizeInfo;
  userPersonas: UserPersona[];
  businessModels: string[];
  challenges: string[];
  opportunities: string[];
}

export interface CompetitorInfo {
  name: string;
  description: string;
  funding: string;
  marketShare: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  keyFeatures: string[];
}

export interface ApiInfo {
  name: string;
  description: string;
  category: string;
  pricing: string;
  documentation: string;
  popularity: number;
  useCases: string[];
}

export interface MarketSizeInfo {
  tam: string; // Total Addressable Market
  sam: string; // Serviceable Addressable Market
  som: string; // Serviceable Obtainable Market
  growthRate: string;
  keyDrivers: string[];
}

export interface UserPersona {
  name: string;
  description: string;
  painPoints: string[];
  goals: string[];
  budget: string;
  techSavviness: string;
  influence: string;
}

export class RetrieverAgent {
  private industryDatabase: Map<string, RetrievalContext> = new Map();
  
  constructor() {
    this.initializeIndustryDatabase();
  }

  // Main method to enrich user query with context
  async enrichQuery(userQuery: string): Promise<{
    enrichedQuery: string;
    context: RetrievalContext;
    confidence: number;
  }> {
    console.log('🔍 Retriever Agent: Analyzing query...', userQuery);
    
    // Extract industry and key concepts from query
    const analysis = this.analyzeQuery(userQuery);
    
    // Retrieve relevant context
    const context = await this.retrieveContext(analysis);
    
    // Enrich the query with context
    const enrichedQuery = this.enrichQueryWithContext(userQuery, context);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(analysis, context);
    
    console.log('✅ Retriever Agent: Context enriched', { 
      industry: analysis.industry,
      confidence,
      contextKeys: Object.keys(context).length
    });
    
    return {
      enrichedQuery,
      context,
      confidence
    };
  }

  // Analyze user query to extract key information
  private analyzeQuery(query: string): {
    industry: string;
    keywords: string[];
    businessType: string;
    targetAudience: string;
    complexity: 'simple' | 'medium' | 'complex';
  } {
    const queryLower = query.toLowerCase();
    
    // Industry detection
    const industry = this.detectIndustry(queryLower);
    
    // Extract keywords
    const keywords = this.extractKeywords(queryLower);
    
    // Determine business type
    const businessType = this.detectBusinessType(queryLower);
    
    // Determine target audience
    const targetAudience = this.detectTargetAudience(queryLower);
    
    // Assess complexity
    const complexity = this.assessComplexity(queryLower, keywords);
    
    return {
      industry,
      keywords,
      businessType,
      targetAudience,
      complexity
    };
  }

  // Detect industry from query
  private detectIndustry(query: string): string {
    const industryPatterns = {
      'fintech': ['fintech', 'financial', 'banking', 'payment', 'crypto', 'blockchain', 'trading', 'investment'],
      'healthcare': ['healthcare', 'medical', 'health', 'pharma', 'telemedicine', 'diagnosis', 'treatment'],
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
    };

    for (const [industry, patterns] of Object.entries(industryPatterns)) {
      if (patterns.some(pattern => query.includes(pattern))) {
        return industry;
      }
    }

    return 'general';
  }

  // Extract keywords from query
  private extractKeywords(query: string): string[] {
    const keywords = [];
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    const words = query.split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 2 && !commonWords.includes(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  // Detect business type
  private detectBusinessType(query: string): string {
    if (query.includes('startup') || query.includes('new business')) return 'startup';
    if (query.includes('platform') || query.includes('marketplace')) return 'platform';
    if (query.includes('app') || query.includes('application')) return 'app';
    if (query.includes('service') || query.includes('saas')) return 'service';
    if (query.includes('tool') || query.includes('software')) return 'tool';
    return 'business';
  }

  // Detect target audience
  private detectTargetAudience(query: string): string {
    if (query.includes('enterprise') || query.includes('b2b')) return 'enterprise';
    if (query.includes('consumer') || query.includes('b2c')) return 'consumer';
    if (query.includes('developer') || query.includes('technical')) return 'developer';
    if (query.includes('small business') || query.includes('sme')) return 'small_business';
    return 'general';
  }

  // Assess query complexity
  private assessComplexity(query: string, keywords: string[]): 'simple' | 'medium' | 'complex' {
    const complexityScore = keywords.length + (query.length > 100 ? 2 : 0);
    
    if (complexityScore <= 3) return 'simple';
    if (complexityScore <= 6) return 'medium';
    return 'complex';
  }

  // Retrieve context for the industry
  private async retrieveContext(analysis: any): Promise<RetrievalContext> {
    const industry = analysis.industry;
    
    // Check if we have cached context for this industry
    if (this.industryDatabase.has(industry)) {
      return this.industryDatabase.get(industry)!;
    }
    
    // For now, return mock data
    // Later: integrate with Supabase vector DB or external APIs
    return this.generateMockContext(industry, analysis);
  }

  // Generate mock context (to be replaced with real data sources)
  private generateMockContext(industry: string, analysis: any): RetrievalContext {
    const mockContexts = {
      fintech: {
        industry: 'fintech',
        marketTrends: [
          'Open banking adoption increasing 40% YoY',
          'AI-powered fraud detection becoming standard',
          'Cryptocurrency integration in traditional banking',
          'Real-time payment systems gaining traction',
          'Regulatory sandbox programs expanding globally'
        ],
        techStacks: [
          'React/Next.js for frontend',
          'Node.js/Python for backend',
          'PostgreSQL/MongoDB for data',
          'Redis for caching',
          'Docker for deployment',
          'AWS/Azure for cloud infrastructure',
          'Stripe/Plaid for payments',
          'Web3.js for blockchain integration'
        ],
        competitors: [
          {
            name: 'Stripe',
            description: 'Payment processing platform',
            funding: '$2.2B',
            marketShare: '15%',
            strengths: ['Developer-friendly', 'Global reach', 'Strong API'],
            weaknesses: ['High fees', 'Limited customization'],
            pricing: '2.9% + 30¢ per transaction',
            keyFeatures: ['Payment processing', 'Subscription billing', 'Marketplace payments']
          },
          {
            name: 'Plaid',
            description: 'Bank account connectivity platform',
            funding: '$734M',
            marketShare: '8%',
            strengths: ['Bank connections', 'Data security', 'Compliance'],
            weaknesses: ['Limited bank coverage', 'API complexity'],
            pricing: '$0.50-$2.00 per account',
            keyFeatures: ['Account verification', 'Transaction data', 'Identity verification']
          }
        ],
        apis: [
          {
            name: 'Stripe API',
            description: 'Payment processing and billing',
            category: 'Payments',
            pricing: '2.9% + 30¢ per transaction',
            documentation: 'https://stripe.com/docs',
            popularity: 95,
            useCases: ['Payment processing', 'Subscription billing', 'Marketplace payments']
          },
          {
            name: 'Plaid API',
            description: 'Bank account connectivity',
            category: 'Banking',
            pricing: '$0.50-$2.00 per account',
            documentation: 'https://plaid.com/docs',
            popularity: 85,
            useCases: ['Account verification', 'Transaction data', 'Identity verification']
          }
        ],
        regulations: [
          'PCI DSS compliance required',
          'GDPR for EU users',
          'SOX compliance for public companies',
          'AML/KYC requirements',
          'State money transmitter licenses'
        ],
        marketSize: {
          tam: '$12.6T',
          sam: '$1.2T',
          som: '$120B',
          growthRate: '15% annually',
          keyDrivers: ['Digital transformation', 'Mobile payments', 'Open banking']
        },
        userPersonas: [
          {
            name: 'Tech-Savvy Entrepreneur',
            description: 'Early-stage startup founder',
            painPoints: ['Complex compliance', 'High transaction fees', 'Integration complexity'],
            goals: ['Fast market entry', 'Scalable solution', 'Cost efficiency'],
            budget: '$10K-50K monthly',
            techSavviness: 'High',
            influence: 'Decision maker'
          }
        ],
        businessModels: [
          'Transaction-based fees',
          'Subscription SaaS',
          'Freemium with premium features',
          'Marketplace commission',
          'White-label solutions'
        ],
        challenges: [
          'Regulatory compliance complexity',
          'High customer acquisition costs',
          'Security and fraud prevention',
          'Integration with legacy systems',
          'Competition from incumbents'
        ],
        opportunities: [
          'Open banking initiatives',
          'Cryptocurrency integration',
          'AI-powered fraud detection',
          'Real-time payment systems',
          'Cross-border payments'
        ]
      },
      // Add more industries as needed
      general: {
        industry: 'general',
        marketTrends: ['Digital transformation accelerating', 'AI adoption increasing', 'Remote work becoming standard'],
        techStacks: ['React/Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        competitors: [],
        apis: [],
        regulations: ['GDPR compliance', 'Data protection laws'],
        marketSize: { tam: '$1T', sam: '$100B', som: '$10B', growthRate: '10%', keyDrivers: ['Digital adoption'] },
        userPersonas: [],
        businessModels: ['SaaS', 'Marketplace', 'Subscription'],
        challenges: ['Competition', 'Customer acquisition', 'Technology complexity'],
        opportunities: ['Digital transformation', 'AI integration', 'Market expansion']
      }
    };

    return mockContexts[industry as keyof typeof mockContexts] || mockContexts.general;
  }

  // Enrich query with context
  private enrichQueryWithContext(originalQuery: string, context: RetrievalContext): string {
    const enrichedQuery = `
CONTEXT-ENRICHED QUERY:

Original Query: "${originalQuery}"

INDUSTRY CONTEXT: ${context.industry.toUpperCase()}

MARKET TRENDS:
${context.marketTrends.map(trend => `- ${trend}`).join('\n')}

RECOMMENDED TECH STACK:
${context.techStacks.map(tech => `- ${tech}`).join('\n')}

KEY COMPETITORS:
${context.competitors.map(comp => `- ${comp.name}: ${comp.description} (${comp.funding} funding, ${comp.marketShare} market share)`).join('\n')}

RELEVANT APIs:
${context.apis.map(api => `- ${api.name}: ${api.description} (${api.pricing})`).join('\n')}

REGULATORY CONSIDERATIONS:
${context.regulations.map(reg => `- ${reg}`).join('\n')}

MARKET SIZE:
- TAM: ${context.marketSize.tam}
- SAM: ${context.marketSize.sam}
- SOM: ${context.marketSize.som}
- Growth Rate: ${context.marketSize.growthRate}

TARGET USER PERSONAS:
${context.userPersonas.map(persona => `- ${persona.name}: ${persona.description}`).join('\n')}

BUSINESS MODELS:
${context.businessModels.map(model => `- ${model}`).join('\n')}

KEY CHALLENGES:
${context.challenges.map(challenge => `- ${challenge}`).join('\n')}

OPPORTUNITIES:
${context.opportunities.map(opportunity => `- ${opportunity}`).join('\n')}

ENRICHED PROMPT:
Based on the above context, create a comprehensive business blueprint for: "${originalQuery}"

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
    `.trim();

    return enrichedQuery;
  }

  // Calculate confidence score
  private calculateConfidence(analysis: any, context: RetrievalContext): number {
    let confidence = 0.5; // Base confidence
    
    // Industry detection confidence
    if (analysis.industry !== 'general') confidence += 0.2;
    
    // Keyword richness
    if (analysis.keywords.length > 3) confidence += 0.1;
    if (analysis.keywords.length > 6) confidence += 0.1;
    
    // Context completeness
    if (context.competitors.length > 0) confidence += 0.1;
    if (context.apis.length > 0) confidence += 0.1;
    
    // Query complexity
    if (analysis.complexity === 'complex') confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  // Initialize industry database with mock data
  private initializeIndustryDatabase() {
    // This will be populated with real data from Supabase or external APIs
    console.log('📚 Retriever Agent: Initializing industry database...');
  }

  // Method to add new industry context (for future use)
  async addIndustryContext(industry: string, context: RetrievalContext) {
    this.industryDatabase.set(industry, context);
    console.log(`📚 Retriever Agent: Added context for ${industry} industry`);
  }

  // Method to get available industries
  getAvailableIndustries(): string[] {
    return Array.from(this.industryDatabase.keys());
  }
}

// Export singleton instance
export const retrieverAgent = new RetrieverAgent();
