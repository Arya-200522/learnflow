import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      passwordHash: {
        type: String,
        required: true,
        select: false,
      },

      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
      },

      isVerified: {
        type: Boolean,
        default: false,
      },
accessStartedAt: {
  type: Date,
  default: null,
},

accessExpiresAt: {
  type: Date,
  default: null,
  index: true,
},

      activeSessionId: {
        type: String,
        default: null,
        select: false,
      },
    },
    {
      timestamps: true,
    },
  );

userSchema.methods.comparePassword =
  function comparePassword(password) {
    return bcrypt.compare(
      password,
      this.passwordHash,
    );
  };

userSchema.statics.createWithPassword =
  async function createWithPassword({
    name,
    email,
    password,
  }) {
    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      );

return this.create({
  name,
  email,
  passwordHash,
  role: "user",
  isVerified: false,
  accessStartedAt: null,
  accessExpiresAt: null,
  activeSessionId: null,
});
  };

export default mongoose.model(
  "User",
  userSchema,
);