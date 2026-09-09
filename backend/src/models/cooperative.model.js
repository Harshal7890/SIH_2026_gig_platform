import mongoose, { Schema } from "mongoose";

const cooperativeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },

    address: {
      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pinCode: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Cooperative = mongoose.model("Cooperative", cooperativeSchema);
