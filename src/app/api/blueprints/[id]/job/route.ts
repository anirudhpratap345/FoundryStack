import { NextRequest, NextResponse } from 'next/server';
import { blueprintJobProcessor } from '@/lib/jobs/blueprint-generator';

// GET /api/blueprints/[id]/job - Get job status for a blueprint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = blueprintJobProcessor.getJobByBlueprintId(id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: job.id,
      blueprintId: job.blueprintId,
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
      error: job.error,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
