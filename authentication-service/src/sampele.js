const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redisClient.ping()
  .then((result) => console.log("Redis Connected:", result))
  .catch((err) => console.error("Redis Connection Failed:", err));
