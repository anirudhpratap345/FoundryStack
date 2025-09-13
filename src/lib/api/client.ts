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
