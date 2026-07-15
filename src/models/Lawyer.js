import mongoose from "mongoose";

const lawyerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String, 
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalHires: {
      type: Number,
      default: 0,
    },
    // ============================================
    // Hired Badge - Auto set when lawyer is hired
    // ============================================
    isHired: {
      type: Boolean,
      default: false,
    },
    // ============================================
    // Shortlist Count - Total users who shortlisted
    // ============================================
    shortlistCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for search
lawyerSchema.index({ name: "text", specialization: "text" });

const Lawyer = mongoose.model("Lawyer", lawyerSchema);

export default Lawyer;