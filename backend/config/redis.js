import redis from 'redis';

let redisClient = null;
let isRedisConnected = false;

const initRedis = async () => {
  try {
    const client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.warn('⚠️ Redis: Max reconnection attempts reached');
            return new Error('Max redis retries');
          }
          return Math.min(retries * 100, 3000);
        }
      },
      password: process.env.REDIS_PASSWORD || undefined,
      // Don't throw on connection error during initialization
      disableOfflineQueue: false
    });

    client.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.warn('⚠️ Redis ECONNREFUSED - ensure Redis server is running on', 
          `${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
      } else if (err.code !== 'NR_CLOSED') {
        console.error('❌ Redis Error:', err.message);
      }
      isRedisConnected = false;
    });

    client.on('connect', () => {
      console.log('✅ Redis Connected Successfully');
      isRedisConnected = true;
    });

    client.on('reconnecting', () => {
      console.log('🔄 Redis Reconnecting...');
    });

    // Try to connect but don't block if it fails
    try {
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
      ]);
      isRedisConnected = true;
      redisClient = client;
      console.log('✅ Redis initialization successful');
    } catch (connectError) {
      console.warn('⚠️ Redis connection failed:', connectError.message);
      console.warn('⚠️ Caching disabled - but app will continue to work');
      // Don't throw - let app continue without Redis
      try {
        await client.quit();
      } catch (e) {
        // Ignore quit errors
      }
    }
    
    return client;
  } catch (error) {
    console.warn('⚠️ Redis initialization error:', error.message);
    console.warn('⚠️ App will continue without Redis caching');
    return null;
  }
};

const getRedisClient = () => redisClient;

const isRedisReady = () => {
  try {
    return isRedisConnected && redisClient && redisClient.isOpen;
  } catch {
    return false;
  }
};

// Cache a single roadmap with 1-hour expiration
const cacheRoadmap = async (roadmapId, roadmapData, ttl = 3600) => {
  try {
    if (!isRedisReady()) return false;
    await redisClient.setEx(
      `roadmap:${roadmapId}`,
      ttl,
      JSON.stringify(roadmapData)
    );
    console.log(`✅ Cached roadmap: ${roadmapId}`);
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to cache roadmap:', error.message);
    return false;
  }
};

// Get cached roadmap
const getCachedRoadmap = async (roadmapId) => {
  try {
    if (!isRedisReady()) return null;
    const cached = await redisClient.get(`roadmap:${roadmapId}`);
    if (cached) {
      console.log(`✅ Retrieved cached roadmap: ${roadmapId}`);
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Failed to retrieve cached roadmap:', error.message);
    return null;
  }
};

// Add to recently opened roadmaps (sorted set by timestamp)
const addRecentlyOpened = async (userId, roadmapId, roadmapName) => {
  try {
    if (!isRedisReady()) return false;
    const timestamp = Date.now();
    const recentKey = `recently_opened:${userId}`;
    
    await redisClient.zAdd(recentKey, {
      score: timestamp,
      member: JSON.stringify({ id: roadmapId, name: roadmapName, timestamp })
    });
    
    // Keep only last 10 recently opened roadmaps
    await redisClient.zRemRangeByRank(recentKey, 0, -11);
    await redisClient.expire(recentKey, 7 * 24 * 3600); // 7 days expiration
    
    console.log(`✅ Added to recently opened: ${roadmapId}`);
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to add recently opened:', error.message);
    return false;
  }
};

// Get recently opened roadmaps
const getRecentlyOpened = async (userId) => {
  try {
    if (!isRedisReady()) return [];
    const recentKey = `recently_opened:${userId}`;
    const recent = await redisClient.zRevRange(recentKey, 0, -1);
    
    return recent.map(item => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.warn('⚠️ Failed to get recently opened:', error.message);
    return [];
  }
};

// Cache roadmaps list for a page with 30-min expiration
const cacheRoadmapsList = async (page, limit, roadmapsData, paginationData) => {
  try {
    if (!isRedisReady()) return false;
    const key = `roadmaps:list:${page}:${limit}`;
    await redisClient.setEx(
      key,
      1800, // 30 minutes
      JSON.stringify({ roadmaps: roadmapsData, pagination: paginationData })
    );
    console.log(`✅ Cached roadmaps list: page ${page}`);
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to cache roadmaps list:', error.message);
    return false;
  }
};

// Get cached roadmaps list
const getCachedRoadmapsList = async (page, limit) => {
  try {
    if (!isRedisReady()) return null;
    const key = `roadmaps:list:${page}:${limit}`;
    const cached = await redisClient.get(key);
    if (cached) {
      console.log(`✅ Retrieved cached roadmaps list: page ${page}`);
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Failed to retrieve cached roadmaps list:', error.message);
    return null;
  }
};

// Clear all caches (useful for admin)
const clearAllCaches = async () => {
  try {
    if (!isRedisReady()) return false;
    await redisClient.flushDb();
    console.log('✅ All caches cleared');
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to clear caches:', error.message);
    return false;
  }
};

export {
  initRedis,
  getRedisClient,
  isRedisReady,
  cacheRoadmap,
  getCachedRoadmap,
  addRecentlyOpened,
  getRecentlyOpened,
  cacheRoadmapsList,
  getCachedRoadmapsList,
  clearAllCaches
};
