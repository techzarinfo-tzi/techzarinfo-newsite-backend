import crypto from "node:crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import config from "../config/index.js";
import User from "../models/User.js";
import { sendPasswordReset } from "../services/mail.service.js";
import { signToken } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Compared against when the email is unknown, so a login takes the same time
// whether or not the account exists
const dummyHash = User.hashPassword(crypto.randomBytes(16).toString("hex"));

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Links go to the site the request came from, but only if it's a known domain
const frontendUrlFor = (req) => {
  const { origin } = req.headers;
  return config.frontend.allowedUrls.includes(origin)
    ? origin
    : config.frontend.defaultUrl;
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    return res.status(200).json({
      message: "Your email is Already Exists",
      status: 0,
    });
  }

  await User.create({
    name,
    email,
    password: await User.hashPassword(password),
  });
  return res.status(200).json({
    message: "Your request sent successfully",
    status: 1,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  const passwordMatches = user
    ? await user.comparePassword(password)
    : (await bcrypt.compare(password, await dummyHash)) && false;

  // One message for both cases so the form can't be used to discover accounts
  if (!user || !passwordMatches) {
    return res.status(200).json({
      message: "Invalid email or password",
      status: 0,
    });
  }

  const bearer = `Bearer/${signToken(user)}`;
  return res.setHeader("authorization", bearer).status(200).json({
    message: "Your request sent successfully",
    status: 1,
    data: bearer,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  // Same response whether or not the email exists, so accounts can't be enumerated
  const genericResponse = {
    message: "If that email is registered, a reset link has been sent",
    status: 1,
  };

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(200).json(genericResponse);
  }

  // Send the raw token by email, store only its hash
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = hashResetToken(resetToken);
  user.resetPasswordExpires = Date.now() + RESET_TOKEN_TTL_MS;
  await user.save();

  try {
    await sendPasswordReset({
      to: user.email,
      name: user.name,
      resetLink: `${frontendUrlFor(req)}/admin/reset-password/${resetToken}`,
    });
  } catch (err) {
    console.error("Failed to send password reset email:", err.message);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(500).json({
      message: "Could not send reset email, please try again later",
      status: 0,
    });
  }

  return res.status(200).json(genericResponse);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: hashResetToken(req.params.token),
    // trusted(): sanitizeFilter would otherwise strip this $gt
    resetPasswordExpires: mongoose.trusted({ $gt: Date.now() }),
  });
  if (!user) {
    return res.status(200).json({
      message: "Reset link is invalid or has expired",
      status: 0,
    });
  }

  user.password = await User.hashPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.status(200).json({
    message: "Your password has been reset successfully",
    status: 1,
  });
});
