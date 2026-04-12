import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, Loader2, Minus, Plus } from "lucide-react";

import foodAPI from "../api/foodAPI";

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    foodAPI
      .getById(id)
      .then((res) => {
        setItem(res?.data?.food || null);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to fetch food:", err);
        setItem(null);
        setError(err?.response?.data?.message || "Failed to load food details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertCircle className="text-red-500" />
        <p>{error || "Food not found."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50"
      >
        <ChevronLeft />
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <img
          src={item?.image || "https://picsum.photos/400/300"}
          alt={item?.name || "food"}
          className="rounded-3xl w-full h-80 object-cover"
        />

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary/80">
            {item?.category}
          </p>

          <h1 className="text-4xl font-bold mt-2">{item?.name}</h1>

          <div className="mt-4 inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
            {item?.availability ? "Available" : "Currently unavailable"}
          </div>

          <p className="mt-4 text-gray-500">
            {item?.description || "No description available for this food item yet."}
          </p>

          <h2 className="text-3xl font-bold text-primary mt-6">
            Rs. {item?.price}
          </h2>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="rounded-full border p-2"
            >
              <Minus />
            </button>
            <span className="min-w-8 text-center font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="rounded-full border p-2"
            >
              <Plus />
            </button>
          </div>

          <button
            disabled={!item?.availability}
            className="mt-6 bg-primary disabled:bg-gray-300 text-white px-6 py-3 rounded-xl"
          >
            {item?.availability ? "Add to Cart" : "Unavailable"}
          </button>

          {item?.restaurant?.name ? (
            <p className="mt-4 text-sm text-gray-500">From {item.restaurant.name}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
