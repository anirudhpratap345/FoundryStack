import { NextResponse } from 'next/server';
import { BlueprintService } from '@/lib/supabase/blueprints';

export async function GET() {
  try {
    // Check database connection
    const blueprints = await BlueprintService.getAll();
    
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GEMINI_API_KEY'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: true,
        blueprintsCount: blueprints.length
      },
      environmentVariables: {
        allPresent: missingEnvVars.length === 0,
        missing: missingEnvVars
      },
      uptime: process.uptime()
    };
    
    if (missingEnvVars.length > 0) {
      health.status = 'degraded';
    }
    
    return NextResponse.json(health, { 
      status: health.status === 'healthy' ? 200 : 503 
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { status: 503 });
  }
}
