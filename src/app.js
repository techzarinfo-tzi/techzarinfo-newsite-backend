import fs from "node:fs";
import path from "node:path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import config from "./config/index.js";
import routes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Behind one reverse proxy (needed for correct client IPs in rate limiting)
app.set("trust proxy", 1);

app.use(
  helmet({
    // Blog images are embedded by the website, which is on another origin
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: config.cors.origins,
    exposedHeaders: ["authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(apiLimiter);

const IMAGE_SIGNATURES = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { type: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], extra: { offset: 8, text: "WEBP" } },
];

const sniffImageType = (filePath) => {
  const buf = Buffer.alloc(12);
  const fd = fs.openSync(filePath, "r");
  try {
    fs.readSync(fd, buf, 0, 12, 0);
  } finally {
    fs.closeSync(fd);
  }
  const match = IMAGE_SIGNATURES.find(
    ({ bytes, extra }) =>
      bytes.every((b, i) => buf[i] === b) &&
      (!extra || buf.toString("ascii", extra.offset, extra.offset + extra.text.length) === extra.text)
  );
  return match?.type;
};

// Older uploads were stored without an extension or any type check, so work
// out their type from the file contents; anything that isn't an image is
// served as a download so it can never render as HTML on this origin.
const uploadHeaders = (res, filePath) => {
  if (path.extname(filePath)) return;
  const type = sniffImageType(filePath);
  if (type) {
    res.setHeader("Content-Type", type);
  } else {
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment");
  }
};

app.use(
  "/uploads",
  express.static(config.paths.uploads, {
    dotfiles: "deny",
    index: false,
    setHeaders: uploadHeaders,
  })
);

app.use("/", routes);
app.use(express.static(config.paths.public, { dotfiles: "deny", index: false }));

app.use(notFound);
app.use(errorHandler);

export default app;
