import crypto from "crypto";
import bcrypt from "bcryptjs";

import PasswordResetToken from "../models/PasswordResetToken.js";
import User from "../models/User.js";

import {
  asyncHandler,
} from "../utils/asyncHandler.js";

import {
  clearAuthCookie,
} from "../utils/auth.js";

import {
  sendEmail,
} from "../utils/email.js";

import {
  passwordResetEmail,
} from "../utils/emailTemplates.js";

const RESET_TOKEN_EXPIRY_MINUTES = 30;

const genericForgotPasswordResponse = {
  success: true,
  message:
    "If an account exists with this email, a password reset link has been sent.",
};

function hashResetToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export const forgotPassword = asyncHandler(
  async (req, res) => {
    const email = String(
      req.body.email || "",
    )
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const user = await User.findOne({
      email,
    });

    // Same response denge taaki koi email existence
    // detect na kar sake.
    if (!user) {
      return res.status(200).json(
        genericForgotPasswordResponse,
      );
    }

    const rawToken = crypto
      .randomBytes(32)
      .toString("hex");

    const tokenHash =
      hashResetToken(rawToken);

    const expiresAt = new Date(
      Date.now() +
        RESET_TOKEN_EXPIRY_MINUTES *
          60 *
          1000,
    );

    await PasswordResetToken.findOneAndUpdate(
      {
        user: user._id,
      },
      {
        $set: {
          tokenHash,
          expiresAt,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    const clientUrl = (
      process.env.CLIENT_URL ||
      "http://localhost:5173"
    ).replace(/\/+$/, "");

    const resetUrl =
      `${clientUrl}/reset-password/${rawToken}`;

    const emailContent =
      passwordResetEmail({
        name: user.name,
        resetUrl,
      });

    try {
      await sendEmail({
        to: user.email,
        subject:
          emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    } catch (error) {
      // Email fail hua to unusable token remove kar do.
      await PasswordResetToken.deleteOne({
        user: user._id,
        tokenHash,
      });

      console.error(
        "PASSWORD RESET EMAIL ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send the password reset email. Please try again later.",
      });
    }

    return res.status(200).json(
      genericForgotPasswordResponse,
    );
  },
);

export const resetPassword = asyncHandler(
  async (req, res) => {
    const token = String(
      req.params.token || "",
    ).trim();

    const password = String(
      req.body.password || "",
    );

    const confirmPassword = String(
      req.body.confirmPassword || "",
    );

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset token is required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters",
      });
    }

    if (
      confirmPassword &&
      password !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirm password do not match",
      });
    }

    const tokenHash =
      hashResetToken(token);

    const resetToken =
      await PasswordResetToken.findOne({
        tokenHash,
        expiresAt: {
          $gt: new Date(),
        },
      });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        code: "INVALID_RESET_TOKEN",
        message:
          "This password reset link is invalid or has expired.",
      });
    }

    const user = await User.findById(
      resetToken.user,
    );

    if (!user) {
      await PasswordResetToken.deleteOne({
        _id: resetToken._id,
      });

      return res.status(400).json({
        success: false,
        code: "INVALID_RESET_TOKEN",
        message:
          "This password reset link is invalid or has expired.",
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          passwordHash,

          // Existing device sessions invalidate ho jayenge.
          activeSessionId: null,
        },
      },
    );

    // User ke saare password-reset tokens remove karo.
    await PasswordResetToken.deleteMany({
      user: user._id,
    });

    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message:
        "Your password has been reset successfully. Please sign in with your new password.",
    });
  },
);