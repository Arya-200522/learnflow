import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import PdfResource from "../models/PdfResource.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCatalogSummary = asyncHandler(async (req, res) => {
  const totals = await Course.aggregate([
    {
      $group: {
        _id: null,
        courses: { $sum: 1 },
        lessons: { $sum: "$videoCount" },
        pdfs: { $sum: "$pdfCount" },
        durationSec: { $sum: "$totalDurationSec" },
      },
    },
  ]);

  const summary = totals[0] || {
    courses: 0,
    lessons: 0,
    pdfs: 0,
    durationSec: 0,
  };
  res.json({
    ...summary,
    hours: Math.round((summary.durationSec / 3600) * 10) / 10,
  });
});

export const getCourses = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.q) query.name = { $regex: req.query.q, $options: "i" };
  if (req.query.category && req.query.category !== "all") {
    const categoryMap = {
      dsa: "DSA|Sigma 8.0$",
      development: "DevHub",
      aptitude: "Aptitude|Plus",
      live: "Live Session",
    };
    query.name = {
      $regex: categoryMap[req.query.category] || req.query.category,
      $options: "i",
    };
  }
  const courses = await Course.find(query).sort({ videoCount: -1, name: 1 });
  res.json({ courses });
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  if (!course) return res.status(404).json({ message: "Course not found" });

  const [lessons, pdfs] = await Promise.all([
    Lesson.find({ course: course._id }).sort({ _id: 1 }).lean(),
    PdfResource.find({ course: course._id }).sort({ title: 1 }).lean(),
  ]);

  const sections = [];
  const byName = new Map();
  for (const lesson of lessons) {
    const name = lesson.section || "General";
    if (!byName.has(name)) {
      const section = { name, lessons: [] };
      byName.set(name, section);
      sections.push(section);
    }
    byName.get(name).lessons.push(lesson);
  }

  res.json({ course, sections, pdfs });
});

export const getLessons = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 100);
  const query = {};

  if (req.query.course) query.courseSlug = req.query.course;
  if (req.query.section) query.section = req.query.section;
  if (req.query.q) query.$text = { $search: req.query.q };

  const [lessons, total] = await Promise.all([
    Lesson.find(query)
      .sort(
        req.query.q
          ? { score: { $meta: "textScore" } }
          : { courseName: 1, section: 1, title: 1 },
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Lesson.countDocuments(query),
  ]);

  res.json({ lessons, page, pages: Math.ceil(total / limit), total });
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).lean();
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const siblings = await Lesson.find({
    course: lesson.course,
    section: lesson.section,
  })
    .select("title durationSec section courseSlug")
    .sort({ _id: 1 })
    .lean();
  res.json({ lesson, siblings });
});

export const getPdf = asyncHandler(async (req, res) => {
  const pdf = await PdfResource.findById(req.params.id).lean();
  if (!pdf) return res.status(404).json({ message: "PDF resource not found" });
  res.json({ pdf });
});
