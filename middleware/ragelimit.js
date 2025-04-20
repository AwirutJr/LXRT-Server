const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 5, // จำกัดไม่เกิน 5 ครั้งใน 15 นาที
  message: "Too many login attempts from this IP, please try again later.",
});

module.exports = authLimiter;
