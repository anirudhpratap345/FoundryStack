/**
 * Reviewer Agent Client
 * Communicates with the Python Reviewer Agent service
 */

export interface WriterOutput {
  founder_report: string;
  one_pager: string;
  pitch_ready: string;
  tweet: string;
  processing_time?: number;
  timestamp?: string;
}

export interface Issue {
  type: 'technical' | 'security' | 'clarity' | 'feasibility' | 'completeness';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  suggestion: string;
}

export interface ReviewRequest {
  writer_output: WriterOutput;
  original_query?: string;
  user_context?: Record<string, any>;
}

export interface ReviewResponse {
  reviewed_founder_report: string;
  reviewed_one_pager: string;
  reviewed_pitch_ready: string;
  reviewed_tweet: string;
  issues_found: Issue[];
  suggestions: string[];
  overall_score: number;
  processing_time: number;
  timestamp: string;
}

class ReviewerClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REVIEWER_AGENT_URL || 'http://localhost:8004';
  }

  /**
   * Review and improve AI-generated blueprint
   */
  async reviewBlueprint(request: ReviewRequest): Promise<ReviewResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Reviewer Agent error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Reviewer Agent request failed:', error);
      throw new Error('Failed to review blueprint with Reviewer Agent');
    }
  }

  /**
   * Simple blueprint review endpoint
   */
  async reviewSimpleBlueprint(writerOutput: WriterOutput): Promise<ReviewResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/review/simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(writerOutput),
      });

      if (!response.ok) {
        throw new Error(`Reviewer Agent error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Reviewer Agent simple request failed:', error);
      throw new Error('Failed to review simple blueprint with Reviewer Agent');
    }
  }

  /**
   * Check Reviewer Agent health
   */
  async checkHealth(): Promise<{ 
    status: string; 
    timestamp: string; 
    capabilities: string[]; 
    supported_industries: string[] 
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Reviewer Agent health check failed:', error);
      throw new Error('Reviewer Agent is not available');
    }
  }
}

export const reviewerClient = new ReviewerClient();
