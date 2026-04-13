import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ChevronLeft,
  Loader2,
  Minus,
  Plus,
  Store,
} from "lucide-react";

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

    let isActive = true;

    const fetchFood = async () => {
      try {
        const res = await foodAPI.getById(id);
        if (!isActive) return;

        setItem(res?.data?.food || null);
        setError("");
      } catch (err) {
        console.error("Failed to fetch food:", err);
        if (!isActive) return;

        setItem(null);
        setError(err?.response?.data?.message || "Failed to load food details.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchFood();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" />
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
        <div className="overflow-hidden rounded-[2rem] bg-white border shadow-sm">
          <img
            src={item?.image || "https://picsum.photos/900/700"}
            alt={item?.name || "food"}
            className="h-[22rem] sm:h-[30rem] w-full object-cover"
          />
        </div>

        <div className="rounded-[2rem] bg-white border shadow-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {item?.category}
            </span>
            <span
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
                item?.availability
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {item?.availability ? "Available" : "Unavailable"}
            </span>
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl font-black text-gray-900">
            {item?.name}
          </h1>

          <p className="mt-4 text-gray-600 leading-7">
            {item?.description || "No description available for this food item yet."}
          </p>

          <div className="mt-8 rounded-[1.5rem] bg-orange-50 border border-orange-100 px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
              Price
            </p>
            <p className="mt-2 text-4xl font-black text-primary">Rs. {item?.price}</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="inline-flex items-center justify-between rounded-full border px-3 py-2 w-full sm:w-auto sm:min-w-44">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="rounded-full p-2 hover:bg-gray-50"
              >
                <Minus size={18} />
              </button>
              <span className="text-lg font-semibold min-w-12 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="rounded-full p-2 hover:bg-gray-50"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              disabled={!item?.availability}
              className="w-full sm:w-auto sm:flex-1 rounded-2xl bg-primary disabled:bg-gray-300 text-white px-6 py-4 font-semibold"
            >
              {item?.availability ? `Add ${qty} to Cart` : "Currently Unavailable"}
            </button>
          </div>

          {item?.restaurant?.name ? (
            <button
              onClick={() => navigate(`/restaurant/${item.restaurant._id || item.restaurant}`)}
              className="mt-8 inline-flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-primary"
            >
              <Store size={18} />
              More from {item.restaurant.name}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
