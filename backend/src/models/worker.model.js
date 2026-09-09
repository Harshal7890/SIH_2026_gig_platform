import mongoose, { Schema } from "mongoose";

const workerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    cooperativeId: {
      type: Schema.Types.ObjectId,
      ref: "Cooperative",
      default: null,
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: Number,
      min: 0,
    },

    certifications: {
      type: [String],
      default: [],
    },

    verification: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    address: {
      type: String,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

workerSchema.index({ location: "2dsphere" });

export const Worker = mongoose.model("Worker", workerSchema);
