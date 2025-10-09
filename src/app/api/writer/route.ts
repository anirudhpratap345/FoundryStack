import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the unified pipeline API
    const pipelineUrl = process.env.PIPELINE_API_URL || 'http://localhost:8015';
    const response = await fetch(`${pipelineUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: body.query || body.idea || 'Generate content for this business concept',
        options: {
          export_formats: ['json', 'markdown']
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pipeline API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Pipeline API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content with Pipeline API' },
      { status: 500 }
    );
  }
}
