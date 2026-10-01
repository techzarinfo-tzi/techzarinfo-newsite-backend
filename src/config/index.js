import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

dotenv.config({ path: path.join(rootDir, ".env") });

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const list = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const env = process.env.NODE_ENV || "development";

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

const config = {
  env,
  isProduction: env === "production",
  port: parseInt(process.env.PORT, 10) || 4000,
  mongoUri: required("MONGO_URI"),

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  cors: {
    origins: list(
      process.env.CORS_ORIGINS ||
        "https://www.techzarinfo.com,https://www.techzarinfo.in"
    ),
  },

  // Used to build password reset links. The request Origin is only trusted
  // when it is one of these, so a forged header can't redirect the link.
  frontend: {
    defaultUrl: process.env.FRONTEND_URL || "https://www.techzarinfo.com",
    allowedUrls: list(
      process.env.FRONTEND_URLS ||
        "https://www.techzarinfo.com,https://www.techzarinfo.in"
    ),
  },

  mail: {
    service: process.env.MAIL_SERVICE || "gmail",
    user: required("MAIL_USER"),
    pass: required("MAIL_PASS"),
    salesAddress: process.env.MAIL_SALES_ADDRESS || process.env.MAIL_USER,
  },

  paths: {
    uploads: path.join(rootDir, "public/uploads"),
    public: path.join(rootDir, "public"),
    emailViews: path.join(rootDir, "src/views/emails"),
  },

  upload: {
    maxFileSizeBytes: 5 * 1024 * 1024,
  },
};

export default config;
