import multer from "multer";
import mongoose from "mongoose";
import config from "../config/index.js";
import ApiError from "../utils/ApiError.js";
import { discardUpload } from "./upload.js";

export const notFound = (req, res) => {
  res.status(404).json({ message: "Not found", status: 0 });
};

// Express recognises error handlers by their four parameters, so `next` must stay
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  discardUpload(req.file);

  if (err instanceof ApiError) {
    return res.status(err.httpStatus).json({ message: err.message, status: 0 });
  }
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : err.message;
    return res.status(400).json({ message, status: 0 });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: "Invalid id", status: 0 });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: err.message, status: 0 });
  }
  if (err.code === 11000) {
    const [field = "Value"] = Object.keys(err.keyValue ?? {});
    return res.status(409).json({ message: `${field} already exists`, status: 0 });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body too large", status: 0 });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON", status: 0 });
  }

  console.error(err);
  // Don't leak internals (stack traces, DB/SMTP messages) in production
  return res.status(500).json({
    message: config.isProduction ? "Something went wrong" : err.message,
    status: 0,
  });
};
