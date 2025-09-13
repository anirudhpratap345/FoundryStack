import { NextRequest, NextResponse } from 'next/server';
import { blueprintJobProcessor } from '@/lib/jobs/blueprint-generator';
import { aiBlueprintGenerator } from '@/lib/ai/openai';
import { blueprints } from '@/lib/data/blueprints';

// GET /api/blueprints - Get all blueprints
export async function GET() {
  try {
    return NextResponse.json({ blueprints });
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
    const { title, description, idea } = await request.json();

    if (!title || !description || !idea) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, idea' },
        { status: 400 }
      );
    }

    const newBlueprint = {
      id: (blueprints.length + 1).toString(),
      title,
      description,
      idea,
      status: 'ANALYZING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      marketAnalysis: null,
      technicalBlueprint: null,
      implementationPlan: null,
      codeTemplates: []
    };

    blueprints.push(newBlueprint);
    
    // Also update the shared data file
    const { writeFileSync } = require('fs');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'src/lib/data/blueprints.ts');
    
    // Read current content and update
    const fs = require('fs');
    const currentContent = fs.readFileSync(dataPath, 'utf8');
    const updatedContent = currentContent.replace(
      /export const blueprints = \[[\s\S]*?\];/,
      `export const blueprints = ${JSON.stringify(blueprints, null, 2)};`
    );
    fs.writeFileSync(dataPath, updatedContent);

    // Start AI blueprint generation in background
    blueprintJobProcessor.createJob(newBlueprint.id)
      .then(async () => {
        console.log(`Started blueprint generation job for ${newBlueprint.id}`);
        
        try {
          // Generate AI content
          const [marketAnalysis, technicalBlueprint, implementationPlan] = await Promise.all([
            aiBlueprintGenerator.generateMarketAnalysis(idea, title),
            aiBlueprintGenerator.generateTechnicalBlueprint(idea, title),
            aiBlueprintGenerator.generateImplementationPlan(idea, title)
          ]);

          // Update blueprint with AI-generated content
          newBlueprint.marketAnalysis = marketAnalysis;
          newBlueprint.technicalBlueprint = technicalBlueprint;
          newBlueprint.implementationPlan = implementationPlan;
          newBlueprint.status = 'COMPLETED';
          newBlueprint.updatedAt = new Date().toISOString();

          console.log(`Blueprint generation completed for ${newBlueprint.id}`);
        } catch (error) {
          console.error('AI generation failed:', error);
          newBlueprint.status = 'FAILED';
          newBlueprint.updatedAt = new Date().toISOString();
        }
      })
      .catch((error) => {
        console.error('Failed to start blueprint generation:', error);
        newBlueprint.status = 'FAILED';
        newBlueprint.updatedAt = new Date().toISOString();
      });

    return NextResponse.json(newBlueprint, { status: 201 });
  } catch (error) {
    console.error('Failed to create blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to create blueprint' },
      { status: 500 }
    );
  }
}
