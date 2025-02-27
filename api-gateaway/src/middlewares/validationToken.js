const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        logger .warn("Access denied, token not provided");
        return res.status(403).json({
            status: "false",
            message: "Access denied, token not provided"
        })
    }
    
    console.log("JWT secrect is",process.env.JWT_SECRET);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err){
            logger.error("Invalid token", err);
            return res.status(429).json({
                status: "false",
                message: "Invalid token"
            })
        }

        req.user = user;
        next();
    })
}

module.exports = validateToken;