import mongoose from "mongoose";

const { Schema, model } = mongoose;

const requestSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Unique constraint to prevent duplicate pending requests
requestSchema.index({ from: 1, to: 1, status: 1 }, { unique: true });

export default model("Request", requestSchema);
