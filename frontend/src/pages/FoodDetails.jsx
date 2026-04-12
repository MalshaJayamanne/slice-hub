import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import foodAPI from "../api/foodAPI";
import { Loader2, ChevronLeft, Plus, Minus } from "lucide-react";
import { StarRating } from "../components/StarRating";
import { motion } from "framer-motion";

export default function FoodDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;

    foodAPI
      .getById(id)
      .then((res) => {
        // FIX: response shape is { success, food }
        setItem(res?.data?.food || null);
      })
      .catch((err) => {
        console.error("Failed to fetch food:", err);
        setItem(null);
      });
  }, [id]);

  if (!item)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => window.history.back()}
        className="mb-4"
      >
        <ChevronLeft />
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <img
          src={item?.image || "https://picsum.photos/400/300"}
          alt={item?.name || "food"}
          className="rounded-3xl w-full h-80 object-cover"
        />

        <div>
          <h1 className="text-4xl font-bold">
            {item?.name}
          </h1>

          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={item?.rating || 4} />
            <span>{item?.rating || 4}</span>
          </div>

          <p className="mt-4 text-gray-500">
            {item?.description}
          </p>

          <h2 className="text-3xl font-bold text-primary mt-6">
            Rs. {item?.price}
          </h2>

          {/* Quantity */}
          <div className="flex items-center gap-4 mt-6">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
              <Minus />
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}>
              <Plus />
            </button>
          </div>

          <button className="mt-6 bg-primary text-white px-6 py-3 rounded-xl">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}