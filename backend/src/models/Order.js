import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
