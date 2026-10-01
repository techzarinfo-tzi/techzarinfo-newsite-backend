import { rateLimit } from "express-rate-limit";

const limiter = (windowMinutes, limit, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message, status: 0 },
  });

export const apiLimiter = limiter(15, 500, "Too many requests, please try again later");
export const loginLimiter = limiter(15, 10, "Too many login attempts, please try again later");
export const passwordResetLimiter = limiter(60, 5, "Too many reset requests, please try again later");
// Public forms send email, so keep them from being used as a spam relay
export const formLimiter = limiter(60, 10, "Too many submissions, please try again later");
