import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
    commandTimeout: 500,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 5) return null
      return Math.min(times * 100, 3000)
    },
    lazyConnect: true,
  })

  client.on('error', () => {
    // Silently handle connection errors - fallback to DB
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
