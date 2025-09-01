import { BlueprintStatus, TaskPriority, DeliverableType } from './schema';

// Mock data for development
const mockBlueprints = [
  {
    id: '1',
    title: 'Restaurant Inventory Management SaaS',
    description: 'A comprehensive inventory management platform for small restaurants',
    status: BlueprintStatus.COMPLETED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    marketAnalysis: {
      targetMarket: 'Independent restaurants with 1-10 locations',
      competition: [
        {
          name: 'Toast',
          description: 'All-in-one restaurant management platform',
          strengths: ['Comprehensive features', 'Strong market presence'],
          weaknesses: ['Expensive', 'Complex for small restaurants']
        }
      ],
      positioning: 'Simple, affordable inventory management focused on food waste reduction',
      revenueModel: 'SaaS subscription with tiered pricing',
      marketSize: '$2.3B restaurant management software market'
    },
    technicalBlueprint: {
      architecture: 'Microservices architecture with React frontend and Node.js backend',
      techStack: [
        {
          category: 'Frontend',
          name: 'React',
          version: '18.2.0',
          rationale: 'Mature ecosystem and excellent developer experience'
        },
        {
          category: 'Backend',
          name: 'Node.js',
          version: '18.x',
          rationale: 'JavaScript full-stack consistency and large package ecosystem'
        }
      ],
      apiDesign: [
        {
          endpoint: '/api/inventory',
          method: 'GET',
          description: 'Retrieve inventory items',
          requestSchema: null,
          responseSchema: 'InventoryItem[]'
        }
      ],
      databaseSchema: 'PostgreSQL with inventory, suppliers, and analytics tables',
      deploymentStrategy: 'Docker containers on AWS with auto-scaling'
    },
    implementationPlan: {
      totalWeeks: 4,
      sprints: [
        {
          week: 1,
          title: 'Foundation & Authentication',
          description: 'Set up project structure and implement user authentication',
          tasks: [
            {
              id: '1',
              title: 'Project Setup',
              description: 'Initialize Next.js project with TypeScript and Tailwind',
              estimatedHours: 8,
              priority: TaskPriority.HIGH,
              dependencies: []
            }
          ],
          deliverables: ['Project structure', 'Authentication system']
        }
      ],
      milestones: [
        {
          week: 1,
          title: 'MVP Foundation',
          description: 'Basic application structure and authentication',
          criteria: ['User can sign up and log in', 'Basic UI components are functional']
        }
      ],
      deliverables: [
        {
          name: 'Authentication System',
          description: 'Complete user registration and login functionality',
          type: DeliverableType.CODE,
          week: 1
        }
      ]
    },
    codeTemplates: [
      {
        name: 'Next.js Starter',
        description: 'Complete Next.js project with authentication and basic UI',
        language: 'TypeScript',
        framework: 'Next.js',
        repositoryUrl: 'https://github.com/foundry-stack/restaurant-inventory-starter',
        files: [
          {
            path: 'src/app/page.tsx',
            content: '// Main dashboard component',
            description: 'Primary application interface'
          }
        ]
      }
    ]
  }
];

export const resolvers = {
  Query: {
    blueprints: () => mockBlueprints,
    blueprint: (_: any, { id }: { id: string }) => 
      mockBlueprints.find(bp => bp.id === id) || null,
    health: () => 'FoundryStack GraphQL API is running!'
  },
  Mutation: {
    createBlueprint: (_: any, { input }: { input: any }) => {
      const newBlueprint = {
        id: (mockBlueprints.length + 1).toString(),
        title: input.title,
        description: input.description,
        status: BlueprintStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        marketAnalysis: null,
        technicalBlueprint: null,
        implementationPlan: null,
        codeTemplates: []
      };
      mockBlueprints.push(newBlueprint);
      return newBlueprint;
    },
    updateBlueprint: (_: any, { id, input }: { id: string, input: any }) => {
      const blueprint = mockBlueprints.find(bp => bp.id === id);
      if (!blueprint) {
        throw new Error('Blueprint not found');
      }
      Object.assign(blueprint, input, { updatedAt: new Date().toISOString() });
      return blueprint;
    },
    deleteBlueprint: (_: any, { id }: { id: string }) => {
      const index = mockBlueprints.findIndex(bp => bp.id === id);
      if (index === -1) {
        return false;
      }
      mockBlueprints.splice(index, 1);
      return true;
    }
  }
};
