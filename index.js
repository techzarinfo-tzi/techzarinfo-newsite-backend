import config from "./src/config/index.js";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port} (${config.env})`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
