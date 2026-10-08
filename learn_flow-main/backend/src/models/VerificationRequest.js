import mongoose from "mongoose";

const verificationRequestSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
      },

      reviewedBy: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    },
  );

export default mongoose.model(
  "VerificationRequest",
  verificationRequestSchema,
);