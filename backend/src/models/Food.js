import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Food name is required."],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    price: {
      type: Number,
      required: [true, "Food price is required."],
      min: [0, "Food price must be 0 or greater."],
    },
    category: {
      type: String,
      required: [true, "Food category is required."],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    availability: {
      type: Boolean,
      default: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  { timestamps: true }
);

foodSchema.index({ restaurant: 1, name: 1 });
foodSchema.index({ name: "text", category: "text" });

const Food = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default Food;
