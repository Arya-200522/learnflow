import User from "../models/User.js";
import VerificationRequest from "../models/VerificationRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getVerificationRequests = asyncHandler(async (req, res) => {
  const requests = await VerificationRequest.find({
    status: "pending",
  })
    .populate("user", "name email createdAt verificationStatus")
    .sort({
      createdAt: -1,
    });

  return res.json({
    requests,
  });
});

export const approveUser = asyncHandler(async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      message: "Verification request not found",
    });
  }

  if (request.status !== "pending") {
    return res.status(400).json({
      message: "Verification request is already processed",
    });
  }

  const user = await User.findByIdAndUpdate(
    request.user,
    {
      isVerified: true,
      verificationStatus: "approved",
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  request.status = "approved";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();

  await request.save();

  return res.json({
    message: "User approved successfully",

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

export const rejectUser = asyncHandler(async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      message: "Verification request not found",
    });
  }

  if (request.status !== "pending") {
    return res.status(400).json({
      message: "Verification request is already processed",
    });
  }

  const user = await User.findByIdAndUpdate(
    request.user,
    {
      isVerified: false,
      verificationStatus: "rejected",
      activeSessionId: null,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  request.status = "rejected";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();

  await request.save();

  return res.json({
    message: "User rejected successfully",
  });
});
