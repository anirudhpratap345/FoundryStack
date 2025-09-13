import { NextRequest, NextResponse } from 'next/server';
import { aiBlueprintGenerator } from '@/lib/ai/openai';
import { BlueprintService } from '@/lib/supabase/blueprints';

// GET /api/blueprints/[id] - Get a specific blueprint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blueprint = await BlueprintService.getById(id);
    
    if (!blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    // Transform snake_case to camelCase for frontend compatibility
    const transformedBlueprint = {
      ...blueprint,
      marketAnalysis: blueprint.market_analysis,
      technicalBlueprint: blueprint.technical_blueprint,
      implementationPlan: blueprint.implementation_plan,
      codeTemplates: blueprint.code_templates || [],
      createdAt: blueprint.created_at,
      updatedAt: blueprint.updated_at
    };

    return NextResponse.json({ blueprint: transformedBlueprint });
  } catch (error) {
    console.error('Failed to fetch blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blueprint' },
      { status: 500 }
    );
  }
}

// PUT /api/blueprints/[id] - Update a blueprint
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, description, status } = await request.json();
    
    const blueprint = await BlueprintService.update(id, {
      title,
      description,
      status
    });

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error('Failed to update blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to update blueprint' },
      { status: 500 }
    );
  }
}

// DELETE /api/blueprints/[id] - Delete a blueprint
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await BlueprintService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to delete blueprint' },
      { status: 500 }
    );
  }
}

// POST /api/blueprints/[id]/regenerate - Regenerate AI content for a blueprint
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blueprint = await BlueprintService.getById(id);
    
    if (!blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    // Update status to analyzing
    await BlueprintService.update(id, { status: 'ANALYZING' });

    // Generate new AI content in background
    try {
      // Extract business concept from the idea
      const businessConcept = blueprint.idea.replace(/create a blueprint for/i, '').replace(/blueprint/i, '').trim();
      
      const marketAnalysis = await aiBlueprintGenerator.generateMarketAnalysis(businessConcept, blueprint.title);
      const technicalBlueprint = await aiBlueprintGenerator.generateTechnicalBlueprint(businessConcept, marketAnalysis);
      const implementationPlan = await aiBlueprintGenerator.generateImplementationPlan(businessConcept, technicalBlueprint);

      // Update blueprint with new AI-generated content
      const updatedBlueprint = await BlueprintService.update(id, {
        market_analysis: marketAnalysis,
        technical_blueprint: technicalBlueprint,
        implementation_plan: implementationPlan,
        status: 'COMPLETED'
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Blueprint regenerated successfully',
        blueprint: updatedBlueprint 
      });
    } catch (error) {
      console.error('AI regeneration failed:', error);
      await BlueprintService.update(id, { status: 'FAILED' });
      
      return NextResponse.json(
        { error: 'Failed to regenerate blueprint content' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to regenerate blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate blueprint' },
      { status: 500 }
    );
  }
}
