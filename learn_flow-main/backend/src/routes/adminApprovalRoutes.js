import express from "express";

import {
  approveUser,
  getApprovalSummary,
  getPendingUsers,
  removePendingUser,
} from "../controllers/adminApprovalController.js";

import {
  protect,
} from "../middleware/auth.js";

import {
  authorizeRoles,
} from "../middleware/roleMiddleware.js";

const router =
  express.Router();

router.use(protect);

router.use(
  authorizeRoles("admin"),
);

router.get(
  "/summary",
  getApprovalSummary,
);

router.get(
  "/pending-users",
  getPendingUsers,
);

router.patch(
  "/users/:id/approve",
  approveUser,
);

router.delete(
  "/users/:id",
  removePendingUser,
);

export default router;