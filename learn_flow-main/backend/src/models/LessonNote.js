import mongoose from "mongoose";

const lessonNoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    content: { type: String, default: "", maxlength: 20000 },
  },
  { timestamps: true },
);

lessonNoteSchema.index({ user: 1, lesson: 1 }, { unique: true });

export default mongoose.model("LessonNote", lessonNoteSchema);
