import { NextRequest, NextResponse } from 'next/server';
import { aiBlueprintGenerator } from '@/lib/ai/openai';
import { blueprints } from '@/lib/data/blueprints';

// GET /api/blueprints/[id] - Get a specific blueprint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blueprint = blueprints.find(bp => bp.id === id);
    
    if (!blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ blueprint });
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
    const blueprint = blueprints.find(bp => bp.id === id);
    
    if (!blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    // Update blueprint
    if (title) blueprint.title = title;
    if (description) blueprint.description = description;
    if (status) blueprint.status = status;
    blueprint.updatedAt = new Date().toISOString();

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
    const index = blueprints.findIndex(bp => bp.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    blueprints.splice(index, 1);
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
    const blueprint = blueprints.find(bp => bp.id === id);
    
    if (!blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    // Update status to analyzing
    blueprint.status = 'ANALYZING';
    blueprint.updatedAt = new Date().toISOString();

    // Generate new AI content in background
    try {
      const [marketAnalysis, technicalBlueprint, implementationPlan] = await Promise.all([
        aiBlueprintGenerator.generateMarketAnalysis(blueprint.idea || blueprint.description, blueprint.title),
        aiBlueprintGenerator.generateTechnicalBlueprint(blueprint.idea || blueprint.description, blueprint.title),
        aiBlueprintGenerator.generateImplementationPlan(blueprint.idea || blueprint.description, blueprint.title)
      ]);

      // Update blueprint with new AI-generated content
      blueprint.marketAnalysis = marketAnalysis;
      blueprint.technicalBlueprint = technicalBlueprint;
      blueprint.implementationPlan = implementationPlan;
      blueprint.status = 'COMPLETED';
      blueprint.updatedAt = new Date().toISOString();

      return NextResponse.json({ 
        success: true, 
        message: 'Blueprint regenerated successfully',
        blueprint 
      });
    } catch (error) {
      console.error('AI regeneration failed:', error);
      blueprint.status = 'FAILED';
      blueprint.updatedAt = new Date().toISOString();
      
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
