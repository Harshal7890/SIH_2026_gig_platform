import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

customerSchema.index({ location: "2dsphere" });
export const Customer = mongoose.model("Customer", customerSchema);
