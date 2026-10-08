import Bookmark from "../models/Bookmark.js";
import LearningProgress from "../models/LearningProgress.js";
import LessonNote from "../models/LessonNote.js";
import PdfProgress from "../models/PdfProgress.js";
import User from "../models/User.js";

export async function deleteUserData(userId) {
  const filter = { user: userId };

  const [
    learningProgressResult,
    pdfProgressResult,
    bookmarksResult,
    notesResult,
  ] = await Promise.all([
    LearningProgress.deleteMany(filter),
    PdfProgress.deleteMany(filter),
    Bookmark.deleteMany(filter),
    LessonNote.deleteMany(filter),
  ]);

  // Related data delete hone ke baad user delete hoga.
  // Admin ko accidentally delete hone se bachaya gaya hai.
  const userResult = await User.deleteOne({
    _id: userId,
    role: "user",
  });

  return {
    userDeleted: userResult.deletedCount,
    learningProgressDeleted: learningProgressResult.deletedCount,
    pdfProgressDeleted: pdfProgressResult.deletedCount,
    bookmarksDeleted: bookmarksResult.deletedCount,
    notesDeleted: notesResult.deletedCount,
  };
}