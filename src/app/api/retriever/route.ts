import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the Retriever Agent
    const response = await fetch('http://localhost:8000/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Retriever Agent error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Retriever Agent proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich query with Retriever Agent' },
      { status: 500 }
    );
  }
}
