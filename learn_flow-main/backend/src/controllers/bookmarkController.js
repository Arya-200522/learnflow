import Bookmark from "../models/Bookmark.js";
import Lesson from "../models/Lesson.js";
import PdfResource from "../models/PdfResource.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("lesson")
    .populate("pdf")
    .lean();
  res.json({ bookmarks: bookmarks.filter((item) => item.lesson || item.pdf) });
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { kind, resourceId } = req.body;
  if (!["lesson", "pdf"].includes(kind) || !resourceId) {
    return res
      .status(400)
      .json({ message: "Valid kind and resourceId are required" });
  }

  const Model = kind === "lesson" ? Lesson : PdfResource;
  const exists = await Model.exists({ _id: resourceId });
  if (!exists) return res.status(404).json({ message: "Resource not found" });

  const resourceKey = `${kind}:${resourceId}`;
  const current = await Bookmark.findOne({ user: req.user._id, resourceKey });
  if (current) {
    await current.deleteOne();
    return res.json({ bookmarked: false });
  }

  await Bookmark.create({
    user: req.user._id,
    kind,
    resourceKey,
    lesson: kind === "lesson" ? resourceId : null,
    pdf: kind === "pdf" ? resourceId : null,
  });
  res.status(201).json({ bookmarked: true });
});

export const getBookmarkStatus = asyncHandler(async (req, res) => {
  const resourceKey = `${req.query.kind}:${req.query.resourceId}`;
  const bookmarked = await Bookmark.exists({ user: req.user._id, resourceKey });
  res.json({ bookmarked: Boolean(bookmarked) });
});
