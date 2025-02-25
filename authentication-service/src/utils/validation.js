//Joi is a validation library that allows you to create blueprints or 
// schemas for JavaScript objects to ensure validation of key 
// information. 

const Joi = require('joi');

const validateRegistration = (data) =>  {
    const schema = Joi.object({
        username: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    })
    return schema.validate(data);
}

const validateLogin = (data) =>{
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    })
    return schema.validate(data);
}

module.exports = {validateRegistration,validateLogin};