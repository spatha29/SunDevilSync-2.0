const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (error) => {
      logger.error('Redis error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

module.exports = {
  connectRedis,
  getRedisClient,
};
