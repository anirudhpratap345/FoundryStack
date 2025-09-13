import { NextRequest, NextResponse } from 'next/server';
import { blueprintJobProcessor } from '@/lib/jobs/blueprint-generator';
import { aiBlueprintGenerator } from '@/lib/ai/openai';
import { BlueprintService } from '@/lib/supabase/blueprints';
import { validateBlueprintIdea, validateBlueprintTitle, sanitizeInput, rateLimiter } from '@/lib/validation';

// GET /api/blueprints - Get all blueprints
export async function GET() {
  try {
    const blueprints = await BlueprintService.getAll();
    
    // Transform snake_case to camelCase for frontend compatibility
    const transformedBlueprints = blueprints.map(blueprint => ({
      ...blueprint,
      marketAnalysis: blueprint.market_analysis,
      technicalBlueprint: blueprint.technical_blueprint,
      implementationPlan: blueprint.implementation_plan,
      codeTemplates: blueprint.code_templates || [],
      createdAt: blueprint.created_at,
      updatedAt: blueprint.updated_at
    }));

    return NextResponse.json({ blueprints: transformedBlueprints });
  } catch (error) {
    console.error('Failed to fetch blueprints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blueprints' },
      { status: 500 }
    );
  }
}

// POST /api/blueprints - Create a new blueprint
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/blueprints - Starting blueprint creation');
    
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimiter.isAllowed(clientIP)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimiter.getResetTime(clientIP) - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }
    
    const { title, description, idea } = await request.json();
    console.log('Request data:', { title, description, idea });

    // Validate input
    const titleValidation = validateBlueprintTitle(title);
    const ideaValidation = validateBlueprintIdea(idea);

    if (!titleValidation.isValid || !ideaValidation.isValid) {
      const errors = [...titleValidation.errors, ...ideaValidation.errors];
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errors
        },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedIdea = sanitizeInput(idea);

    console.log('Creating blueprint in database...');
    const newBlueprint = await BlueprintService.create({
      title: sanitizedTitle,
      description: sanitizedDescription,
      idea: sanitizedIdea,
      status: 'ANALYZING',
      market_analysis: null,
      technical_blueprint: null,
      implementation_plan: null,
      code_templates: []
    });

    // Start AI blueprint generation in background
    blueprintJobProcessor.createJob(newBlueprint.id)
      .then(async () => {
        console.log(`Started blueprint generation job for ${newBlueprint.id}`);
        
        try {
          // Extract business concept from the idea
          const businessConcept = idea.replace(/create a blueprint for/i, '').replace(/blueprint/i, '').trim();
          
          // Generate AI content
          const [marketAnalysis, technicalBlueprint, implementationPlan] = await Promise.all([
            aiBlueprintGenerator.generateMarketAnalysis(businessConcept, title),
            aiBlueprintGenerator.generateTechnicalBlueprint(businessConcept, title),
            aiBlueprintGenerator.generateImplementationPlan(businessConcept, title)
          ]);

          // Update blueprint with AI-generated content
          await BlueprintService.update(newBlueprint.id, {
            market_analysis: marketAnalysis,
            technical_blueprint: technicalBlueprint,
            implementation_plan: implementationPlan,
            status: 'COMPLETED'
          });

          console.log(`Blueprint generation completed for ${newBlueprint.id}`);
        } catch (error) {
          console.error('AI generation failed:', error);
          await BlueprintService.update(newBlueprint.id, {
            status: 'FAILED'
          });
        }
      })
      .catch(async (error) => {
        console.error('Failed to start blueprint generation:', error);
        await BlueprintService.update(newBlueprint.id, {
          status: 'FAILED'
        });
      });

    // Transform snake_case to camelCase for frontend compatibility
    const transformedBlueprint = {
      ...newBlueprint,
      marketAnalysis: newBlueprint.market_analysis,
      technicalBlueprint: newBlueprint.technical_blueprint,
      implementationPlan: newBlueprint.implementation_plan,
      codeTemplates: newBlueprint.code_templates || [],
      createdAt: newBlueprint.created_at,
      updatedAt: newBlueprint.updated_at
    };

    return NextResponse.json(transformedBlueprint, { status: 201 });
  } catch (error) {
    console.error('Failed to create blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to create blueprint' },
      { status: 500 }
    );
  }
}
