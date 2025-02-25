const mongoose = require('mongoose');
const argon2 = require('argon2'); //used for hashing the password
const { type } = require('os');
const { p } = require('framer-motion/client');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
    },
    createdAt:{
        type:Date,
        default: Date.now,
    }
},{timestamps: true});


//hash the password before saving the user
userSchema.pre('save',async function (next){
    if(this.isModified('password')){
        try {
            this.password = await argon2.hash(this.password);
        } catch (error) {
            return next(error);
        }
    }
})

//compare the password
userSchema.methods.comparePassword = async function (password){
    try {
        return await argon2.verify(this.password, password);
    } catch (error) {
        return false;
    }
};

//search the user by username
userSchema.index({username: 'text'});

const User = mongoose.model('User', userSchema);
module.exports = User;