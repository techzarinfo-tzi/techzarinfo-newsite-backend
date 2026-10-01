import jwt from "jsonwebtoken";
import config from "../config/index.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// The admin panel sends "Bearer/<token>"; the standard "Bearer <token>" is
// accepted too.
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header) return null;
  const match = /^Bearer[\s/]+(\S+)$/i.exec(header.trim());
  return match ? match[1] : null;
};

const unauthorized = (res, message) =>
  res.status(401).json({ message, status: 0 });

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return unauthorized(res, "Authentication required");
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret, { algorithms: ["HS256"] });
  } catch {
    return unauthorized(res, "Invalid or expired token");
  }

  // Tokens stop working as soon as the account is deleted
  const user = await User.findById(payload.id);
  if (!user) {
    return unauthorized(res, "Invalid or expired token");
  }

  req.user = user;
  next();
});

// Lets the very first admin account be created without a token; after that,
// only a signed-in admin can create accounts.
export const verifyTokenUnlessNoUsers = asyncHandler(async (req, res, next) => {
  const hasUsers = await User.exists({});
  if (!hasUsers) return next();
  return verifyToken(req, res, next);
});

export const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, config.jwt.secret, {
    algorithm: "HS256",
    expiresIn: config.jwt.expiresIn,
  });
