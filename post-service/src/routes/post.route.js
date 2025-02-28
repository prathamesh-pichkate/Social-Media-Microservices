const express = require('express');
const {createPost,getAllPosts,getPost,updatePost,deletePost} = require("../controllers/post.controller");
const checkUserIsAuthenticated = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(checkUserIsAuthenticated);

router.post('/create-post', createPost);
router.get('/get-all-posts', getAllPosts);
router.get('/:id',getPost);
router.delete('/:id',deletePost);
router.put('/:id',updatePost);

module.exports = router;



