// Analyst Agent Client
// Connects to the Python Analyst Agent service for structured analysis

export interface AnalystRequest {
  query: string;
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

export interface ProblemAnalysis {
  core_problem: string;
  problem_breakdown: string[];
  target_audience: string;
  market_need: string;
  urgency_level: string;
  complexity_score: number;
}

export interface TechnicalAnalysis {
  recommended_tech: string[];
  architecture_pattern: string;
  scalability_approach: string;
  security_considerations: string[];
  integration_requirements: string[];
  performance_requirements: string[];
}

export interface BusinessAnalysis {
  business_model: string;
  revenue_streams: string[];
  pricing_strategy: string;
  go_to_market: string;
  competitive_advantage: string;
  market_positioning: string;
}

export interface RiskAnalysis {
  technical_risks: string[];
  market_risks: string[];
  regulatory_risks: string[];
  operational_risks: string[];
  mitigation_strategies: string[];
  risk_score: number;
}

export interface OpportunityAnalysis {
  market_opportunities: string[];
  technology_opportunities: string[];
  partnership_opportunities: string[];
  expansion_opportunities: string[];
  innovation_potential: string;
}

export interface StructuredAnalysis {
  problem_analysis: ProblemAnalysis;
  technical_analysis: TechnicalAnalysis;
  business_analysis: BusinessAnalysis;
  risk_analysis: RiskAnalysis;
  opportunity_analysis: OpportunityAnalysis;
  implementation_priority: string[];
  success_metrics: string[];
  timeline_estimate: string;
}

export interface AnalystResponse {
  success: boolean;
  query: string;
  analysis: StructuredAnalysis;
  confidence: number;
  processing_time: number;
  timestamp: string;
}

export class AnalystClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8002', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async analyzeContext(request: AnalystRequest): Promise<AnalystResponse> {
    try {
      console.log('🔍 Analyst Agent: Analyzing context...', request.query);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analyst Agent API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      console.log('✅ Analyst Agent: Analysis completed successfully', {
        query: result.query,
        confidence: result.confidence,
        processingTime: result.processing_time
      });

      return result;
    } catch (error) {
      console.error('❌ Analyst Agent: Failed to analyze context', error);
      
      // Fallback to basic analysis if Analyst service is unavailable
      return this.getFallbackAnalysis(request);
    }
  }

  async getAvailableTemplates(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }

      const result = await response.json();
      return result.templates || [];
    } catch (error) {
      console.error('Failed to fetch available templates:', error);
      return ['fintech', 'healthcare', 'general'];
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
      console.error('Analyst Agent health check failed:', error);
      return false;
    }
  }

  private getFallbackAnalysis(request: AnalystRequest): AnalystResponse {
    console.log('🔄 Using fallback analysis for query:', request.query);
    
    const industry = request.context.industry;
    
    return {
      success: true,
      query: request.query,
      analysis: {
        problem_analysis: {
          core_problem: `Technology solution addressing: ${request.query.replace('create a blueprint for', '').replace('blueprint', '').trim()}`,
          problem_breakdown: [
            'Market validation and product-market fit',
            'Customer acquisition and retention',
            'Technology scalability and performance'
          ],
          target_audience: request.context.user_personas[0]?.name || 'General business users',
          market_need: 'Growing market demand for digital solutions',
          urgency_level: 'Medium - Steady market growth',
          complexity_score: 5
        },
        technical_analysis: {
          recommended_tech: request.context.tech_stacks.slice(0, 5) || ['React/Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
          architecture_pattern: 'Modern web application with microservices for scalability',
          scalability_approach: 'Modular architecture with horizontal scaling capabilities',
          security_considerations: request.context.regulations.slice(0, 3) || ['Data encryption', 'Secure authentication', 'Regular security audits'],
          integration_requirements: ['RESTful API design', 'Third-party service integration', 'Data synchronization'],
          performance_requirements: ['Fast page load times', 'Scalable infrastructure', 'Reliable service delivery']
        },
        business_analysis: {
          business_model: request.context.business_models[0] || 'SaaS subscription model',
          revenue_streams: request.context.business_models.slice(0, 3) || ['Subscription fees', 'Premium features', 'Enterprise licensing'],
          pricing_strategy: 'Freemium model with tiered pricing',
          go_to_market: 'Direct sales and digital marketing',
          competitive_advantage: 'Innovative technology and superior user experience',
          market_positioning: 'Emerging player in market'
        },
        risk_analysis: {
          technical_risks: ['Technology scalability challenges', 'Integration complexity', 'Performance bottlenecks'],
          market_risks: ['High customer acquisition costs', 'Market competition', 'Economic downturns'],
          regulatory_risks: request.context.regulations.slice(0, 3) || ['Compliance requirements', 'Data protection laws', 'Industry regulations'],
          operational_risks: ['Resource constraints', 'Team scalability', 'Operational complexity'],
          mitigation_strategies: [
            'Implement robust testing and quality assurance',
            'Develop comprehensive risk management plan',
            'Establish regulatory compliance framework'
          ],
          risk_score: 5
        },
        opportunity_analysis: {
          market_opportunities: request.context.opportunities.slice(0, 3) || ['Market expansion', 'New customer segments', 'Product innovation'],
          technology_opportunities: ['AI/ML integration', 'Cloud-native architecture', 'API ecosystem development'],
          partnership_opportunities: ['Strategic partnerships', 'Technology integrations', 'Channel partnerships'],
          expansion_opportunities: ['Geographic expansion', 'Product line extension', 'Market vertical expansion'],
          innovation_potential: 'Medium - Multiple growth opportunities available'
        },
        implementation_priority: [
          '1. Market validation and MVP development',
          '2. Core technology stack implementation',
          '3. Security and compliance setup',
          '4. User interface and experience design',
          '5. Integration with third-party services'
        ],
        success_metrics: [
          'Monthly Active Users (MAU)',
          'Revenue growth rate',
          'Customer acquisition and retention',
          'Product-market fit score',
          'Operational efficiency metrics'
        ],
        timeline_estimate: '4-8 months for MVP, 8-12 months for full platform'
      },
      confidence: 0.3,
      processing_time: 0.1,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const analystClient = new AnalystClient();
