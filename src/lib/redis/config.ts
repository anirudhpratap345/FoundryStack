// Redis configuration
export const REDIS_CONFIG = {
  // Default Redis URL
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Connection options
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.error('Redis connection failed after 10 retries');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 100, 3000);
    },
    connectTimeout: 10000,
    lazyConnect: true
  },
  
  // Redis options
  commandsQueueMaxLength: 1000,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  
  // Cache TTL settings (in seconds)
  ttl: {
    BLUEPRINT: 3600,        // 1 hour
    PIPELINE: 1800,         // 30 minutes
    RATE_LIMIT: 3600,       // 1 hour
    SESSION: 86400,         // 24 hours
    DRAFT: 604800,          // 7 days
    USER_PREFS: 7200,       // 2 hours
    API_RESPONSE: 300,      // 5 minutes
    QUERY_RESULT: 600       // 10 minutes
  },
  
  // Rate limiting settings
  rateLimit: {
    BLUEPRINT_CREATE: 10,   // 10 requests per hour
    BLUEPRINT_GET: 100,     // 100 requests per hour
    PIPELINE_EXECUTE: 5,    // 5 requests per hour
    API_GENERAL: 1000       // 1000 requests per hour
  }
};

// Environment-specific configurations
export const getRedisConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isDevelopment) {
    return {
      ...REDIS_CONFIG,
      // Development: Use mock Redis if connection fails
      fallbackToMock: true,
      logLevel: 'debug'
    };
  }
  
  if (isProduction) {
    const baseConfig: any = {
      ...REDIS_CONFIG,
      // Production: Strict Redis requirements
      fallbackToMock: false,
      logLevel: 'error',
      socket: {
        ...REDIS_CONFIG.socket
      }
    };
    
    // Only add TLS if explicitly enabled
    if (process.env.REDIS_TLS === 'true') {
      baseConfig.socket.tls = true;
    }
    
    return baseConfig;
  }
  
  return REDIS_CONFIG;
};

