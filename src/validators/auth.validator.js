import { body, param } from "express-validator";
import { requiredText, email } from "./common.js";

const emailOptions = { gmail_remove_dots: false };

// bcrypt only uses the first 72 bytes of a password
const newPassword = () =>
  body("password", "Password is required")
    .isString()
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 characters");

export const register = [
  requiredText("name", "Full Name is required", 100),
  email(emailOptions),
  newPassword(),
];

export const login = [
  email(emailOptions),
  body("password", "Password is required").isString().bail().notEmpty().isLength({ max: 200 }),
];

export const forgotPassword = [email(emailOptions)];

export const resetPassword = [
  param("token", "Reset link is invalid or has expired").isHexadecimal().isLength({ min: 64, max: 64 }),
  newPassword(),
];
