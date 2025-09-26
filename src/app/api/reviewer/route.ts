import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the Reviewer Agent
    const response = await fetch('http://localhost:8004/review/simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Reviewer Agent error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reviewer Agent proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to review blueprint with Reviewer Agent' },
      { status: 500 }
    );
  }
}
