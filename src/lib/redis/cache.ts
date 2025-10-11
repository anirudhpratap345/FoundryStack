import { getRedisClient } from './client';
import { REDIS_CONFIG } from './config';

// Cache configuration
const CACHE_CONFIG = {
  // Blueprint cache - reduced to 5 minutes for better testing/iteration
  // Production: consider increasing to 3600 (1 hour) once blueprint uniqueness is verified
  BLUEPRINT_TTL: 300, // 5 minutes
  // Pipeline cache - reduced to 5 minutes to ensure fresh generation
  PIPELINE_TTL: 300, // 5 minutes
  // Rate limit window - 1 hour
  RATE_LIMIT_TTL: REDIS_CONFIG.ttl.RATE_LIMIT,
  // Session cache - 24 hours
  SESSION_TTL: REDIS_CONFIG.ttl.SESSION,
  // Draft cache - 7 days
  DRAFT_TTL: REDIS_CONFIG.ttl.DRAFT,
};

// Cache key generators
export const CacheKeys = {
  blueprint: (id: string) => `blueprint:${id}`,
  blueprintVersion: (id: string, version: string) => `blueprint:${id}:${version}`,
  pipeline: (queryHash: string) => `pipeline:${queryHash}`,
  pipelineStep: (queryHash: string, step: string) => `pipeline:${queryHash}:${step}`,
  rateLimit: (userId: string, endpoint: string) => `rate_limit:${userId}:${endpoint}`,
  session: (sessionId: string) => `session:${sessionId}`,
  draft: (userId: string, blueprintId: string) => `draft:${userId}:${blueprintId}`,
  userPrefs: (userId: string) => `user:${userId}:prefs`,
};

// Generic cache operations
export class CacheService {
  private static async getClient() {
    return await getRedisClient();
  }

  // Get cached data
  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set cached data with TTL
  static async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const client = await this.getClient();
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, serialized);
      } else {
        await client.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete cached data
  static async delete(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Increment counter (for rate limiting)
  static async increment(key: string, ttlSeconds?: number): Promise<number> {
    try {
      const client = await this.getClient();
      const count = await client.incr(key);
      
      // Set TTL on first increment
      if (count === 1 && ttlSeconds) {
        await client.expire(key, ttlSeconds);
      }
      
      return count;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  // Hash operations
  static async hget(key: string, field: string): Promise<string | null> {
    try {
      const client = await this.getClient();
      return await client.hGet(key, field);
    } catch (error) {
      console.error('Cache hget error:', error);
      return null;
    }
  }
  
  static async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      await client.hSet(key, field, value);
      return true;
    } catch (error) {
      console.error('Cache hset error:', error);
      return false;
    }
  }
  
  static async hgetall(key: string): Promise<Record<string, string>> {
    try {
      const client = await this.getClient();
      return await client.hGetAll(key);
    } catch (error) {
      console.error('Cache hgetall error:', error);
      return {};
    }
  }
}

// Blueprint-specific cache operations
export class BlueprintCache {
  // Cache blueprint data
  static async cacheBlueprint(blueprintId: string, blueprint: any): Promise<boolean> {
    const key = CacheKeys.blueprint(blueprintId);
    return await CacheService.set(key, blueprint, CACHE_CONFIG.BLUEPRINT_TTL);
  }

  // Get cached blueprint
  static async getBlueprint(blueprintId: string): Promise<any | null> {
    const key = CacheKeys.blueprint(blueprintId);
    return await CacheService.get(key);
  }

  // Invalidate blueprint cache
  static async invalidateBlueprint(blueprintId: string): Promise<boolean> {
    const key = CacheKeys.blueprint(blueprintId);
    return await CacheService.delete(key);
  }

  // Cache blueprint with version
  static async cacheBlueprintVersion(blueprintId: string, version: string, blueprint: any): Promise<boolean> {
    const key = CacheKeys.blueprintVersion(blueprintId, version);
    return await CacheService.set(key, blueprint, CACHE_CONFIG.BLUEPRINT_TTL);
  }

  // Get cached blueprint version
  static async getBlueprintVersion(blueprintId: string, version: string): Promise<any | null> {
    const key = CacheKeys.blueprintVersion(blueprintId, version);
    return await CacheService.get(key);
  }
}

// Pipeline-specific cache operations
export class PipelineCache {
  // Cache pipeline result
  static async cachePipeline(queryHash: string, result: any): Promise<boolean> {
    const key = CacheKeys.pipeline(queryHash);
    return await CacheService.set(key, result, CACHE_CONFIG.PIPELINE_TTL);
  }

  // Get cached pipeline result
  static async getPipeline(queryHash: string): Promise<any | null> {
    const key = CacheKeys.pipeline(queryHash);
    return await CacheService.get(key);
  }

  // Cache individual pipeline step
  static async cacheStep(queryHash: string, step: string, result: any): Promise<boolean> {
    const key = CacheKeys.pipelineStep(queryHash, step);
    return await CacheService.set(key, result, CACHE_CONFIG.PIPELINE_TTL);
  }

  // Get cached pipeline step
  static async getStep(queryHash: string, step: string): Promise<any | null> {
    const key = CacheKeys.pipelineStep(queryHash, step);
    return await CacheService.get(key);
  }

  // Invalidate pipeline cache
  static async invalidatePipeline(queryHash: string): Promise<boolean> {
    const pipelineKey = CacheKeys.pipeline(queryHash);
    const stepKeys = [
      CacheKeys.pipelineStep(queryHash, 'retriever'),
      CacheKeys.pipelineStep(queryHash, 'analyst'),
      CacheKeys.pipelineStep(queryHash, 'writer'),
      CacheKeys.pipelineStep(queryHash, 'reviewer'),
      CacheKeys.pipelineStep(queryHash, 'exporter'),
    ];

    const results = await Promise.all([
      CacheService.delete(pipelineKey),
      ...stepKeys.map(key => CacheService.delete(key))
    ]);

    return results.every(result => result);
  }
}

// Rate limiting
export class RateLimiter {
  // Check rate limit
  static async checkRateLimit(userId: string, endpoint: string, limit?: number): Promise<{
    allowed: boolean;
    count: number;
    remaining: number;
    resetTime: number;
  }> {
    // Use configured limits if not specified
    const defaultLimit = limit || REDIS_CONFIG.rateLimit.API_GENERAL;
    const key = CacheKeys.rateLimit(userId, endpoint);
    const count = await CacheService.increment(key, CACHE_CONFIG.RATE_LIMIT_TTL);
    
    return {
      allowed: count <= defaultLimit,
      count,
      remaining: Math.max(0, defaultLimit - count),
      resetTime: Date.now() + (CACHE_CONFIG.RATE_LIMIT_TTL * 1000)
    };
  }

  // Reset rate limit
  static async resetRateLimit(userId: string, endpoint: string): Promise<boolean> {
    const key = CacheKeys.rateLimit(userId, endpoint);
    return await CacheService.delete(key);
  }
}

// Session management
export class SessionCache {
  // Cache session data
  static async cacheSession(sessionId: string, sessionData: any): Promise<boolean> {
    const key = CacheKeys.session(sessionId);
    return await CacheService.set(key, sessionData, CACHE_CONFIG.SESSION_TTL);
  }

  // Get session data
  static async getSession(sessionId: string): Promise<any | null> {
    const key = CacheKeys.session(sessionId);
    return await CacheService.get(key);
  }

  // Update session activity
  static async updateSessionActivity(sessionId: string): Promise<boolean> {
    const key = CacheKeys.session(sessionId);
    const sessionData: any = await CacheService.get(key);
    if (sessionData) {
      sessionData.lastActivity = Date.now();
      return await CacheService.set(key, sessionData, CACHE_CONFIG.SESSION_TTL);
    }
    return false;
  }

  // Delete session
  static async deleteSession(sessionId: string): Promise<boolean> {
    const key = CacheKeys.session(sessionId);
    return await CacheService.delete(key);
  }
}

// Draft management
export class DraftCache {
  // Save draft
  static async saveDraft(userId: string, blueprintId: string, draftData: any): Promise<boolean> {
    const key = CacheKeys.draft(userId, blueprintId);
    const draft = {
      ...draftData,
      lastSaved: Date.now(),
      userId,
      blueprintId
    };
    return await CacheService.set(key, draft, CACHE_CONFIG.DRAFT_TTL);
  }

  // Get draft
  static async getDraft(userId: string, blueprintId: string): Promise<any | null> {
    const key = CacheKeys.draft(userId, blueprintId);
    return await CacheService.get(key);
  }

  // Delete draft
  static async deleteDraft(userId: string, blueprintId: string): Promise<boolean> {
    const key = CacheKeys.draft(userId, blueprintId);
    return await CacheService.delete(key);
  }

  // List user drafts
  static async listUserDrafts(userId: string): Promise<any[]> {
    try {
      // Note: This would require key scanning which is not accessible through the abstraction
      // For now, return empty array. In production, use a separate index or database query
      console.warn('listUserDrafts: Key scanning not supported through cache abstraction');
      return [];
    } catch (error) {
      console.error('List drafts error:', error);
      return [];
    }
  }
}

// Utility function to generate query hash for caching
export function generateQueryHash(query: string): string {
  // Normalize query for better cache key generation
  // Remove common words, normalize whitespace, sort words alphabetically
  const normalized = query
    .toLowerCase()
    .trim()
    // Remove common filler words that don't change meaning
    .replace(/\b(a|an|the|for|of|in|on|at|to|with|by|from|create|generate|build|make|blueprint|startup|app|application|platform|system|service)\b/g, '')
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .split(' ')
    .filter(word => word.length > 0) // Remove empty strings
    .sort() // Sort alphabetically for order-independence
    .join('_');
  
  // Use crypto hash for better distribution and collision resistance
  const crypto = require('crypto');
  return crypto.createHash('md5').update(normalized).digest('hex').substring(0, 16);
}

// Cache warming utility
export class CacheWarmer {
  // Warm up frequently accessed data
  static async warmUp(): Promise<void> {
    try {
      console.log('Starting cache warm-up...');
      
      // Pre-cache common blueprints
      const commonBlueprints = ['mock-1', 'mock-2', 'mock-3'];
      
      for (const blueprintId of commonBlueprints) {
        const cached = await BlueprintCache.getBlueprint(blueprintId);
        if (!cached) {
          console.log(`Pre-caching blueprint: ${blueprintId}`);
          // This would trigger the blueprint generation
          // For now, just log that we would cache it
        }
      }
      
      console.log('Cache warm-up completed');
    } catch (error) {
      console.error('Cache warm-up error:', error);
    }
  }
}
