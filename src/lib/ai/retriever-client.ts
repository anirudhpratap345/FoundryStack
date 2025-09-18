// Python Retriever Agent Client
// Connects to the Python FastAPI service for context enrichment

export interface PythonRetrieverResponse {
  success: boolean;
  original_query: string;
  enriched_query: string;
  context: {
    industry: string;
    market_trends: string[];
    tech_stacks: string[];
    competitors: CompetitorInfo[];
    apis: ApiInfo[];
    regulations: string[];
    market_size: MarketSizeInfo;
    user_personas: UserPersona[];
    business_models: string[];
    challenges: string[];
    opportunities: string[];
  };
  analysis: {
    industry: string;
    keywords: string[];
    business_type: string;
    target_audience: string;
    complexity: string;
  };
  confidence: number;
  processing_time: number;
  timestamp: string;
}

export interface CompetitorInfo {
  name: string;
  description: string;
  funding: string;
  market_share: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  key_features: string[];
}

export interface ApiInfo {
  name: string;
  description: string;
  category: string;
  pricing: string;
  documentation: string;
  popularity: number;
  use_cases: string[];
}

export interface MarketSizeInfo {
  tam: string;
  sam: string;
  som: string;
  growth_rate: string;
  key_drivers: string[];
}

export interface UserPersona {
  name: string;
  description: string;
  pain_points: string[];
  goals: string[];
  budget: string;
  tech_savviness: string;
  influence: string;
}

export class PythonRetrieverClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8000', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async enrichQuery(query: string): Promise<PythonRetrieverResponse> {
    try {
      console.log('🐍 Python Retriever: Sending query to Python service...', query);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/enrich`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Python Retriever API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      console.log('✅ Python Retriever: Query enriched successfully', {
        industry: result.analysis.industry,
        confidence: result.confidence,
        processingTime: result.processing_time
      });

      return result;
    } catch (error) {
      console.error('❌ Python Retriever: Failed to enrich query', error);
      
      // Fallback to basic enrichment if Python service is unavailable
      return this.getFallbackResponse(query);
    }
  }

  async getAvailableIndustries(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/industries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch industries: ${response.status}`);
      }

      const result = await response.json();
      return result.industries || [];
    } catch (error) {
      console.error('Failed to fetch available industries:', error);
      return ['fintech', 'healthcare', 'general'];
    }
  }

  async getIndustryContext(industry: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/context/${industry}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch context for ${industry}: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch context for ${industry}:`, error);
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Python Retriever health check failed:', error);
      return false;
    }
  }

  private getFallbackResponse(query: string): PythonRetrieverResponse {
    console.log('🔄 Using fallback response for query:', query);
    
    // Basic industry detection
    const industry = this.detectIndustryFallback(query);
    
    return {
      success: true,
      original_query: query,
      enriched_query: `CONTEXT-ENRICHED QUERY:\n\nOriginal Query: "${query}"\n\nINDUSTRY CONTEXT: ${industry.toUpperCase()}\n\nThis is a fallback response. The Python Retriever service is currently unavailable.`,
      context: {
        industry,
        market_trends: ['Digital transformation accelerating', 'AI adoption increasing'],
        tech_stacks: ['React/Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        competitors: [],
        apis: [],
        regulations: ['GDPR compliance', 'Data protection laws'],
        market_size: {
          tam: '$1T',
          sam: '$100B',
          som: '$10B',
          growth_rate: '10%',
          key_drivers: ['Digital adoption']
        },
        user_personas: [],
        business_models: ['SaaS', 'Marketplace', 'Subscription'],
        challenges: ['Competition', 'Customer acquisition', 'Technology complexity'],
        opportunities: ['Digital transformation', 'AI integration', 'Market expansion']
      },
      analysis: {
        industry,
        keywords: query.toLowerCase().split(' ').filter(word => word.length > 3),
        business_type: 'startup',
        target_audience: 'general',
        complexity: 'medium'
      },
      confidence: 0.3,
      processing_time: 0.1,
      timestamp: new Date().toISOString()
    };
  }

  private detectIndustryFallback(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('fintech') || queryLower.includes('financial') || queryLower.includes('banking')) {
      return 'fintech';
    }
    if (queryLower.includes('healthcare') || queryLower.includes('medical') || queryLower.includes('health')) {
      return 'healthcare';
    }
    if (queryLower.includes('ecommerce') || queryLower.includes('retail')) {
      return 'ecommerce';
    }
    
    return 'general';
  }
}

// Export singleton instance
export const retrieverClient = new PythonRetrieverClient();
