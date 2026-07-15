import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure user can only shortlist a lawyer once
shortlistSchema.index({ user: 1, lawyer: 1 }, { unique: true });

const Shortlist = mongoose.model("Shortlist", shortlistSchema);

export default Shortlist;