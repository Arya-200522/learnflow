import express from "express";

import rateLimit from "express-rate-limit";

import {
  login,
  logout,
  me,
  register,
} from "../controllers/authController.js";

import {
  protect,
} from "../middleware/auth.js";
import { forgotPassword, resetPassword } from "../controllers/passwordController.js";

const router =
  express.Router();

const authLimiter = rateLimit({
  windowMs:
    15 * 60 * 1000,

  limit: 30,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

router.post(
  "/register",
  authLimiter,
  register,
);

router.post(
  "/login",
  authLimiter,
  login,
);
// Request password-reset email
router.post(
  "/forgot-password",
  forgotPassword,
);

// Set new password using reset token
router.post(
  "/reset-password/:token",
  resetPassword,
);

router.post(
  "/logout",
  protect,
  logout,
);

router.get(
  "/me",
  protect,
  me,
);

export default router;