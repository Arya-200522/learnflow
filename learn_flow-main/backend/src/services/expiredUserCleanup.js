import User from "../models/User.js";
import { deleteUserData } from "../utils/deleteUserData.js";

const ONE_HOUR = 60 * 60 * 1000;

let cleanupRunning = false;

export async function cleanupExpiredUsers() {
  if (cleanupRunning) {
    return;
  }

  cleanupRunning = true;

  try {
    const expiredUsers = await User.find({
      role: "user",
      accessExpiresAt: {
        $ne: null,
        $lte: new Date(),
      },
    })
      .select("_id email accessExpiresAt")
      .lean();

    if (expiredUsers.length === 0) {
      console.log("Expired-user cleanup: no expired users found");
      return;
    }

    let deletedUsers = 0;

    for (const user of expiredUsers) {
      try {
        await deleteUserData(user._id);
        deletedUsers += 1;

        console.log(
          `Expired user deleted: ${user.email}`,
        );
      } catch (error) {
        console.error(
          `Failed to delete expired user ${user.email}:`,
          error.message,
        );
      }
    }

    console.log(
      `Expired-user cleanup completed: ${deletedUsers}/${expiredUsers.length} users deleted`,
    );
  } catch (error) {
    console.error(
      "Expired-user cleanup failed:",
      error.message,
    );
  } finally {
    cleanupRunning = false;
  }
}

export function startExpiredUserCleanup() {
  // Server start hone ke 10 seconds baad first cleanup
  const initialCleanupTimer = setTimeout(() => {
    cleanupExpiredUsers();
  }, 10_000);

  // Uske baad har 1 hour cleanup
  const cleanupInterval = setInterval(() => {
    cleanupExpiredUsers();
  }, ONE_HOUR);

  initialCleanupTimer.unref();
  cleanupInterval.unref();

  console.log(
    "Expired-user cleanup service started",
  );
}