import User from "../models/User.js";

import { asyncHandler } from "../utils/asyncHandler.js";

function createTwoYearAccess() {
  const accessStartedAt = new Date();

  const accessExpiresAt = new Date(accessStartedAt);

  accessExpiresAt.setUTCFullYear(accessExpiresAt.getUTCFullYear() + 2);

  return {
    accessStartedAt,
    accessExpiresAt,
  };
}

export const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    role: "user",
    isVerified: false,
  })
    .select("name email role isVerified createdAt")
    .sort({
      createdAt: -1,
    });

  return res.status(200).json({
    count: users.length,
    users,
  });
});

export const approveUser = asyncHandler(async (req, res) => {
  const { accessStartedAt, accessExpiresAt } = createTwoYearAccess();

  const user = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      role: "user",
      isVerified: false,
    },
    {
      $set: {
        isVerified: true,
        accessStartedAt,
        accessExpiresAt,
        activeSessionId: null,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).select(
    [
      "name",
      "email",
      "role",
      "isVerified",
      "accessStartedAt",
      "accessExpiresAt",
      "createdAt",
    ].join(" "),
  );

  if (!user) {
    return res.status(404).json({
      message: "Pending user not found",
    });
  }

  return res.status(200).json({
    message: "User approved with 2 years of access",

    user,
  });
});

export const removePendingUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({
    _id: req.params.id,
    role: "user",
    isVerified: false,
  });

  if (!user) {
    return res.status(404).json({
      message: "Pending user not found",
    });
  }

  return res.status(200).json({
    message: "Pending user removed successfully",
  });
});

export const getApprovalSummary = asyncHandler(async (req, res) => {
  const now = new Date();

  const [pendingUsers, verifiedUsers, expiredUsers] = await Promise.all([
    User.countDocuments({
      role: "user",
      isVerified: false,
    }),

    User.countDocuments({
      role: "user",
      isVerified: true,

      accessExpiresAt: {
        $gt: now,
      },
    }),

    User.countDocuments({
      role: "user",
      isVerified: true,

      accessExpiresAt: {
        $lte: now,
      },
    }),
  ]);

  return res.status(200).json({
    pendingUsers,
    verifiedUsers,
    expiredUsers,

    totalUsers: pendingUsers + verifiedUsers + expiredUsers,
  });
});
