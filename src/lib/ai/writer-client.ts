/**
 * Writer Agent Client
 * Communicates with the Python Writer Agent service
 */

export interface WriterRequest {
  idea: string;
  structured_analysis: Record<string, any>;
  user_context?: Record<string, any>;
}

export interface WriterResponse {
  founder_report: string;
  one_pager: string;
  pitch_ready: string;
  tweet: string;
  processing_time: number;
  timestamp: string;
}

class WriterClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.WRITER_AGENT_URL || 'http://localhost:8003';
  }

  /**
   * Generate founder-friendly content in multiple formats
   */
  async generateContent(request: WriterRequest): Promise<WriterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Writer Agent error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Writer Agent request failed:', error);
      throw new Error('Failed to generate content from Writer Agent');
    }
  }

  /**
   * Simple content generation endpoint
   */
  async generateSimpleContent(idea: string, analysis: Record<string, any>): Promise<WriterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/write/simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea, analysis }),
      });

      if (!response.ok) {
        throw new Error(`Writer Agent error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Writer Agent simple request failed:', error);
      throw new Error('Failed to generate simple content from Writer Agent');
    }
  }

  /**
   * Check Writer Agent health
   */
  async checkHealth(): Promise<{ status: string; timestamp: string; templates: number; supported_industries: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Writer Agent health check failed:', error);
      throw new Error('Writer Agent is not available');
    }
  }
}

export const writerClient = new WriterClient();
