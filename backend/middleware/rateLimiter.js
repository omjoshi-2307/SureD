const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Allow up to 100 requests per 15 minutes
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again in 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in local development
        const isLocal = req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1";
        return process.env.NODE_ENV !== "production" && isLocal;
    }
});

module.exports = authLimiter;