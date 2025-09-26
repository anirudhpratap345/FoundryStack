import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the Exporter Agent
    const response = await fetch('http://localhost:8005/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Exporter Agent error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Exporter Agent proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to export blueprint with Exporter Agent' },
      { status: 500 }
    );
  }
}
