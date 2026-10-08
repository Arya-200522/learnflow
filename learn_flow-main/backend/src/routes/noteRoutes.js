import { Router } from "express";
import { getLessonNote, saveLessonNote } from "../controllers/noteController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/lessons/:lessonId", getLessonNote);
router.put("/lessons/:lessonId", saveLessonNote);

export default router;
