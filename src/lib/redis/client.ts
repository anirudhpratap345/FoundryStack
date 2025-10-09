import { createClient, RedisClientType } from 'redis';
import { getRedisConfig } from './config';

// Redis client configuration
const redisConfig = getRedisConfig();

// Create Redis client
let redisClient: RedisClientType | null = null;
let useMockClient = false;
let mockClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  // If we're using mock client, return it immediately
  if (useMockClient) {
    if (!mockClient) {
      mockClient = createMockRedisClient();
    }
    return mockClient;
  }
  
  if (!redisClient) {
    try {
      redisClient = createClient(redisConfig);
      
      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });
      
      redisClient.on('connect', () => {
        console.log('Redis Client Connected');
      });
      
      redisClient.on('ready', () => {
        console.log('Redis Client Ready');
      });
      
      redisClient.on('end', () => {
        console.log('Redis Client Disconnected');
      });
      
      await redisClient.connect();
    } catch (error) {
      console.error('Failed to connect to Redis, using mock client:', error);
      // Switch to mock client mode
      useMockClient = true;
      if (!mockClient) {
        mockClient = createMockRedisClient();
      }
      return mockClient;
    }
  }
  
  return redisClient;
};

// Mock Redis client for development when Redis is not available
const createMockRedisClient = (): RedisClientType => {
  const mockData = new Map<string, string>();
  
  return {
    get: async (key: string) => {
      return mockData.get(key) || null;
    },
    set: async (key: string, value: string) => {
      mockData.set(key, value);
      return 'OK';
    },
    setex: async (key: string, seconds: number, value: string) => {
      mockData.set(key, value);
      // Simulate expiration by removing after timeout
      setTimeout(() => mockData.delete(key), seconds * 1000);
      return 'OK';
    },
    del: async (key: string) => {
      mockData.delete(key);
      return 1;
    },
    exists: async (key: string) => {
      return mockData.has(key) ? 1 : 0;
    },
    incr: async (key: string) => {
      const current = parseInt(mockData.get(key) || '0');
      const newValue = current + 1;
      mockData.set(key, newValue.toString());
      return newValue;
    },
    expire: async (key: string, seconds: number) => {
      if (mockData.has(key)) {
        setTimeout(() => mockData.delete(key), seconds * 1000);
        return 1;
      }
      return 0;
    },
    hget: async (key: string, field: string) => {
      const data = mockData.get(key);
      if (data) {
        try {
          const obj = JSON.parse(data);
          return obj[field] || null;
        } catch {
          return null;
        }
      }
      return null;
    },
    hset: async (key: string, field: string, value: string) => {
      const data = mockData.get(key);
      let obj = {};
      if (data) {
        try {
          obj = JSON.parse(data);
        } catch {
          obj = {};
        }
      }
      obj[field] = value;
      mockData.set(key, JSON.stringify(obj));
      return 1;
    },
    hgetall: async (key: string) => {
      const data = mockData.get(key);
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return {};
        }
      }
      return {};
    },
    // Add other methods as needed
    connect: async () => {
      console.log('Mock Redis Client Connected');
    },
    disconnect: async () => {
      console.log('Mock Redis Client Disconnected');
    },
    isOpen: true,
    isReady: true,
    // Add other required properties with default values
    quit: async () => 'OK',
    ping: async () => 'PONG',
    flushAll: async () => {
      mockData.clear();
      return 'OK';
    },
    keys: async (pattern: string) => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Array.from(mockData.keys()).filter(key => regex.test(key));
    },
    ttl: async (key: string) => -1, // Mock TTL
    type: async (key: string) => 'string',
    lpush: async (key: string, ...values: string[]) => {
      const data = mockData.get(key);
      let list = [];
      if (data) {
        try {
          list = JSON.parse(data);
        } catch {
          list = [];
        }
      }
      list.unshift(...values);
      mockData.set(key, JSON.stringify(list));
      return list.length;
    },
    rpop: async (key: string) => {
      const data = mockData.get(key);
      if (data) {
        try {
          const list = JSON.parse(data);
          if (list.length > 0) {
            const item = list.pop();
            mockData.set(key, JSON.stringify(list));
            return item;
          }
        } catch {
          return null;
        }
      }
      return null;
    },
    llen: async (key: string) => {
      const data = mockData.get(key);
      if (data) {
        try {
          const list = JSON.parse(data);
          return list.length;
        } catch {
          return 0;
        }
      }
      return 0;
    },
    publish: async (channel: string, message: string) => 0,
    subscribe: async (channel: string) => {},
    unsubscribe: async (channel: string) => {},
    on: (event: string, callback: Function) => {},
    off: (event: string, callback: Function) => {},
    removeAllListeners: (event?: string) => {},
    // Add other RedisClientType properties as needed
  } as RedisClientType;
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});
