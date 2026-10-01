import crypto from "node:crypto";
import fs from "node:fs";
import multer from "multer";
import config from "../config/index.js";
import ApiError from "../utils/ApiError.js";

// SVG is deliberately excluded: it can carry scripts.
const IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

fs.mkdirSync(config.paths.uploads, { recursive: true });

const storage = multer.diskStorage({
  destination: config.paths.uploads,
  // Never trust the client's filename
  filename: (req, file, cb) => {
    cb(null, crypto.randomBytes(16).toString("hex") + IMAGE_TYPES[file.mimetype]);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSizeBytes,
    files: 1,
    fields: 20,
  },
  fileFilter: (req, file, cb) => {
    if (!IMAGE_TYPES[file.mimetype]) {
      return cb(new ApiError(400, "Only JPG, PNG, WEBP or GIF images are allowed"));
    }
    cb(null, true);
  },
});

// Removes an uploaded file that won't be used (e.g. the request failed validation)
export const discardUpload = (file) => {
  if (file) fs.unlink(file.path, () => {});
};

// Parses a multipart form whose file (if any) isn't stored
export const formWithoutFile = (field) => [
  upload.single(field),
  (req, res, next) => {
    discardUpload(req.file);
    req.file = undefined;
    next();
  },
];
