const express = require('express');
const {registerUser,loginUser,logoutUser,userRefreshToken} = require('../controllers/auth.controller');
const router = express.Router();


router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout',logoutUser);
router.post('/refresh',userRefreshToken);

module.exports = router;

