import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// Admin users. The model keeps its original "Register" name so it keeps
// using the existing "registers" collection.
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
});

userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

// A regular function: Mongoose binds `this` to the document
userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model("Register", userSchema);

export default User;
