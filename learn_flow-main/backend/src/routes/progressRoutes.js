import { Router } from "express";
import {
  getContinueLearning,
  getLessonProgress,
  getPdfProgress,
  removeLessonProgress,
  saveLessonProgress,
  savePdfProgress,
} from "../controllers/progressController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/continue", getContinueLearning);
router.get("/lessons/:lessonId", getLessonProgress);
router.put("/lessons/:lessonId", saveLessonProgress);
router.delete("/lessons/:lessonId", removeLessonProgress);
router.get("/pdfs/:pdfId", getPdfProgress);
router.put("/pdfs/:pdfId", savePdfProgress);

export default router;
