/**
 * Qdrant-based Blueprint Service
 * 
 * This service replaces the Supabase-based blueprint service with Qdrant
 * for storing and retrieving blueprint data. Since Qdrant is primarily
 * a vector database, we'll use it for the vector embeddings and metadata,
 * while keeping blueprint data in a simple JSON file or Redis for now.
 * 
 * For production, you might want to use a traditional database like
 * PostgreSQL alongside Qdrant for structured data.
 */

import { promises as fs } from 'fs';
import path from 'path';

// Types
export interface Blueprint {
  id: string;
  title: string;
  idea: string;
  description?: string;
  market_analysis?: string;
  technical_blueprint?: string;
  implementation_plan?: string;
  code_templates?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
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
  infrastructure_needs?: string[];
  deployment_strategy?: string;
  monitoring_setup?: string;
  maintenance_plan?: string;
  support_structure?: string;
  documentation_plan?: string;
  training_materials?: string[];
  quality_assurance?: string;
  testing_strategy?: string;
  launch_strategy?: string;
  post_launch_plan?: string;
  growth_strategy?: string;
  exit_strategy?: string;
}

export interface BlueprintInsert {
  title: string;
  idea: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
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
  infrastructure_needs?: string[];
  deployment_strategy?: string;
  monitoring_setup?: string;
  maintenance_plan?: string;
  support_structure?: string;
  documentation_plan?: string;
  training_materials?: string[];
  quality_assurance?: string;
  testing_strategy?: string;
  launch_strategy?: string;
  post_launch_plan?: string;
  growth_strategy?: string;
  exit_strategy?: string;
}

export interface BlueprintUpdate {
  title?: string;
  idea?: string;
  description?: string;
  market_analysis?: string;
  technical_blueprint?: string;
  implementation_plan?: string;
  code_templates?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
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
  infrastructure_needs?: string[];
  deployment_strategy?: string;
  monitoring_setup?: string;
  maintenance_plan?: string;
  support_structure?: string;
  documentation_plan?: string;
  training_materials?: string[];
  quality_assurance?: string;
  testing_strategy?: string;
  launch_strategy?: string;
  post_launch_plan?: string;
  growth_strategy?: string;
  exit_strategy?: string;
}

class QdrantBlueprintService {
  private dataDir: string;
  private blueprintsFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.blueprintsFile = path.join(this.dataDir, 'blueprints.json');
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  private async readBlueprints(): Promise<Blueprint[]> {
    try {
      const data = await fs.readFile(this.blueprintsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is empty, return empty array
      return [];
    }
  }

  private async writeBlueprints(blueprints: Blueprint[]): Promise<void> {
    try {
      await fs.writeFile(this.blueprintsFile, JSON.stringify(blueprints, null, 2));
    } catch (error) {
      console.error('Error writing blueprints:', error);
      throw new Error(`Failed to save blueprints: ${error}`);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Get all blueprints
  async getAll(): Promise<Blueprint[]> {
    try {
      const blueprints = await this.readBlueprints();
      return blueprints.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('Error fetching blueprints:', error);
      throw new Error(`Failed to fetch blueprints: ${error}`);
    }
  }

  // Get a single blueprint by ID
  async getById(id: string): Promise<Blueprint | null> {
    try {
      const blueprints = await this.readBlueprints();
      return blueprints.find(blueprint => blueprint.id === id) || null;
    } catch (error) {
      console.error('Error fetching blueprint:', error);
      throw new Error(`Failed to fetch blueprint: ${error}`);
    }
  }

  // Create a new blueprint
  async create(blueprint: BlueprintInsert): Promise<Blueprint> {
    try {
      console.log('Creating blueprint with data:', blueprint);
      
      const blueprints = await this.readBlueprints();
      
      const newBlueprint: Blueprint = {
        id: this.generateId(),
        title: blueprint.title,
        idea: blueprint.idea,
        description: blueprint.description,
        status: blueprint.status || 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: blueprint.user_id,
        tags: blueprint.tags || [],
        category: blueprint.category,
        priority: blueprint.priority || 'MEDIUM',
        estimated_duration: blueprint.estimated_duration,
        complexity: blueprint.complexity || 'MODERATE',
        technologies: blueprint.technologies || [],
        business_model: blueprint.business_model,
        target_audience: blueprint.target_audience,
        revenue_streams: blueprint.revenue_streams || [],
        competitive_analysis: blueprint.competitive_analysis,
        risk_assessment: blueprint.risk_assessment,
        success_metrics: blueprint.success_metrics || [],
        next_steps: blueprint.next_steps || [],
        resources_needed: blueprint.resources_needed || [],
        timeline: blueprint.timeline,
        budget_estimate: blueprint.budget_estimate,
        team_requirements: blueprint.team_requirements || [],
        technical_requirements: blueprint.technical_requirements || [],
        market_opportunity: blueprint.market_opportunity,
        value_proposition: blueprint.value_proposition,
        go_to_market_strategy: blueprint.go_to_market_strategy,
        scalability_plan: blueprint.scalability_plan,
        monetization_strategy: blueprint.monetization_strategy,
        partnerships: blueprint.partnerships || [],
        legal_considerations: blueprint.legal_considerations,
        regulatory_compliance: blueprint.regulatory_compliance,
        intellectual_property: blueprint.intellectual_property,
        data_privacy: blueprint.data_privacy,
        security_requirements: blueprint.security_requirements,
        performance_metrics: blueprint.performance_metrics || [],
        user_feedback: blueprint.user_feedback || [],
        iteration_history: blueprint.iteration_history || [],
        version: blueprint.version || '1.0',
        dependencies: blueprint.dependencies || [],
        integrations: blueprint.integrations || [],
        api_requirements: blueprint.api_requirements || [],
        database_requirements: blueprint.database_requirements || [],
        infrastructure_needs: blueprint.infrastructure_needs || [],
        deployment_strategy: blueprint.deployment_strategy,
        monitoring_setup: blueprint.monitoring_setup,
        maintenance_plan: blueprint.maintenance_plan,
        support_structure: blueprint.support_structure,
        documentation_plan: blueprint.documentation_plan,
        training_materials: blueprint.training_materials || [],
        quality_assurance: blueprint.quality_assurance,
        testing_strategy: blueprint.testing_strategy,
        launch_strategy: blueprint.launch_strategy,
        post_launch_plan: blueprint.post_launch_plan,
        growth_strategy: blueprint.growth_strategy,
        exit_strategy: blueprint.exit_strategy
      };

      blueprints.push(newBlueprint);
      await this.writeBlueprints(blueprints);

      console.log('Blueprint created successfully:', newBlueprint);
      return newBlueprint;
    } catch (error) {
      console.error('Error in BlueprintService.create:', error);
      throw error;
    }
  }

  // Update a blueprint
  async update(id: string, updates: BlueprintUpdate): Promise<Blueprint> {
    try {
      const blueprints = await this.readBlueprints();
      const index = blueprints.findIndex(blueprint => blueprint.id === id);

      if (index === -1) {
        throw new Error(`Blueprint with id ${id} not found`);
      }

      const updatedBlueprint = {
        ...blueprints[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      blueprints[index] = updatedBlueprint;
      await this.writeBlueprints(blueprints);

      console.log('Blueprint updated successfully:', updatedBlueprint);
      return updatedBlueprint;
    } catch (error) {
      console.error('Error updating blueprint:', error);
      throw new Error(`Failed to update blueprint: ${error}`);
    }
  }

  // Delete a blueprint
  async delete(id: string): Promise<boolean> {
    try {
      const blueprints = await this.readBlueprints();
      const index = blueprints.findIndex(blueprint => blueprint.id === id);

      if (index === -1) {
        return false;
      }

      blueprints.splice(index, 1);
      await this.writeBlueprints(blueprints);

      console.log('Blueprint deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('Error deleting blueprint:', error);
      throw new Error(`Failed to delete blueprint: ${error}`);
    }
  }

  // Search blueprints by title or idea
  async search(query: string): Promise<Blueprint[]> {
    try {
      const blueprints = await this.readBlueprints();
      const lowercaseQuery = query.toLowerCase();

      return blueprints.filter(blueprint => 
        blueprint.title.toLowerCase().includes(lowercaseQuery) ||
        blueprint.idea.toLowerCase().includes(lowercaseQuery) ||
        blueprint.description?.toLowerCase().includes(lowercaseQuery) ||
        blueprint.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        blueprint.technologies?.some(tech => tech.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching blueprints:', error);
      throw new Error(`Failed to search blueprints: ${error}`);
    }
  }

  // Get blueprints by status
  async getByStatus(status: Blueprint['status']): Promise<Blueprint[]> {
    try {
      const blueprints = await this.readBlueprints();
      return blueprints.filter(blueprint => blueprint.status === status);
    } catch (error) {
      console.error('Error fetching blueprints by status:', error);
      throw new Error(`Failed to fetch blueprints by status: ${error}`);
    }
  }

  // Get blueprints by user
  async getByUser(userId: string): Promise<Blueprint[]> {
    try {
      const blueprints = await this.readBlueprints();
      return blueprints.filter(blueprint => blueprint.user_id === userId);
    } catch (error) {
      console.error('Error fetching blueprints by user:', error);
      throw new Error(`Failed to fetch blueprints by user: ${error}`);
    }
  }

  // Get statistics
  async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byComplexity: Record<string, number>;
  }> {
    try {
      const blueprints = await this.readBlueprints();
      
      const stats = {
        total: blueprints.length,
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        byComplexity: {} as Record<string, number>
      };

      blueprints.forEach(blueprint => {
        // Count by status
        stats.byStatus[blueprint.status] = (stats.byStatus[blueprint.status] || 0) + 1;
        
        // Count by priority
        if (blueprint.priority) {
          stats.byPriority[blueprint.priority] = (stats.byPriority[blueprint.priority] || 0) + 1;
        }
        
        // Count by complexity
        if (blueprint.complexity) {
          stats.byComplexity[blueprint.complexity] = (stats.byComplexity[blueprint.complexity] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting blueprint stats:', error);
      throw new Error(`Failed to get blueprint stats: ${error}`);
    }
  }
}

// Export singleton instance
export const BlueprintService = new QdrantBlueprintService();
