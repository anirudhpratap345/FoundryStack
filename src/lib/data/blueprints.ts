// Shared data storage for blueprints (replace with database later)
export const blueprints = [
  {
    id: "1",
    title: "Restaurant Inventory Management SaaS Blueprint",
    description: "A comprehensive inventory management platform for small restaurants",
    status: "COMPLETED",
    createdAt: "2025-09-13T10:40:15.316Z",
    updatedAt: "2025-09-13T10:40:15.316Z",
    marketAnalysis: {
      executiveSummary: "This blueprint outlines a comprehensive business strategy for a Restaurant Inventory Management SaaS platform. The concept focuses on leveraging technology to address specific inventory management needs in the restaurant industry. Our analysis reveals significant market opportunities with clear customer pain points that this solution can effectively address. The business model shows strong potential for growth and profitability, with multiple revenue streams and a scalable approach to market penetration.",
      targetMarket: "Independent restaurants with 1-10 locations",
      competition: [
        {
          name: "Toast",
          description: "All-in-one restaurant management platform",
          strengths: ["Comprehensive features", "Strong market presence"],
          weaknesses: ["Expensive", "Complex for small restaurants"]
        }
      ],
      positioning: "Simple, affordable inventory management focused on food waste reduction",
      revenueModel: "SaaS subscription with tiered pricing",
      marketSize: "$2.3B restaurant management software market"
    },
    technicalBlueprint: {
      architecture: "Microservices architecture with React frontend and Node.js backend",
      techStack: [
        {
          category: "Frontend",
          name: "React",
          version: "18.2.0",
          rationale: "Mature ecosystem and excellent developer experience"
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
          endpoint: "/api/inventory",
          method: "GET",
          description: "Retrieve inventory items",
          requestSchema: null,
          responseSchema: "InventoryItem[]"
        }
      ],
      databaseSchema: "PostgreSQL with inventory, suppliers, and analytics tables",
      deploymentStrategy: "Docker containers on AWS with auto-scaling"
    },
    implementationPlan: {
      totalWeeks: 4,
      sprints: [
        {
          week: 1,
          title: "Foundation & Authentication",
          description: "Set up project structure and implement user authentication",
          tasks: [
            {
              id: "1",
              title: "Project Setup",
              description: "Initialize Next.js project with TypeScript and Tailwind",
              estimatedHours: 8,
              priority: "HIGH",
              dependencies: []
            }
          ],
          deliverables: ["Project structure", "Authentication system"]
        }
      ],
      milestones: [
        {
          week: 1,
          title: "MVP Foundation",
          description: "Basic application structure and authentication",
          criteria: ["User can sign up and log in", "Basic UI components are functional"]
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
    },
    codeTemplates: [
      {
        name: "Next.js Starter",
        description: "Complete Next.js project with authentication and basic UI",
        language: "TypeScript",
        framework: "Next.js",
        repositoryUrl: "https://github.com/foundry-stack/restaurant-inventory-starter",
        files: [
          {
            path: "src/app/page.tsx",
            content: "// Main dashboard component",
            description: "Primary application interface"
          }
        ]
      }
    ]
  }
];