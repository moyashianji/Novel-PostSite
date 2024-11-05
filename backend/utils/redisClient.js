const redis = require('redis');

// 環境変数から Redis URL を取得
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; 

// Redis クライアントを作成
const client = redis.createClient({ url: redisUrl });

// 接続エラーハンドリング
client.on('connect', () => console.log('Connected to Redis'));
client.on('error', (err) => console.error('Redis Client Error', err));

// クライアントの接続確保関数
async function ensureRedisConnection() {
  if (!client.isOpen) {
    await client.connect();
  }
}

module.exports = { client, ensureRedisConnection };