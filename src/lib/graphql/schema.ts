import { gql } from 'graphql-yoga';

export const typeDefs = gql`
  type Blueprint {
    id: ID!
    title: String!
    description: String!
    status: BlueprintStatus!
    createdAt: String!
    updatedAt: String!
    marketAnalysis: MarketAnalysis
    technicalBlueprint: TechnicalBlueprint
    implementationPlan: ImplementationPlan
    codeTemplates: [CodeTemplate!]!
  }

  type MarketAnalysis {
    targetMarket: String!
    competition: [Competitor!]!
    positioning: String!
    revenueModel: String!
    marketSize: String!
  }

  type Competitor {
    name: String!
    description: String!
    strengths: [String!]!
    weaknesses: [String!]!
  }

  type TechnicalBlueprint {
    architecture: String!
    techStack: [TechStackItem!]!
    apiDesign: [APIDesign!]!
    databaseSchema: String!
    deploymentStrategy: String!
  }

  type TechStackItem {
    category: String!
    name: String!
    version: String
    rationale: String!
  }

  type APIDesign {
    endpoint: String!
    method: String!
    description: String!
    requestSchema: String
    responseSchema: String
  }

  type ImplementationPlan {
    totalWeeks: Int!
    sprints: [Sprint!]!
    milestones: [Milestone!]!
    deliverables: [Deliverable!]!
  }

  type Sprint {
    week: Int!
    title: String!
    description: String!
    tasks: [Task!]!
    deliverables: [String!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    estimatedHours: Int!
    priority: TaskPriority!
    dependencies: [String!]!
  }

  type Milestone {
    week: Int!
    title: String!
    description: String!
    criteria: [String!]!
  }

  type Deliverable {
    name: String!
    description: String!
    type: DeliverableType!
    week: Int!
  }

  type CodeTemplate {
    name: String!
    description: String!
    language: String!
    framework: String
    repositoryUrl: String
    files: [CodeFile!]!
  }

  type CodeFile {
    path: String!
    content: String!
    description: String!
  }

  enum BlueprintStatus {
    PENDING
    ANALYZING
    GENERATING
    COMPLETED
    FAILED
  }

  enum TaskPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum DeliverableType {
    CODE
    DOCUMENTATION
    DESIGN
    TEST
    DEPLOYMENT
  }

  type Query {
    blueprints: [Blueprint!]!
    blueprint(id: ID!): Blueprint
    health: String!
  }

  type Mutation {
    createBlueprint(input: CreateBlueprintInput!): Blueprint!
    updateBlueprint(id: ID!, input: UpdateBlueprintInput!): Blueprint!
    deleteBlueprint(id: ID!): Boolean!
  }

  input CreateBlueprintInput {
    title: String!
    description: String!
    idea: String!
  }

  input UpdateBlueprintInput {
    title: String
    description: String
    status: BlueprintStatus
  }
`;
