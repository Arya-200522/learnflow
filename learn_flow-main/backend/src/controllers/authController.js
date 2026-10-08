import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import { clearAuthCookie, createToken, setAuthCookie } from "../utils/token.js";

function publicUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    accessStartedAt: user.accessStartedAt || null,
    accessExpiresAt: user.accessExpiresAt || null,
  };
}
export const register = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();

  const email = req.body.email?.trim().toLowerCase();

  const password = req.body.password;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  const existingUser = await User.exists({
    email,
  });

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this email already exists",
    });
  }

  await User.createWithPassword({
    name,
    email,
    password,
  });

  return res.status(201).json({
    pending: true,

    message:
      "Registration successful. Wait for admin approval before signing in.",
  });
});

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({
    email,
  }).select("+passwordHash +activeSessionId");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      code: "ACCOUNT_PENDING",

      message: "Your account is waiting for admin approval",
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

  let sessionId = null;

  if (user.role === "user") {
    sessionId = crypto.randomUUID();

    user.activeSessionId = sessionId;

    await user.save({
      validateBeforeSave: false,
    });
  }

  const token = createToken(user._id.toString(), sessionId);

  setAuthCookie(res, token);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: publicUser(user),
  });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user.role === "user" && req.user.activeSessionId === req.sessionId) {
    req.user.activeSessionId = null;

    await req.user.save({
      validateBeforeSave: false,
    });
  }

  clearAuthCookie(res);

  return res.status(200).json({
    message: "Signed out successfully",
  });
});

export const me = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
});
