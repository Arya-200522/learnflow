import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { startExpiredUserCleanup } from "./services/expiredUserCleanup.js";
const port = Number(process.env.PORT) || 5000;

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error("MONGODB_URI and JWT_SECRET are required");
  }
  await connectDatabase();
  startExpiredUserCleanup();
  app.listen(port, () => console.log(`LearnFlow API running on port ${port}`));
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
