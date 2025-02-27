const logger = require('../utils/logger');
const {validatePost} = require('../utils/validation');
const Post = require('../models/post');

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