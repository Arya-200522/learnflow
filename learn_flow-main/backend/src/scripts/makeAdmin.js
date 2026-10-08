import "dotenv/config";
import mongoose from "mongoose";

import { connectDatabase } from "../config/db.js";
import User from "../models/User.js";

const email =
  process.argv[2]
    ?.trim()
    .toLowerCase();

async function run() {
  if (!email) {
    throw new Error(
      "Usage: npm run make:admin -- admin@example.com",
    );
  }

  await connectDatabase();

  const user =
    await User.findOneAndUpdate(
      {
        email,
      },
      {
        role: "admin",
        isVerified: true,
        verificationStatus:
          "approved",
      },
      {
        new: true,
        runValidators: true,
      },
    );

  if (!user) {
    throw new Error(
      `User not found: ${email}`,
    );
  }

  console.log(
    `Admin ready: ${user.email}`,
  );

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});