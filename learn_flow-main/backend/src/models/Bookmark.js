import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["lesson", "pdf"], required: true },
    resourceKey: { type: String, required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", default: null },
    pdf: { type: mongoose.Schema.Types.ObjectId, ref: "PdfResource", default: null },
  },
  { timestamps: true },
);

bookmarkSchema.index({ user: 1, resourceKey: 1 }, { unique: true });

export default mongoose.model("Bookmark", bookmarkSchema);
