import { AIProviderFactory, AIProvider } from './providers';

// Use the provider factory to get the appropriate AI provider
// Initialize lazily to avoid module-level execution issues
let aiProvider: AIProvider | null = null;

function getAIProvider(): AIProvider {
  if (!aiProvider) {
    aiProvider = AIProviderFactory.createProvider();
  }
  return aiProvider;
}

export interface BlueprintGenerationRequest {
  idea: string;
  title: string;
  description: string;
}

export interface MarketAnalysis {
  targetMarket: string;
  competition: Array<{
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  positioning: string;
  revenueModel: string;
  marketSize: string;
}

export interface TechStackItem {
  category: string;
  name: string;
  version?: string;
  rationale: string;
}

export interface APIDesign {
  endpoint: string;
  method: string;
  description: string;
  requestSchema?: string;
  responseSchema?: string;
}

export interface TechnicalBlueprint {
  architecture: string;
  techStack: TechStackItem[];
  apiDesign: APIDesign[];
  databaseSchema: string;
  deploymentStrategy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dependencies: string[];
}

export interface Sprint {
  week: number;
  title: string;
  description: string;
  tasks: Task[];
  deliverables: string[];
}

export interface Milestone {
  week: number;
  title: string;
  description: string;
  criteria: string[];
}

export interface Deliverable {
  name: string;
  description: string;
  type: 'CODE' | 'DOCUMENTATION' | 'DESIGN' | 'TEST' | 'DEPLOYMENT';
  week: number;
}

export interface ImplementationPlan {
  totalWeeks: number;
  sprints: Sprint[];
  milestones: Milestone[];
  deliverables: Deliverable[];
}

export interface CodeFile {
  path: string;
  content: string;
  description: string;
}

export interface CodeTemplate {
  name: string;
  description: string;
  language: string;
  framework?: string;
  repositoryUrl?: string;
  files: CodeFile[];
}

export interface GeneratedBlueprint {
  marketAnalysis: MarketAnalysis;
  technicalBlueprint: TechnicalBlueprint;
  implementationPlan: ImplementationPlan;
  codeTemplates: CodeTemplate[];
}

export class AIBlueprintGenerator {
  private async callAI(prompt: string, maxTokens: number = 4000): Promise<string> {
    try {
      const provider = getAIProvider();
      console.log(`Using AI provider: ${provider.name}`);
      const response = await provider.generateResponse(prompt, maxTokens);
      
      // Clean the response to extract JSON if it's wrapped in markdown
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Remove any leading/trailing text before/after JSON
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      // Additional cleaning for common JSON issues
      cleanedResponse = cleanedResponse
        .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
        .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      return cleanedResponse;
    } catch (error) {
      console.error('AI API error:', error);
      const provider = getAIProvider();
      throw new Error(`Failed to generate AI response using ${provider.name}`);
    }
  }

  async generateMarketAnalysis(idea: string, title: string): Promise<MarketAnalysis> {
    const prompt = `
    Analyze the following startup idea and provide a comprehensive market analysis in JSON format:

    Title: ${title}
    Idea: ${idea}

    Please provide a detailed market analysis with the following structure:
    {
      "targetMarket": "Detailed description of the target market, including demographics, size, and characteristics",
      "competition": [
        {
          "name": "Competitor name",
          "description": "Brief description of the competitor",
          "strengths": ["strength1", "strength2"],
          "weaknesses": ["weakness1", "weakness2"]
        }
      ],
      "positioning": "Clear positioning statement and unique value proposition",
      "revenueModel": "Detailed revenue model and pricing strategy",
      "marketSize": "Market size estimate with supporting data"
    }

    Focus on:
    - Identifying 3-5 key competitors
    - Clear differentiation strategy
    - Realistic market sizing
    - Viable revenue models
    `;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Market analysis generation failed:', error);
      // Return fallback data
      return {
        targetMarket: `Tech-savvy individuals interested in ${idea.toLowerCase()}`,
        competition: [
          {
            name: "Existing Solutions",
            description: "Current market solutions",
            strengths: ["Market presence", "User base"],
            weaknesses: ["Limited features", "High cost"]
          }
        ],
        positioning: `A modern, user-friendly solution for ${idea.toLowerCase()}`,
        revenueModel: "Subscription-based SaaS model",
        marketSize: "Growing market with significant opportunity"
      };
    }
  }

  async generateTechnicalBlueprint(idea: string, marketAnalysis: MarketAnalysis): Promise<TechnicalBlueprint> {
    const prompt = `
    Based on the startup idea and market analysis, create a comprehensive technical blueprint in JSON format:

    Idea: ${idea}
    Market Analysis: ${JSON.stringify(marketAnalysis, null, 2)}

    Please provide a detailed technical blueprint with the following structure:
    {
      "architecture": "High-level system architecture description",
      "techStack": [
        {
          "category": "Frontend/Backend/Database/etc",
          "name": "Technology name",
          "version": "Version number if applicable",
          "rationale": "Why this technology was chosen"
        }
      ],
      "apiDesign": [
        {
          "endpoint": "/api/endpoint",
          "method": "GET/POST/PUT/DELETE",
          "description": "What this endpoint does",
          "requestSchema": "Request body structure (optional)",
          "responseSchema": "Response structure"
        }
      ],
      "databaseSchema": "Database design and key tables description",
      "deploymentStrategy": "Deployment approach and infrastructure recommendations"
    }

    Focus on:
    - Modern, scalable technology choices
    - RESTful API design
    - Database optimization
    - Cloud deployment strategy
    - Security considerations
    `;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Technical blueprint generation failed:', error);
      // Return fallback data
      return {
        architecture: "Modern web application with React frontend and Node.js backend",
        techStack: [
          {
            category: "Frontend",
            name: "React",
            version: "18.x",
            rationale: "Popular, well-supported framework with great ecosystem"
          },
          {
            category: "Backend",
            name: "Node.js",
            version: "18.x",
            rationale: "JavaScript full-stack consistency and large package ecosystem"
          }
        ],
        apiDesign: [
          {
            endpoint: "/api/data",
            method: "GET",
            description: "Retrieve application data",
            requestSchema: null,
            responseSchema: "DataResponse"
          }
        ],
        databaseSchema: "PostgreSQL with optimized tables for the application needs",
        deploymentStrategy: "Docker containers with cloud deployment"
      };
    }
  }

  async generateImplementationPlan(
    idea: string, 
    technicalBlueprint: TechnicalBlueprint
  ): Promise<ImplementationPlan> {
    const prompt = `
    Create a detailed 4-week implementation plan for the following startup:

    Idea: ${idea}
    Technical Blueprint: ${JSON.stringify(technicalBlueprint, null, 2)}

    Please provide a comprehensive implementation plan in JSON format:
    {
      "totalWeeks": 4,
      "sprints": [
        {
          "week": 1,
          "title": "Sprint title",
          "description": "What this sprint accomplishes",
          "tasks": [
            {
              "id": "task-1",
              "title": "Task title",
              "description": "Detailed task description",
              "estimatedHours": 8,
              "priority": "HIGH/MEDIUM/LOW/CRITICAL",
              "dependencies": ["task-id-if-any"]
            }
          ],
          "deliverables": ["deliverable1", "deliverable2"]
        }
      ],
      "milestones": [
        {
          "week": 1,
          "title": "Milestone title",
          "description": "What this milestone represents",
          "criteria": ["criterion1", "criterion2"]
        }
      ],
      "deliverables": [
        {
          "name": "Deliverable name",
          "description": "What this deliverable contains",
          "type": "CODE/DOCUMENTATION/DESIGN/TEST/DEPLOYMENT",
          "week": 1
        }
      ]
    }

    Focus on:
    - Realistic 4-week timeline
    - Prioritized tasks with dependencies
    - Clear milestones and deliverables
    - MVP-focused approach
    `;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Implementation plan generation failed:', error);
      // Return fallback data
      return {
        totalWeeks: 4,
        sprints: [
          {
            week: 1,
            title: "Foundation & Setup",
            description: "Set up project structure and basic functionality",
            tasks: [
              {
                id: "1",
                title: "Project Setup",
                description: "Initialize project with necessary dependencies",
                estimatedHours: 8,
                priority: "HIGH",
                dependencies: []
              }
            ],
            deliverables: ["Project structure", "Basic functionality"]
          }
        ],
        milestones: [
          {
            week: 1,
            title: "MVP Foundation",
            description: "Basic application structure and core features",
            criteria: ["Project setup complete", "Basic functionality working"]
          }
        ],
        deliverables: [
          {
            name: "Core Application",
            description: "Basic application with essential features",
            type: "CODE",
            week: 1
          }
        ]
      };
    }
  }

  async generateCodeTemplates(
    idea: string,
    technicalBlueprint: TechnicalBlueprint
  ): Promise<CodeTemplate[]> {
    const prompt = `
    Generate starter code templates for the following startup:

    Idea: ${idea}
    Technical Blueprint: ${JSON.stringify(technicalBlueprint, null, 2)}

    Please provide code templates in JSON format:
    {
      "templates": [
        {
          "name": "Template name",
          "description": "What this template provides",
          "language": "TypeScript/JavaScript/Python/etc",
          "framework": "Next.js/React/Express/etc",
          "repositoryUrl": "https://github.com/example/repo",
          "files": [
            {
              "path": "src/app/page.tsx",
              "content": "// Actual code content here",
              "description": "What this file does"
            }
          ]
        }
      ]
    }

    Focus on:
    - Complete starter projects
    - Best practices and modern patterns
    - Ready-to-run code
    - Essential features for MVP
    `;

    const response = await this.callAI(prompt, 6000);
    const parsed = JSON.parse(response);
    return parsed.templates || [];
  }

  async generateCompleteBlueprint(request: BlueprintGenerationRequest): Promise<GeneratedBlueprint> {
    try {
      console.log('Starting blueprint generation for:', request.title);
      
      // Step 1: Market Analysis
      console.log('Generating market analysis...');
      const marketAnalysis = await this.generateMarketAnalysis(request.idea, request.title);
      
      // Step 2: Technical Blueprint
      console.log('Generating technical blueprint...');
      const technicalBlueprint = await this.generateTechnicalBlueprint(request.idea, marketAnalysis);
      
      // Step 3: Implementation Plan
      console.log('Generating implementation plan...');
      const implementationPlan = await this.generateImplementationPlan(request.idea, technicalBlueprint);
      
      // Step 4: Code Templates
      console.log('Generating code templates...');
      const codeTemplates = await this.generateCodeTemplates(request.idea, technicalBlueprint);
      
      console.log('Blueprint generation completed successfully');
      
      return {
        marketAnalysis,
        technicalBlueprint,
        implementationPlan,
        codeTemplates
      };
    } catch (error) {
      console.error('Blueprint generation failed:', error);
      throw new Error('Failed to generate complete blueprint');
    }
  }
}

export const aiBlueprintGenerator = new AIBlueprintGenerator();
