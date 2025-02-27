//Joi is a validation library that allows you to create blueprints or 
// schemas for JavaScript objects to ensure validation of key 
// information. 

const Joi = require('joi');

const validatePost = (data) =>  {
    const schema = Joi.object({
        content: Joi.string().min(50).max(300).required(),
    })
    return schema.validate(data);
}



module.exports = {validatePost};