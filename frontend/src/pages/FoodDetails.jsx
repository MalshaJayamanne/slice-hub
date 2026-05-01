import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Minus,
  Plus,
  Store,
} from "lucide-react";

import foodAPI from "../api/foodAPI";
import {
  WorkspaceErrorState,
  WorkspaceLoadingState,
} from "../components/WorkspaceScaffold";
import { useCart } from "../context/CartContext";
import useToast from "../hooks/useToast";

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, canUseCart } = useCart();
  const toast = useToast();

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
      <div className="max-w-4xl mx-auto px-4 py-16">
        <WorkspaceLoadingState
          title="Loading food details"
          message="Pulling the latest item details, availability, and restaurant information."
        />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <WorkspaceErrorState
          title="Food details unavailable"
          message={error || "Food not found."}
          actionLabel="Back to Restaurants"
          onAction={() => navigate("/restaurants")}
        />
      </div>
    );
  }

  const handleAddToCart = () => {
    const result = addItem(item, qty);
    toast.showToast({
      type: result.success ? "success" : "error",
      title: result.success ? "Added to cart" : "Cart update failed",
      message: result.message,
    });
  };

  return (
    <div className="page-shell py-8 sm:py-10">
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary mb-6 rounded-full px-4 py-2"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
        <div className="surface-panel overflow-hidden">
          <img
            src={item?.image || "https://picsum.photos/900/700"}
            alt={item?.name || "food"}
            className="h-[22rem] sm:h-[30rem] w-full object-cover"
          />
        </div>

        <div className="surface-panel-strong p-6 sm:p-8">
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

          <div className="mt-8 rounded-[1.5rem] border border-orange-100 bg-orange-50 px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
              Price
            </p>
            <p className="mt-2 text-4xl font-black text-primary">Rs. {item?.price}</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="inline-flex w-full items-center justify-between rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm sm:w-auto sm:min-w-44">
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
              onClick={handleAddToCart}
              disabled={!item?.availability || !canUseCart}
              className="btn-primary w-full px-6 py-4 sm:w-auto sm:flex-1"
            >
              {!item?.availability
                ? "Currently Unavailable"
                : canUseCart
                  ? `Add ${qty} to Cart`
                  : "Customer Cart Only"}
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
