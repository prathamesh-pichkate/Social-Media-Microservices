const User = require('../models/user.model');
const RefreshToken = require('../models/RefreshToken.model');
const {validateRegistration,validateLogin} = require('../utils/validation');
const logger = require('../utils/logger');
const generateToken = require('../utils/generateToken');
const { log } = require('winston');

//Register a new user
const registerUser = async (req, res) => {
    logger.info("Registration endpoint hit...");
    try {
      //validate the schema
      const { error } = validateRegistration(req.body);
      if (error) {
        logger.warn("Validation error", error.details[0].message);
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const { email, password, username } = req.body;
  
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        logger.warn("User already exists");
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
  
      user = new User({ username, email, password });
      await user.save();
      logger.warn("User saved successfully", user._id);
  
      const { accessToken, refreshToken } = await generateToken(user);
  
      res.status(201).json({
        success: true,
        message: "User registered successfully!",
        accessToken,
        refreshToken,
      });
    } catch (e) {
      logger.error("Registration error occured", e);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

//Login the user:
const loginUser = async (req, res) => {
  logger.info("Login endpoint hit...");
  try {
    //validate the schema
    const {error} = validateLogin(req.body);
    if(error){
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const {email,password} = req.body;
    
    let user = await User.findOne({email});
    if(!user){
      logger.warn("User not found");
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    //validate the password
    const validatePassword = await user.comparePassword(password);
    if(!validatePassword){
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    const {accessToken,refreshToken} = await generateToken(user);

    res.status(200).json({
      success: true,
      message: "User logged in successfully!",
      accessToken,
      refreshToken,
      userId: user._id
    });

  } catch (e) {
    logger.error("Login error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

//refresh Token:
const userRefreshToken = async (req, res) => {
  logger.info("Refresh token endpoint hit...");
  try {
    const {refreshToken} = req.body;
    if(!refreshToken){
      logger.warn("Refresh token not provided");
      return res.status(400).json({
        success: false,
        message: "Refresh token not provided"
      });
    }

    const storedToken = await RefreshToken.findOne({token: refreshToken});
    if(!storedToken){
      logger.warn("Invalid refresh token");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const user = await User.findById(storedToken.user);
    if(!user){
      logger.warn("User not found");
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    //If user not found generate the refresh and access token:
    const {accessToken:newAccessToken , refreshToken:newRefreshToken } = await generateToken(user);

    //delete the old refresh token
    await RefreshToken.deleteOne({_id: storedToken._id});
    logger.info("Old refresh token deleted");

    res.json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (e) {
    logger.error("Refresh token error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

//Logout the user:
const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit...");
  try {
    const {refreshToken} = req.body;
    if(!refreshToken){
      logger.warn("Refresh token not provided");
      return res.status(400).json({
        success: false,
        message: "Refresh token not provided"
      });
    }

    await RefreshToken.deleteOne({token: refreshToken});
    logger.info("Refresh token deleted");

    res.json({
      success: true,
      message: "User logged out successfully"
    });
  }catch (e) {
    logger.error("Error while logging out", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


module.exports = {registerUser,loginUser,userRefreshToken,logoutUser};