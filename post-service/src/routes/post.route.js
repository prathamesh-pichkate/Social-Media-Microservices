const express = require('express');
const {createPost,getAllPosts,getPost,updatePost,deletePost} = require("../controllers/post.controller");
const checkUserIsAuthenticated = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(checkUserIsAuthenticated);

router.post('/create-post', createPost);

module.exports = router;



