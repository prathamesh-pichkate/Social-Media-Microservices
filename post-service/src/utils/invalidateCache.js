const invalidateTheRedisCache = async (req,input) => {
    // Invalidate cache for the deleted post
    const cacheKey = `post:${input}`;
    await req.redisClient.del(cacheKey);

    const keys = await req.redisClient.keys("posts:*");
    if(keys.length > 0){
        await req.redisClient.del(keys);
    }
}

module.exports = invalidateTheRedisCache;