const logger = require('../utils/logger');
const {validatePost} = require('../utils/validation');
const Post = require('../models/post');
const invalidateTheRedisCache = require('../utils/invalidateCache');

// 1.Create Post:
const createPost = async (req, res) => {
    logger.info("Create post endpoint hit");
    try {
      //validate the schema
      const { error } = validatePost(req.body);
      if (error) {
        logger.warn("Validation error", error.details[0].message);
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const { content, mediaIds } = req.body;
      const newlyCreatedPost = new Post({
        user: req.user.userId,
        content,
        mediaIds: mediaIds || [],
      });
  
      await newlyCreatedPost.save();

      await invalidateTheRedisCache(req,newlyCreatedPost._id.toString());
  
      logger.info("Post created successfully", newlyCreatedPost);
      res.status(201).json({
        success: true,
        message: "Post created successfully",
      });
    } catch (error) {
      logger.error("Error creating post", error);
      res.status(500).json({
        success: false,
        message: "Error creating post",
      });
    }
  };

// 2.GetAll Posts:
const getAllPosts = async (req, res) => {
    logger.info('Get all posts api hits...');
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const startIdx = (page -1) * limit;

      const cacheKey = `posts:${page}:${limit}`;
      const cachedPosts = await req.redisClient.get(cacheKey);

      if(cachedPosts){
        logger.info("Posts fetched from redis cache");
        return res.json(JSON.parse(cachedPosts));
      }

      const posts = await Post.find({})
      .sort({createdAt : -1})
      .skip(startIdx)
      .limit(limit);
      
      //count of total documents
      const totalPostCount = await Post.countDocuments();

      const result = {
        posts,
        currentPage: page,
        totalPages : Math.ceil(totalPostCount/limit),
        totalPosts: totalPostCount
      }

      //save the posts in cache

      await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

      res.json(result);


      
    } catch (error) {
        logger.error('Error in getting all posts', error);
        res.status(500).json({
            status: 'false',
            message: 'Error in getting all posts'
        })
    }
}

// 3.Get Posts:
const getPost = async (req, res) => {
    logger.info('Get post api hits...');
    try {
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cacheKey);
        
        if(cachedPost){
            logger.info("Post fetched from redis cache");
            return res.json(JSON.parse(cachedPost));
        }

        const singlePost = await Post.findById(postId);

        if(!singlePost){
            return res.status(404).json({
                status: 'false',
                message: 'Post not found'
            })
        }

        await req.redisClient.setex(cacheKey, 3600, JSON.stringify(singlePost));

        res.json(singlePost);

    } catch (error) {
        logger.error('Error in getting post', error);
        res.status(500).json({
            status: 'false',
            message: 'Error in getting post'
        })
    }
}

// 4.Update Posts:
const updatePost = async (req, res) => {
  logger.info('Update posts api hits...');
  try {
      const postId = req.params.id;
      const { content, mediaIds } = req.body;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          status: 'false',
          message: 'Post not found'
        });
      }

      post.content = content || post.content;
      post.mediaIds = mediaIds || post.mediaIds;
      await post.save();

      // Invalidate cache for the updated post
      const cacheKey = `post:${postId}`;
      await req.redisClient.del(cacheKey);  // ✅ First, delete old cache
      await req.redisClient.setex(cacheKey, 3600, JSON.stringify(post));  // ✅ Then, update cache with new data

      logger.info('Post updated successfully');
      res.json({
        status: 'true',
        message: 'Post updated successfully',
        post
      });
  } catch (error) {
      logger.error('Error in updating posts', error);
      res.status(500).json({
          status: 'false',
          message: 'Error in updating posts'
      })
  }
}


// 5.Delete Posts:
const deletePost = async (req, res) => {
    logger.info('Delete posts api hits...');
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
          return res.status(404).json({
            status: 'false',
            message: 'Post not found'
          });
        }

        await Post.findByIdAndDelete(postId);

        // Invalidate cache for the deleted post
        const cacheKey = `post:${postId}`;
        await req.redisClient.del(cacheKey);

        logger.info('Post deleted successfully');
        res.json({
          status: 'true',
          message: 'Post deleted successfully'
        });

    } catch (error) {
        logger.error('Error in deleting posts', error);
        res.status(500).json({
            status: 'false',
            message: 'Error in deleting posts'
        })
    }
}

module.exports = {
    createPost,
    getAllPosts,
    getPost,
    updatePost,
    deletePost
}