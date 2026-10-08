import { Router } from "express";
import {
  getBookmarks,
  getBookmarkStatus,
  toggleBookmark,
} from "../controllers/bookmarkController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getBookmarks);
router.get("/status", getBookmarkStatus);
router.post("/toggle", toggleBookmark);

export default router;
