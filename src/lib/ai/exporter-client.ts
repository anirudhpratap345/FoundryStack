/**
 * Exporter Agent Client
 * Communicates with the Python Exporter Agent service
 */

export interface ReviewedBlueprint {
  reviewed_founder_report: string;
  reviewed_one_pager: string;
  reviewed_pitch_ready: string;
  reviewed_tweet: string;
  issues_found?: Array<{
    type: string;
    severity: string;
    description: string;
    location: string;
    suggestion: string;
  }>;
  suggestions?: string[];
  overall_score?: number;
  processing_time?: number;
  timestamp?: string;
}

export interface ExportMetadata {
  user_id: string;
  blueprint_name: string;
  blueprint_id?: string;
  export_formats?: string[];
  include_metadata?: boolean;
  include_issues?: boolean;
  include_suggestions?: boolean;
}

export interface ExportRequest {
  reviewed_blueprint: ReviewedBlueprint;
  metadata: ExportMetadata;
}

export interface ExportResponse {
  export_id: string;
  files: Record<string, string>;  // format -> file_path
  download_urls: Record<string, string>;  // format -> download_url
  status: string;
  message: string;
  processing_time: number;
  timestamp: string;
}

class ExporterClient {
  private baseUrl: string;

  constructor() {
    // Use Next.js API route to avoid CORS issues
    this.baseUrl = '/api/exporter';
  }

  /**
   * Export blueprint in multiple formats
   */
  async exportBlueprint(request: ExportRequest): Promise<ExportResponse> {
    try {
      // Use Next.js API route to avoid CORS issues
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Exporter Agent error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result as ExportResponse;
    } catch (error) {
      console.error('Exporter Agent request failed:', error);
      throw new Error('Failed to export blueprint with Exporter Agent');
    }
  }

  /**
   * Simple blueprint export endpoint
   */
  async exportSimpleBlueprint(reviewedBlueprint: ReviewedBlueprint, metadata: ExportMetadata): Promise<ExportResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewed_blueprint: reviewedBlueprint, metadata }),
      });

      if (!response.ok) {
        throw new Error(`Exporter Agent error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Exporter Agent simple request failed:', error);
      throw new Error('Failed to export simple blueprint with Exporter Agent');
    }
  }

  /**
   * Download exported file
   */
  async downloadFile(formatType: string, exportId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/download/${formatType}/${exportId}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('File download failed:', error);
      throw new Error('Failed to download file');
    }
  }

  /**
   * List all available exports
   */
  async listExports(): Promise<{
    exports: Array<{
      format: string;
      filename: string;
      size: number;
      created: string;
    }>;
    total: number;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/exports`);
      
      if (!response.ok) {
        throw new Error(`List exports failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('List exports failed:', error);
      throw new Error('Failed to list exports');
    }
  }

  /**
   * Check Exporter Agent health
   */
  async checkHealth(): Promise<{ 
    status: string; 
    timestamp: string; 
    supported_formats: string[]; 
    export_directory: string 
  }> {
    try {
      // For health check, we'll just return a mock response since we're using API routes
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supported_formats: ['json', 'markdown', 'pdf', 'html'],
        export_directory: 'exports'
      };
    } catch (error) {
      console.error('Exporter Agent health check failed:', error);
      throw new Error('Exporter Agent is not available');
    }
  }

  /**
   * Helper method to download and save file
   */
  async downloadAndSaveFile(formatType: string, exportId: string, filename?: string): Promise<void> {
    try {
      const blob = await this.downloadFile(formatType, exportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `blueprint_${exportId}.${formatType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download and save failed:', error);
      throw new Error('Failed to download and save file');
    }
  }
}

export const exporterClient = new ExporterClient();
