import { NextRequest, NextResponse } from 'next/server';
import { retrieverAgent } from '@/lib/ai/retriever';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing Retriever Agent with query:', query);
    
    // Test the retriever agent
    const result = await retrieverAgent.enrichQuery(query);
    
    return NextResponse.json({
      success: true,
      originalQuery: query,
      enrichedQuery: result.enrichedQuery,
      context: result.context,
      confidence: result.confidence,
      availableIndustries: retrieverAgent.getAvailableIndustries()
    });
    
  } catch (error) {
    console.error('Retriever Agent test failed:', error);
    return NextResponse.json(
      { 
        error: 'Retriever Agent test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Retriever Agent Test Endpoint',
    usage: 'POST with { query: "your startup idea" } to test context enrichment',
    availableIndustries: retrieverAgent.getAvailableIndustries(),
    features: [
      'Industry detection and analysis',
      'Market trends and competitor data',
      'Tech stack recommendations',
      'API and tool suggestions',
      'Regulatory considerations',
      'Market size and growth data',
      'User persona analysis',
      'Business model recommendations'
    ]
  });
}
