import mongoose from "mongoose";

const learningProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    currentTime: { type: Number, default: 0, min: 0 },
    duration: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

learningProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
learningProgressSchema.index({ user: 1, lastWatchedAt: -1 });

export default mongoose.model("LearningProgress", learningProgressSchema);
