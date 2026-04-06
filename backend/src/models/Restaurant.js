
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Restaurant owner is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    category: {
      type: String,
      required: [true, "Restaurant category is required"],
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

restaurantSchema.index({ name: "text", category: "text" });
restaurantSchema.index({ ownerId: 1, status: 1 });

const Restaurant =
  mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
