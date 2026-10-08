import express from "express";
import {
  approveUser,
  getVerificationRequests,
  rejectUser,
} from "../controllers/adminVerificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get(
  "/verification-requests",
  getVerificationRequests,
);

router.patch(
  "/verification-requests/:id/approve",
  approveUser,
);

router.patch(
  "/verification-requests/:id/reject",
  rejectUser,
);

export default router;