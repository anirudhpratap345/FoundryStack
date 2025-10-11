// AI Provider interfaces and implementations
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIProvider {
  name: string;
  generateResponse(prompt: string, maxTokens?: number): Promise<string>;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

// Gemini Provider (Free tier - 15 requests per minute, 1M tokens per day)
export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for Gemini provider');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  
  private async callGemini(prompt: string, maxTokens: number = 4000): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: "gemini-2.5-flash", // Latest stable model
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7,
          }
        });

        const systemPrompt = "You are an expert startup advisor and technical architect. Provide detailed, actionable analysis and recommendations. Always respond with valid JSON format only, no markdown formatting.";
        const fullPrompt = `${systemPrompt}\n\n${prompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        lastError = error;
        console.error(`Gemini API error (attempt ${attempt}):`, error);
        
        // Check if it's a rate limit or quota error
        if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate limit')) {
          if (error.message?.includes('quota') && error.message?.includes('exceeded')) {
            console.log('API quota exceeded. Falling back to mock data.');
            throw new Error('QUOTA_EXCEEDED');
          }
          
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // For other errors, don't retry
        throw new Error('Failed to generate AI response from Gemini');
      }
    }

    throw lastError || new Error('Failed to generate AI response from Gemini after all retries');
  }

  async generateResponse(prompt: string, maxTokens: number = 4000): Promise<string> {
    return this.callGemini(prompt, maxTokens);
  }
}

// Groq Provider (Free tier - 14,400 requests/day)
export class GroqProvider implements AIProvider {
  name = 'groq';
  
  private async callGroq(prompt: string, maxTokens: number = 4000): Promise<string> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile', // Fast and capable model
          messages: [
            {
              role: 'system',
              content: 'You are an expert startup advisor and technical architect. Provide detailed, actionable analysis and recommendations. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to generate AI response from Groq');
    }
  }

  async generateResponse(prompt: string, maxTokens: number = 4000): Promise<string> {
    return this.callGroq(prompt, maxTokens);
  }
}

// Ollama Provider (Local - completely free)
export class OllamaProvider implements AIProvider {
  name = 'ollama';
  
  private async callOllama(prompt: string, maxTokens: number = 4000): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.1:8b', // Good balance of speed and capability
          prompt: `You are an expert startup advisor and technical architect. Provide detailed, actionable analysis and recommendations. Always respond with valid JSON format.

${prompt}`,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: maxTokens,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error('Failed to generate AI response from Ollama');
    }
  }

  async generateResponse(prompt: string, maxTokens: number = 4000): Promise<string> {
    return this.callOllama(prompt, maxTokens);
  }
}

// Mock Provider (for testing without any AI service)
export class MockProvider implements AIProvider {
  name = 'mock';
  
  async generateResponse(prompt: string, maxTokens: number = 4000): Promise<string> {
    // Return mock responses for testing
    if (prompt.includes('market analysis')) {
      return JSON.stringify({
        targetMarket: "Small to medium restaurants (1-50 locations) that struggle with manual inventory management and food waste",
        competition: [
          {
            name: "Toast",
            description: "All-in-one restaurant management platform",
            strengths: ["Comprehensive features", "Strong market presence", "Good integrations"],
            weaknesses: ["Expensive for small restaurants", "Complex setup", "Overwhelming for simple needs"]
          },
          {
            name: "Lightspeed",
            description: "Point-of-sale and inventory management system",
            strengths: ["Good inventory features", "Reliable system"],
            weaknesses: ["Limited AI features", "Expensive", "Complex interface"]
          }
        ],
        positioning: "Simple, AI-powered inventory management focused on reducing food waste and costs for independent restaurants",
        revenueModel: "SaaS subscription: $29/month for basic plan, $79/month for advanced features, $149/month for enterprise",
        marketSize: "US restaurant management software market: $2.3B, growing 8% annually. Target segment: $180M"
      });
    }
    
    if (prompt.includes('technical blueprint')) {
      return JSON.stringify({
        architecture: "Modern microservices architecture with React frontend, Node.js backend, and PostgreSQL database",
        techStack: [
          {
            category: "Frontend",
            name: "Next.js",
            version: "14.x",
            rationale: "Full-stack React framework with excellent performance and SEO"
          },
          {
            category: "Backend",
            name: "Node.js",
            version: "18.x",
            rationale: "JavaScript runtime for consistent full-stack development"
          },
          {
            category: "Database",
            name: "PostgreSQL",
            version: "15.x",
            rationale: "Robust relational database with excellent JSON support"
          }
        ],
        apiDesign: [
          {
            endpoint: "/api/inventory",
            method: "GET",
            description: "Retrieve inventory items with filtering and pagination",
            responseSchema: "InventoryItem[]"
          },
          {
            endpoint: "/api/inventory",
            method: "POST",
            description: "Add new inventory item",
            requestSchema: "CreateInventoryItemRequest",
            responseSchema: "InventoryItem"
          }
        ],
        databaseSchema: "Tables: users, restaurants, inventory_items, suppliers, waste_tracking, analytics",
        deploymentStrategy: "Docker containers on AWS with auto-scaling, RDS for database, CloudFront for CDN"
      });
    }
    
    if (prompt.includes('implementation plan')) {
      return JSON.stringify({
        totalWeeks: 4,
        sprints: [
          {
            week: 1,
            title: "Foundation & Authentication",
            description: "Set up project structure and implement user authentication",
            tasks: [
              {
                id: "task-1",
                title: "Project Setup",
                description: "Initialize Next.js project with TypeScript and Tailwind CSS",
                estimatedHours: 8,
                priority: "HIGH",
                dependencies: []
              },
              {
                id: "task-2",
                title: "Database Schema",
                description: "Design and implement PostgreSQL database schema",
                estimatedHours: 12,
                priority: "HIGH",
                dependencies: ["task-1"]
              }
            ],
            deliverables: ["Project structure", "Database schema", "Authentication system"]
          }
        ],
        milestones: [
          {
            week: 1,
            title: "MVP Foundation",
            description: "Basic application structure and authentication",
            criteria: ["User can sign up and log in", "Database is set up", "Basic UI components work"]
          }
        ],
        deliverables: [
          {
            name: "Authentication System",
            description: "Complete user registration and login functionality",
            type: "CODE",
            week: 1
          }
        ]
      });
    }
    
    if (prompt.includes('code templates')) {
      return JSON.stringify({
        templates: [
          {
            name: "Next.js Restaurant Inventory Starter",
            description: "Complete Next.js project with authentication and inventory management",
            language: "TypeScript",
            framework: "Next.js",
            repositoryUrl: "https://github.com/foundry-stack/restaurant-inventory-starter",
            files: [
              {
                path: "src/app/page.tsx",
                content: "// Main dashboard component\nimport { InventoryDashboard } from '@/components/InventoryDashboard';\n\nexport default function Home() {\n  return <InventoryDashboard />;\n}",
                description: "Main application dashboard"
              }
            ]
          }
        ]
      });
    }
    
    // Default mock response
    return JSON.stringify({
      message: "Mock AI response - this is for testing purposes",
      prompt: prompt.substring(0, 100) + "..."
    });
  }
}

// Provider factory
export class AIProviderFactory {
  static createProvider(): AIProvider {
    // Always try Gemini first, fallback to mock if no API key
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using mock provider');
      return new MockProvider();
    }
    
    try {
      const provider = new GeminiProvider();
      console.log('Successfully initialized Gemini provider');
      return provider;
    } catch (error) {
      console.warn('Failed to initialize Gemini provider, falling back to mock:', error);
      return new MockProvider();
    }
  }
}
