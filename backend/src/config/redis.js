const { createClient } = require('redis');

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
});

client.on('error', (err) => console.error('Redis error:', err));

const connectRedis = async () => {
  await client.connect();
  console.log('✓ Redis connected');
};

module.exports = { redis: client, connectRedis };
