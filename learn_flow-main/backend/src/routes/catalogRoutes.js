import { Router } from "express";
import {
  getCatalogSummary,
  getCourse,
  getCourses,
  getLesson,
  getLessons,
  getPdf,
} from "../controllers/catalogController.js";
import { streamPdf } from "../controllers/pdfController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/summary", getCatalogSummary);
router.get("/courses", getCourses);
router.get("/courses/:slug", getCourse);
router.get("/lessons", getLessons);
router.get("/lessons/:id", getLesson);
router.get("/pdfs/:id", getPdf);
router.get("/pdfs/:id/file", streamPdf);

export default router;
