import { NextRequest, NextResponse } from 'next/server';
import { CacheService, BlueprintCache, PipelineCache, CacheKeys } from '@/lib/redis/cache';

// GET /api/redis/cache - Get cache statistics
export async function GET() {
  try {
    const client = await CacheService.getClient();
    
    // Get cache statistics
    const stats = {
      blueprints: await getCacheStats('blueprint:*'),
      pipelines: await getCacheStats('pipeline:*'),
      rateLimits: await getCacheStats('rate_limit:*'),
      sessions: await getCacheStats('session:*'),
      drafts: await getCacheStats('draft:*')
    };
    
    return NextResponse.json({
      status: 'success',
      cache: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to get cache statistics:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/redis/cache - Clear cache
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const key = searchParams.get('key');
    
    if (key) {
      // Clear specific key
      const success = await CacheService.delete(key);
      return NextResponse.json({
        status: success ? 'success' : 'error',
        message: success ? `Cleared cache key: ${key}` : 'Failed to clear cache key',
        key
      });
    }
    
    if (type) {
      // Clear specific type
      const pattern = `${type}:*`;
      const keys = await CacheService.getClient().then(client => client.keys(pattern));
      
      if (keys.length === 0) {
        return NextResponse.json({
          status: 'success',
          message: `No ${type} cache entries found`,
          cleared: 0
        });
      }
      
      const results = await Promise.all(keys.map(k => CacheService.delete(k)));
      const cleared = results.filter(r => r).length;
      
      return NextResponse.json({
        status: 'success',
        message: `Cleared ${cleared} ${type} cache entries`,
        cleared,
        total: keys.length
      });
    }
    
    // Clear all cache
    const allKeys = await CacheService.getClient().then(client => client.keys('*'));
    const results = await Promise.all(allKeys.map(k => CacheService.delete(k)));
    const cleared = results.filter(r => r).length;
    
    return NextResponse.json({
      status: 'success',
      message: `Cleared ${cleared} cache entries`,
      cleared,
      total: allKeys.length
    });
    
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/redis/cache - Warm up cache
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'warmup') {
      // Warm up frequently accessed data
      const warmupResults = [];
      
      // Warm up common blueprints
      const commonBlueprints = ['mock-1', 'mock-2', 'mock-3'];
      for (const blueprintId of commonBlueprints) {
        try {
          const cached = await BlueprintCache.getBlueprint(blueprintId);
          if (!cached) {
            // This would trigger blueprint generation in a real scenario
            warmupResults.push({
              type: 'blueprint',
              id: blueprintId,
              status: 'would_cache'
            });
          } else {
            warmupResults.push({
              type: 'blueprint',
              id: blueprintId,
              status: 'already_cached'
            });
          }
        } catch (error) {
          warmupResults.push({
            type: 'blueprint',
            id: blueprintId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return NextResponse.json({
        status: 'success',
        message: 'Cache warm-up completed',
        results: warmupResults,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      status: 'error',
      error: 'Invalid action. Supported actions: warmup'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Failed to warm up cache:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to get cache statistics
async function getCacheStats(pattern: string) {
  try {
    const client = await CacheService.getClient();
    const keys = await client.keys(pattern);
    
    return {
      count: keys.length,
      keys: keys.slice(0, 10), // Show first 10 keys
      hasMore: keys.length > 10
    };
  } catch (error) {
    return {
      count: 0,
      keys: [],
      hasMore: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

