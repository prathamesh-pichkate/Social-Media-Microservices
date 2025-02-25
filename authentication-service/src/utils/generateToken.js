const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken.model');

const generateToken = async(user) =>{
    const accessToken = jwt.sign(
        {
            userId: user._id,
            username: user.username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE,
        }
    )


const refreshToken = crypto.randomBytes(64).toString('hex');
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);

await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expires: expiresAt,
});

return {accessToken,refreshToken};
};

module.exports = generateToken;