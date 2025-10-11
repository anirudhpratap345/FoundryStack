/**
 * Finance Strategy API
 * POST /api/finance-strategy - Generate funding strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateFinanceStrategy } from '@/lib/agents/finance-agents';
import { validateStartupInputs, sanitizeStartupInputs } from '@/lib/validation/finance-inputs';
import type { StartupInputs, FinanceStrategyResponse } from '@/types/finance-copilot';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const inputs: StartupInputs = body.inputs || body;

    console.log(`📨 Finance strategy request for: ${inputs.startupName}`);

    // Validate inputs
    const validation = validateStartupInputs(inputs);
    
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validation.errors.map(e => e.message).join(', '),
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Input warnings:', validation.warnings);
    }

    // Sanitize inputs
    const sanitizedInputs = sanitizeStartupInputs(inputs);

    // Generate strategy using AI agent chain
    console.log('🤖 Calling AI agent chain...');
    const strategy = await generateFinanceStrategy(sanitizedInputs);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Strategy generated in ${processingTime}ms`);

    // Return successful response
    const response: FinanceStrategyResponse = {
      success: true,
      strategy,
      generatedAt: new Date().toISOString(),
      processingTime,
    };

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Finance strategy generation error:', error);

    // Handle specific error types
    let errorMessage = 'Failed to generate finance strategy';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('GEMINI_API_KEY')) {
        errorMessage = 'AI service not configured';
        statusCode = 503;
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'AI service rate limit exceeded. Please try again in a moment.';
        statusCode = 429;
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = 'AI generated invalid response. Please try again.';
        statusCode = 500;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        generatedAt: new Date().toISOString(),
        processingTime,
      },
      { status: statusCode }
    );
  }
}

// Health check endpoint
export async function GET() {
  const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  
  return NextResponse.json({
    status: 'ok',
    service: 'finance-strategy',
    configured: hasApiKey,
    timestamp: new Date().toISOString(),
  });
}

