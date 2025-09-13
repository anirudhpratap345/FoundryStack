-- Create blueprints table
CREATE TABLE IF NOT EXISTS blueprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  idea TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ANALYZING' CHECK (status IN ('ANALYZING', 'COMPLETED', 'FAILED')),
  market_analysis JSONB,
  technical_blueprint JSONB,
  implementation_plan JSONB,
  code_templates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security for this table (since we're using anon key)
ALTER TABLE blueprints DISABLE ROW LEVEL SECURITY;
 
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON blueprints(status);
CREATE INDEX IF NOT EXISTS idx_blueprints_created_at ON blueprints(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_blueprints_updated_at 
  BEFORE UPDATE ON blueprints 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO blueprints (id, title, description, idea, status, market_analysis, technical_blueprint, implementation_plan, code_templates) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Restaurant Inventory Management SaaS Blueprint',
  'A comprehensive inventory management platform for small restaurants',
  'create a blueprint for restaurant inventory management saas',
  'COMPLETED',
  '{
    "executiveSummary": "This blueprint outlines a comprehensive business strategy for a Restaurant Inventory Management SaaS platform. The concept focuses on leveraging technology to address specific inventory management needs in the restaurant industry. Our analysis reveals significant market opportunities with clear customer pain points that this solution can effectively address. The business model shows strong potential for growth and profitability, with multiple revenue streams and a scalable approach to market penetration.",
    "targetMarket": "Independent restaurants with 1-10 locations",
    "competition": [
      {
        "name": "Toast",
        "description": "All-in-one restaurant management platform",
        "strengths": ["Comprehensive features", "Strong market presence"],
        "weaknesses": ["Expensive", "Complex for small restaurants"]
      }
    ],
    "positioning": "Simple, affordable inventory management focused on food waste reduction",
    "revenueModel": "SaaS subscription with tiered pricing",
    "marketSize": "$2.3B restaurant management software market"
  }'::jsonb,
  '{
    "architecture": "Microservices architecture with React frontend and Node.js backend",
    "techStack": [
      {
        "category": "Frontend",
        "name": "React",
        "version": "18.2.0",
        "rationale": "Mature ecosystem and excellent developer experience"
      },
      {
        "category": "Backend",
        "name": "Node.js",
        "version": "18.x",
        "rationale": "JavaScript full-stack consistency and large package ecosystem"
      }
    ],
    "apiDesign": [
      {
        "endpoint": "/api/inventory",
        "method": "GET",
        "description": "Retrieve inventory items",
        "requestSchema": null,
        "responseSchema": "InventoryItem[]"
      }
    ],
    "databaseSchema": "PostgreSQL with inventory, suppliers, and analytics tables",
    "deploymentStrategy": "Docker containers on AWS with auto-scaling"
  }'::jsonb,
  '{
    "totalWeeks": 4,
    "sprints": [
      {
        "week": 1,
        "title": "Foundation & Authentication",
        "description": "Set up project structure and implement user authentication",
        "tasks": [
          {
            "id": "1",
            "title": "Project Setup",
            "description": "Initialize Next.js project with TypeScript and Tailwind",
            "estimatedHours": 8,
            "priority": "HIGH",
            "dependencies": []
          }
        ],
        "deliverables": ["Project structure", "Authentication system"]
      }
    ],
    "milestones": [
      {
        "week": 1,
        "title": "MVP Foundation",
        "description": "Basic application structure and authentication",
        "criteria": ["User can sign up and log in", "Basic UI components are functional"]
      }
    ],
    "deliverables": [
      {
        "name": "Authentication System",
        "description": "Complete user registration and login functionality",
        "type": "CODE",
        "week": 1
      }
    ]
  }'::jsonb,
  '[
    {
      "name": "Next.js Starter",
      "description": "Complete Next.js project with authentication and basic UI",
      "language": "TypeScript",
      "framework": "Next.js",
      "repositoryUrl": "https://github.com/foundry-stack/restaurant-inventory-starter",
      "files": [
        {
          "path": "src/app/page.tsx",
          "content": "// Main dashboard component",
          "description": "Primary application interface"
        }
      ]
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;
