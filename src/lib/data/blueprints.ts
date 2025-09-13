// Shared data storage for blueprints (replace with database later)
export const blueprints = [
  {
    "id": "1",
    "title": "Restaurant Inventory Management SaaS",
    "description": "A comprehensive inventory management platform for small restaurants",
    "status": "COMPLETED",
    "createdAt": "2025-09-13T10:40:15.316Z",
    "updatedAt": "2025-09-13T10:40:15.316Z",
    "marketAnalysis": {
      "targetMarket": "Independent restaurants with 1-10 locations",
      "competition": [
        {
          "name": "Toast",
          "description": "All-in-one restaurant management platform",
          "strengths": [
            "Comprehensive features",
            "Strong market presence"
          ],
          "weaknesses": [
            "Expensive",
            "Complex for small restaurants"
          ]
        }
      ],
      "positioning": "Simple, affordable inventory management focused on food waste reduction",
      "revenueModel": "SaaS subscription with tiered pricing",
      "marketSize": "$2.3B restaurant management software market"
    },
    "technicalBlueprint": {
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
    },
    "implementationPlan": {
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
          "deliverables": [
            "Project structure",
            "Authentication system"
          ]
        }
      ],
      "milestones": [
        {
          "week": 1,
          "title": "MVP Foundation",
          "description": "Basic application structure and authentication",
          "criteria": [
            "User can sign up and log in",
            "Basic UI components are functional"
          ]
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
    },
    "codeTemplates": [
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
    ]
  },
  {
    "id": "2",
    "title": "AI-powered personal finance coach that analyzes your spending patterns, creates personalized budgets",
    "description": "AI-powered personal finance coach that analyzes your spending patterns, creates personalized budgets, and sends smart alerts when you're about to overspend. It learns from your financial goals and suggests investment opportunities.",
    "idea": "AI-powered personal finance coach that analyzes your spending patterns, creates personalized budgets, and sends smart alerts when you're about to overspend. It learns from your financial goals and suggests investment opportunities.",
    "status": "ANALYZING",
    "createdAt": "2025-09-13T10:40:15.340Z",
    "updatedAt": "2025-09-13T10:40:15.340Z",
    "marketAnalysis": null,
    "technicalBlueprint": null,
    "implementationPlan": null,
    "codeTemplates": []
  },
  {
    "id": "3",
    "title": "Smart Home Automation Platform",
    "description": "A voice-controlled smart home system that learns your routines and automates your environment",
    "idea": "I want to build a smart home automation platform that uses AI to learn daily routines and automatically adjusts lighting, temperature, and security settings. It should work with any smart device brand and provide a unified control interface.",
    "status": "ANALYZING",
    "createdAt": "2025-09-13T10:43:21.134Z",
    "updatedAt": "2025-09-13T10:43:21.134Z",
    "marketAnalysis": null,
    "technicalBlueprint": null,
    "implementationPlan": null,
    "codeTemplates": []
  }
];

