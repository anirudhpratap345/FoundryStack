export const GRAPHQL_ENDPOINT = '/api/graphql';

export async function graphqlRequest(query: string, variables?: any) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
  }

  return result.data;
}

// Common GraphQL queries and mutations
export const QUERIES = {
  GET_BLUEPRINTS: `
    query GetBlueprints {
      blueprints {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  `,
  
  GET_BLUEPRINT: `
    query GetBlueprint($id: ID!) {
      blueprint(id: $id) {
        id
        title
        description
        status
        createdAt
        updatedAt
        marketAnalysis {
          targetMarket
          competition {
            name
            description
            strengths
            weaknesses
          }
          positioning
          revenueModel
          marketSize
        }
        technicalBlueprint {
          architecture
          techStack {
            category
            name
            version
            rationale
          }
          apiDesign {
            endpoint
            method
            description
            requestSchema
            responseSchema
          }
          databaseSchema
          deploymentStrategy
        }
        implementationPlan {
          totalWeeks
          sprints {
            week
            title
            description
            tasks {
              id
              title
              description
              estimatedHours
              priority
              dependencies
            }
            deliverables
          }
          milestones {
            week
            title
            description
            criteria
          }
          deliverables {
            name
            description
            type
            week
          }
        }
        codeTemplates {
          name
          description
          language
          framework
          repositoryUrl
          files {
            path
            content
            description
          }
        }
      }
    }
  `,
  
  HEALTH_CHECK: `
    query HealthCheck {
      health
    }
  `
};

export const MUTATIONS = {
  CREATE_BLUEPRINT: `
    mutation CreateBlueprint($input: CreateBlueprintInput!) {
      createBlueprint(input: $input) {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  `,
  
  UPDATE_BLUEPRINT: `
    mutation UpdateBlueprint($id: ID!, $input: UpdateBlueprintInput!) {
      updateBlueprint(id: $id, input: $input) {
        id
        title
        description
        status
        updatedAt
      }
    }
  `,
  
  DELETE_BLUEPRINT: `
    mutation DeleteBlueprint($id: ID!) {
      deleteBlueprint(id: $id)
    }
  `
};
