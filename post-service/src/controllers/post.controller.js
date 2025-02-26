const logger = require('../utils/logger');

// 1.Create Post:
const createPost = async (req, res) => {
    logger.info('Creating a new post api hits...');
    try {
        const {content,mediaIds} = req.body;
        if(!content || !mediaIds){
            return res.status(400).json({
                status: 'false',
                message: 'Content or mediaIds is required'
            })
        }

        // Create a new post
        const newPost = {
            content,
            mediaIds:mediaIds || [],
            user: req.user.userId
        }

        // Save the post to the database
        const post = await Post.create(newPost);
        await post.save();

        res.status(201).json({
            status: 'true',
            message: 'Post created successfully',
            data: post
        });

    } catch (error) {
        logger.error('Error in creating a new post', error);
        res.status(500).json({
            status: 'false',
            message: 'Error in creating a new post'
        })
    }
}

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