import mongoose from "mongoose";

const pdfProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pdf: { type: mongoose.Schema.Types.ObjectId, ref: "PdfResource", required: true },
    currentPage: { type: Number, default: 1, min: 1 },
    totalPages: { type: Number, default: 0, min: 0 },
    lastOpenedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

pdfProgressSchema.index({ user: 1, pdf: 1 }, { unique: true });

export default mongoose.model("PdfProgress", pdfProgressSchema);
