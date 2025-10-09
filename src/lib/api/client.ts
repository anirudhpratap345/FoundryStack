// Simple API client for REST endpoints

const API_BASE = '/api';

export interface Blueprint {
  id: string;
  title: string;
  description?: string;
  idea: string;
  market_analysis?: any;
  technical_blueprint?: any;
  implementation_plan?: any;
  code_templates?: any[];
  status: 'PENDING' | 'IN_PROGRESS' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
  user_id?: string;
  tags?: string[];
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  estimated_duration?: string;
  complexity?: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  technologies?: string[];
  business_model?: string;
  target_audience?: string;
  revenue_streams?: string[];
  competitive_analysis?: string;
  risk_assessment?: string;
  success_metrics?: string[];
  next_steps?: string[];
  resources_needed?: string[];
  timeline?: string;
  budget_estimate?: string;
  team_requirements?: string[];
  technical_requirements?: string[];
  market_opportunity?: string;
  value_proposition?: string;
  go_to_market_strategy?: string;
  scalability_plan?: string;
  monetization_strategy?: string;
  partnerships?: string[];
  legal_considerations?: string;
  regulatory_compliance?: string;
  intellectual_property?: string;
  data_privacy?: string;
  security_requirements?: string;
  performance_metrics?: string[];
  user_feedback?: string[];
  iteration_history?: string[];
  version?: string;
  dependencies?: string[];
  integrations?: string[];
  api_requirements?: string[];
  database_requirements?: string[];
}

export interface BlueprintJob {
  id: string;
  blueprintId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  currentStep: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlueprintRequest {
  title: string;
  description: string;
  idea: string;
}

// Blueprint API functions
export async function getBlueprints(): Promise<Blueprint[]> {
  const response = await fetch(`${API_BASE}/blueprints`);
  if (!response.ok) {
    throw new Error(`Failed to fetch blueprints: ${response.statusText}`);
  }
  const data = await response.json();
  return data.blueprints;
}

export async function getBlueprint(id: string): Promise<Blueprint> {
  const response = await fetch(`${API_BASE}/blueprints/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Blueprint with ID ${id} not found`);
    }
    throw new Error(`Failed to fetch blueprint: ${response.statusText}`);
  }
  const data = await response.json();
  return data.blueprint;
}

export async function createBlueprint(input: CreateBlueprintRequest): Promise<Blueprint> {
  const response = await fetch(`${API_BASE}/blueprints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create blueprint: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateBlueprint(id: string, input: Partial<CreateBlueprintRequest & { status: string }>): Promise<Blueprint> {
  const response = await fetch(`${API_BASE}/blueprints/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update blueprint: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.blueprint;
}

export async function deleteBlueprint(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/blueprints/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete blueprint: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.success;
}

// Job API functions
export async function getBlueprintJob(blueprintId: string): Promise<BlueprintJob | null> {
  const response = await fetch(`${API_BASE}/blueprints/${blueprintId}/job`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch job status: ${response.statusText}`);
  }
  return response.json();
}

// Regenerate AI content for a blueprint
export async function regenerateBlueprint(id: string, prompt: string): Promise<Blueprint> {
  const response = await fetch(`${API_BASE}/blueprints/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: prompt })
  });
  
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Failed to regenerate blueprint: ${response.status} ${detail}`);
  }
  
  const data = await response.json();
  return data.blueprint; 
}


// Export blueprint as JSON
export function exportBlueprint(blueprint: Blueprint): void {
  const dataStr = JSON.stringify(blueprint, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `blueprint-${blueprint.title.toLowerCase().replace(/\s+/g, '-')}-${blueprint.id}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Export blueprint as Markdown
export function exportBlueprintAsMarkdown(blueprint: Blueprint): void {
  let markdown = `# ${blueprint.title}\n\n`;
  markdown += `**Description:** ${blueprint.description}\n\n`;
  markdown += `**Status:** ${blueprint.status}\n`;
  markdown += `**Created:** ${new Date(blueprint.created_at).toLocaleDateString()}\n\n`;

  if (blueprint.market_analysis) {
    markdown += `## Market Analysis\n\n`;
    markdown += `**Target Market:** ${blueprint.market_analysis.targetMarket}\n\n`;
    markdown += `**Positioning:** ${blueprint.market_analysis.positioning}\n\n`;
    markdown += `**Revenue Model:** ${blueprint.market_analysis.revenueModel}\n\n`;
    markdown += `**Market Size:** ${blueprint.market_analysis.marketSize}\n\n`;
    
    if (blueprint.market_analysis.competition && blueprint.market_analysis.competition.length > 0) {
      markdown += `### Competition\n\n`;
      blueprint.market_analysis.competition.forEach((comp: any) => {
        markdown += `- **${comp.name}:** ${comp.description}\n`;
      });
      markdown += `\n`;
    }
  }
  
  if (blueprint.technical_blueprint) {
    markdown += `## Technical Blueprint\n\n`;
    markdown += `**Architecture:** ${blueprint.technical_blueprint.architecture}\n\n`;
    markdown += `**Database Schema:** ${blueprint.technical_blueprint.databaseSchema}\n\n`;
    markdown += `**Deployment Strategy:** ${blueprint.technical_blueprint.deploymentStrategy}\n\n`;
    
    if (blueprint.technical_blueprint.techStack && blueprint.technical_blueprint.techStack.length > 0) {
      markdown += `### Tech Stack\n\n`;
      blueprint.technical_blueprint.techStack.forEach((tech: any) => {
        markdown += `- **${tech.category}:** ${tech.name} ${tech.version} - ${tech.rationale}\n`;
      });
      markdown += `\n`;
    }
  }
  
  if (blueprint.implementation_plan) {
    markdown += `## Implementation Plan\n\n`;
    markdown += `**Total Duration:** ${blueprint.implementation_plan.totalWeeks} weeks\n\n`;
    
    if (blueprint.implementation_plan.sprints && blueprint.implementation_plan.sprints.length > 0) {
      markdown += `### Sprints\n\n`;
      blueprint.implementation_plan.sprints.forEach((sprint: any) => {
        markdown += `#### Week ${sprint.week}: ${sprint.title}\n\n`;
        markdown += `${sprint.description}\n\n`;
        if (sprint.tasks && sprint.tasks.length > 0) {
          markdown += `**Tasks:**\n`;
          sprint.tasks.forEach((task: any) => {
            markdown += `- ${task.title} (${task.estimatedHours}h) - ${task.priority}\n`;
          });
          markdown += `\n`;
        }
      });
    }
  }
  
  const dataStr = markdown;
  const dataUri = 'data:text/markdown;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `blueprint-${blueprint.title.toLowerCase().replace(/\s+/g, '-')}-${blueprint.id}.md`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}
