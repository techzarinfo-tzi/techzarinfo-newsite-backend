import mongoose from "mongoose";
import config from "./index.js";

// Strip query operators ($ne, $gt, ...) from user-supplied filter values so
// request bodies like { "email": { "$ne": null } } can't alter queries.
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

const connectDB = async () => {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");
};

export default connectDB;
