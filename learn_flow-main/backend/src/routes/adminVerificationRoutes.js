import { Router } from "express";

import {
  approveUser,
  getVerificationRequests,
  rejectUser,
} from "../controllers/adminVerificationController.js";

import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(
  protect,
  authorize("admin"),
);

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