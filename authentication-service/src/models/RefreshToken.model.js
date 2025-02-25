const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expires: { type: Date, required: true },
},
{timestamps:true}
);

refreshTokenSchema.index({expiresAt:1},{expireAfterSeconds:0});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;