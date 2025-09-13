import { NextRequest, NextResponse } from 'next/server';
import { aiBlueprintGenerator } from '@/lib/ai/openai';
import { AIProviderFactory } from '@/lib/ai/providers';

export async function POST(request: NextRequest) {
  try {
    const { idea, title, description } = await request.json();

    if (!idea || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: idea, title, description' },
        { status: 400 }
      );
    }
 
    // Test AI generation with a simple request
    const result = await aiBlueprintGenerator.generateMarketAnalysis(idea, title);
    const provider = AIProviderFactory.createProvider();

    return NextResponse.json({
      success: true,
      message: `AI service is working correctly using ${provider.name} provider`,
      provider: provider.name,
      result: {
        targetMarket: result.targetMarket,
        positioning: result.positioning,
        revenueModel: result.revenueModel
      }
    });

  } catch (error) {
    console.error('AI test failed:', error);
    
    return NextResponse.json(
      { 
        error: 'AI service test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const provider = AIProviderFactory.createProvider();
  
  return NextResponse.json({
    message: 'AI Test Endpoint',
    currentProvider: provider.name,
    model: provider.name === 'gemini' ? 'gemini-2.5-pro' : 'mock',
    usage: 'POST with { idea, title, description } to test AI generation',
    setupInstructions: {
      gemini: 'Get free API key at https://makersuite.google.com/app/apikey and add to .env.local',
      mock: 'No setup required - works out of the box when no API key is provided'
    },
    features: {
      gemini: 'Latest Gemini 2.5 Pro model with 1M tokens/day free tier',
      mock: 'Realistic mock data for testing and development'
    }
  });
}
