import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis/client';
import { CacheService } from '@/lib/redis/cache';

// GET /api/redis/health - Check Redis connection and performance
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test Redis connection
    const client = await getRedisClient();
    
    // Test basic operations
    const testKey = 'health_check_test';
    const testValue = 'redis_working';
    
    // Test set operation
    await CacheService.set(testKey, testValue, 10);
    
    // Test get operation
    const retrievedValue = await CacheService.get(testKey);
    
    // Test delete operation
    await CacheService.delete(testKey);
    
    // Test increment operation
    const incrementKey = 'health_check_counter';
    const count = await CacheService.increment(incrementKey, 10);
    await CacheService.delete(incrementKey);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Check if Redis is working properly
    const isHealthy = retrievedValue === testValue && count === 1;
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      redis: {
        connected: true,
        responseTime: `${responseTime}ms`,
        operations: {
          set: 'success',
          get: 'success',
          delete: 'success',
          increment: 'success'
        }
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
    
  } catch (error) {
    console.error('Redis health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      redis: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }, { status: 503 });
  }
}

// POST /api/redis/health - Test Redis performance
export async function POST() {
  try {
    const startTime = Date.now();
    const testOperations = 100;
    const results = [];
    
    // Test multiple operations
    for (let i = 0; i < testOperations; i++) {
      const key = `perf_test_${i}`;
      const value = { test: i, timestamp: Date.now() };
      
      // Set operation
      await CacheService.set(key, value, 60);
      
      // Get operation
      const retrieved = await CacheService.get(key);
      
      // Delete operation
      await CacheService.delete(key);
      
      results.push({
        operation: i,
        success: retrieved?.test === i
      });
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / testOperations;
    const successRate = results.filter(r => r.success).length / testOperations;
    
    return NextResponse.json({
      status: 'success',
      performance: {
        totalOperations: testOperations,
        totalTime: `${totalTime}ms`,
        averageTime: `${avgTime.toFixed(2)}ms`,
        successRate: `${(successRate * 100).toFixed(2)}%`,
        operationsPerSecond: Math.round(testOperations / (totalTime / 1000))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Redis performance test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

