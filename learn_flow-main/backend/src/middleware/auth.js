import jwt from "jsonwebtoken";

import User from "../models/User.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { clearAuthCookie } from "../utils/auth.js";
import { deleteUserData } from "../utils/deleteUserData.js";

export const protect = asyncHandler(async (req, res, next) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const token = req.cookies?.learnflow_token || bearerToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      code: "NOT_AUTHENTICATED",
      message: "Please sign in to continue",
    });
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    clearAuthCookie(res);

    return res.status(401).json({
      success: false,
      code: "INVALID_SESSION",
      message: "Your session has expired. Please sign in again.",
    });
  }

  const user = await User.findById(payload.sub).select(
    "+activeSessionId",
  );

  if (!user) {
    clearAuthCookie(res);

    return res.status(401).json({
      success: false,
      code: "USER_NOT_FOUND",
      message: "User account not found",
    });
  }

  const accessExpired =
    user.role === "user" &&
    user.accessExpiresAt &&
    new Date(user.accessExpiresAt).getTime() <= Date.now();

  if (accessExpired) {
    await deleteUserData(user._id);

    clearAuthCookie(res);

    return res.status(403).json({
      success: false,
      code: "ACCESS_EXPIRED",
      message:
        "Your 2-year course access has expired. Your account and learning data have been removed.",
    });
  }

  if (user.role === "user" && !user.isVerified) {
    clearAuthCookie(res);

    return res.status(403).json({
      success: false,
      code: "ACCOUNT_PENDING",
      message: "Your account is waiting for admin approval",
    });
  }

  if (
    user.role === "user" &&
    (!payload.sid ||
      !user.activeSessionId ||
      payload.sid !== user.activeSessionId)
  ) {
    clearAuthCookie(res);

    return res.status(401).json({
      success: false,
      code: "SESSION_REPLACED",
      message: "Your account was logged in on another device",
    });
  }

  req.user = user;
  req.sessionId = payload.sid || null;

  next();
});