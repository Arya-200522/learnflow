import LearningProgress from "../models/LearningProgress.js";
import PdfProgress from "../models/PdfProgress.js";
import Lesson from "../models/Lesson.js";
import PdfResource from "../models/PdfResource.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getContinueLearning = asyncHandler(async (req, res) => {
  const progress = await LearningProgress.find({ user: req.user._id, completed: false })
    .sort({ lastWatchedAt: -1 })
    .limit(20)
    .populate("lesson")
    .lean();
  res.json({ progress: progress.filter((item) => item.lesson) });
});

export const getLessonProgress = asyncHandler(async (req, res) => {
  const progress = await LearningProgress.findOne({
    user: req.user._id,
    lesson: req.params.lessonId,
  }).lean();
  res.json({ progress });
});

export const saveLessonProgress = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId).select("_id durationSec");
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const duration = Math.max(Number(req.body.duration) || lesson.durationSec || 0, 0);
  const currentTime = Math.min(Math.max(Number(req.body.currentTime) || 0, 0), duration || Infinity);
  const completed = Boolean(req.body.completed) || (duration > 0 && currentTime / duration >= 0.95);

  const progress = await LearningProgress.findOneAndUpdate(
    { user: req.user._id, lesson: lesson._id },
    { currentTime, duration, completed, lastWatchedAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  res.json({ progress });
});

export const removeLessonProgress = asyncHandler(async (req, res) => {
  await LearningProgress.deleteOne({ user: req.user._id, lesson: req.params.lessonId });
  res.status(204).end();
});

export const getPdfProgress = asyncHandler(async (req, res) => {
  const progress = await PdfProgress.findOne({
    user: req.user._id,
    pdf: req.params.pdfId,
  }).lean();
  res.json({ progress });
});

export const savePdfProgress = asyncHandler(async (req, res) => {
  const pdf = await PdfResource.findById(req.params.pdfId).select("_id");
  if (!pdf) return res.status(404).json({ message: "PDF resource not found" });

  const currentPage = Math.max(Number(req.body.currentPage) || 1, 1);
  const totalPages = Math.max(Number(req.body.totalPages) || 0, 0);
  const progress = await PdfProgress.findOneAndUpdate(
    { user: req.user._id, pdf: pdf._id },
    { currentPage, totalPages, lastOpenedAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  res.json({ progress });
});
