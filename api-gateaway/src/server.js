require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");
const helmet = require("helmet");
const logger = require("./utils/logger");
const {rateLimit} = require("express-rate-limit");
const {RedisStore} = require("rate-limit-redis")
const proxy = require("express-http-proxy");
const errorHandler = require("./middlewares/errorhandler");
const validate = require("./middlewares/validationToken")


const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());


//rate limit
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    },
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
  });

app.use(rateLimiter);

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
  });


  const proxyOptions = {
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err, res, next) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(500).json({
        message: `Internal server error`,
        error: err.message,
      });
    },
  };
  
  //setting up proxy for our authentication-service
  app.use(
    "/v1/auth",
    proxy(process.env.AUTHENTICATION_SERVICE_URL, {
      ...proxyOptions,
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        return proxyReqOpts;
      },
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
          `Response received from Identity service: ${proxyRes.statusCode}`
        );
  
        return proxyResData;
      },
    })
  );

  //setting up proxy for our post-service
  app.use("/v1/posts",validate,proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  }));


  app.use(errorHandler);

    app.listen(PORT, () => {
        logger.info(`API Gateway listening on port ${PORT}`);
        logger.info(`Authentication Service is running on ${process.env.AUTHENTICATION_SERVICE_URL} `);
        logger.info(`Post Service is running on ${process.env.POST_SERVICE_URL}`);
        logger.info(`Redis is running on ${process.env.REDIS_URL}`);
      }
    );
