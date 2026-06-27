import mongoose from "mongoose";

const hiringRequestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    transactionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const HiringRequest = mongoose.model("HiringRequest", hiringRequestSchema);

export default HiringRequest;