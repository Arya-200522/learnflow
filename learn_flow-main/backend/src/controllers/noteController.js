import Lesson from "../models/Lesson.js";
import LessonNote from "../models/LessonNote.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getLessonNote = asyncHandler(async (req, res) => {
  const note = await LessonNote.findOne({
    user: req.user._id,
    lesson: req.params.lessonId,
  }).lean();
  res.json({ note });
});

export const saveLessonNote = asyncHandler(async (req, res) => {
  const lesson = await Lesson.exists({ _id: req.params.lessonId });
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const content = String(req.body.content || "").slice(0, 20000);
  const note = await LessonNote.findOneAndUpdate(
    { user: req.user._id, lesson: req.params.lessonId },
    { content },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  res.json({ note });
});
