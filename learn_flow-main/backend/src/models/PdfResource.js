import mongoose from "mongoose";

const pdfResourceSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    courseName: { type: String, required: true, index: true },
    courseSlug: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    objectId: { type: String, required: true, unique: true, index: true },
    pdfUrl: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

pdfResourceSchema.index({ title: "text", courseName: "text" });

export default mongoose.model("PdfResource", pdfResourceSchema);
