import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    courseName: { type: String, required: true, index: true },
    courseSlug: { type: String, required: true, index: true },
    section: { type: String, default: "General", index: true },
    title: { type: String, required: true, trim: true, index: true },
    videoId: { type: String, required: true, unique: true, index: true },
    sourceId: { type: String, default: "" },
    durationSec: { type: Number, default: 0 },
    hlsUrl: { type: String, default: "" },
    mp4Url: { type: String, default: "" },
    sourceType: { type: String, default: "video" },
  },
  { timestamps: true },
);

lessonSchema.index({ title: "text", section: "text", courseName: "text" });

export default mongoose.model("Lesson", lessonSchema);
