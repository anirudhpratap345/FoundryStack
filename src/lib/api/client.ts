// Simple API client for REST endpoints

const API_BASE = '/api';

export interface Blueprint {
  id: string;
  title: string;
  description: string;
  idea?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  marketAnalysis?: any;
  technicalBlueprint?: any;
  implementationPlan?: any;
  codeTemplates?: any[];
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
export async function regenerateBlueprint(id: string): Promise<Blueprint> {
  const response = await fetch(`${API_BASE}/blueprints/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to regenerate blueprint: ${response.statusText}`);
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
  markdown += `**Created:** ${new Date(blueprint.createdAt).toLocaleDateString()}\n\n`;
  
  if (blueprint.marketAnalysis) {
    markdown += `## Market Analysis\n\n`;
    markdown += `**Target Market:** ${blueprint.marketAnalysis.targetMarket}\n\n`;
    markdown += `**Positioning:** ${blueprint.marketAnalysis.positioning}\n\n`;
    markdown += `**Revenue Model:** ${blueprint.marketAnalysis.revenueModel}\n\n`;
    markdown += `**Market Size:** ${blueprint.marketAnalysis.marketSize}\n\n`;
    
    if (blueprint.marketAnalysis.competition && blueprint.marketAnalysis.competition.length > 0) {
      markdown += `### Competition\n\n`;
      blueprint.marketAnalysis.competition.forEach(comp => {
        markdown += `- **${comp.name}:** ${comp.description}\n`;
      });
      markdown += `\n`;
    }
  }
  
  if (blueprint.technicalBlueprint) {
    markdown += `## Technical Blueprint\n\n`;
    markdown += `**Architecture:** ${blueprint.technicalBlueprint.architecture}\n\n`;
    markdown += `**Database Schema:** ${blueprint.technicalBlueprint.databaseSchema}\n\n`;
    markdown += `**Deployment Strategy:** ${blueprint.technicalBlueprint.deploymentStrategy}\n\n`;
    
    if (blueprint.technicalBlueprint.techStack && blueprint.technicalBlueprint.techStack.length > 0) {
      markdown += `### Tech Stack\n\n`;
      blueprint.technicalBlueprint.techStack.forEach(tech => {
        markdown += `- **${tech.category}:** ${tech.name} ${tech.version} - ${tech.rationale}\n`;
      });
      markdown += `\n`;
    }
  }
  
  if (blueprint.implementationPlan) {
    markdown += `## Implementation Plan\n\n`;
    markdown += `**Total Duration:** ${blueprint.implementationPlan.totalWeeks} weeks\n\n`;
    
    if (blueprint.implementationPlan.sprints && blueprint.implementationPlan.sprints.length > 0) {
      markdown += `### Sprints\n\n`;
      blueprint.implementationPlan.sprints.forEach(sprint => {
        markdown += `#### Week ${sprint.week}: ${sprint.title}\n\n`;
        markdown += `${sprint.description}\n\n`;
        if (sprint.tasks && sprint.tasks.length > 0) {
          markdown += `**Tasks:**\n`;
          sprint.tasks.forEach(task => {
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
