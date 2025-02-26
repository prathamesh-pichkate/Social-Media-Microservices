const logger = require('../utils/logger');

const checkUserIsAuthenticated = (req, res, next) => { 
    const userId = req.headers['x-user-id'];

    if(!userId){
        return res.status(401).json({
            status: 'false',
            message: 'User is not authenticated! Please login to continuse'
        })
    }

    req.user = {
        userId
    }
    next();
}

module.exports = checkUserIsAuthenticated;  