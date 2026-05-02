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

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

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
    setCartMessage(result.message);
  };

  return (
    <div className="page-shell py-8 sm:py-12">
      <button
        onClick={() => navigate(-1)}
        className="group mb-8 flex items-center gap-3 font-bold text-slate-400 transition-all hover:text-[#FF4F40]"
      >
        <div className="rounded-xl bg-white p-2 shadow-sm transition-all group-hover:-translate-x-1 group-hover:bg-[#FF4F40] group-hover:text-white group-hover:shadow-md">
          <ChevronLeft size={18} className="sm:h-5 sm:w-5" />
        </div>
        <span className="text-sm uppercase tracking-widest sm:text-xs">Back</span>
      </button>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
        <div className="surface-panel overflow-hidden border-4 border-white shadow-xl shadow-slate-200/50">
          <img
            src={item?.image || "https://picsum.photos/900/700"}
            alt={item?.name || "food"}
            className="h-[22rem] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[32rem]"
          />
        </div>

        <div className="surface-panel p-6 shadow-xl shadow-slate-200/50 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl bg-[#FF4F40]/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#FF4F40]">
              {item?.category}
            </span>
            <span
              className={`rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest ${
                item?.availability
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {item?.availability ? "Available" : "Unavailable"}
            </span>
          </div>

          <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {item?.name}
          </h1>

          <p className="mt-5 text-[15px] leading-relaxed text-slate-500">
            {item?.description || "No description available for this food item yet."}
          </p>

          <div className="mt-8 flex items-center justify-between rounded-3xl border border-[#FF4F40]/20 bg-[#FF4F40]/5 p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FF4F40]/60">
                Total Price
              </p>
              <p className="font-display mt-1 text-4xl font-bold tracking-tight text-[#FF4F40]">
                Rs. {item?.price}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:w-auto sm:min-w-[140px]">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center text-lg font-bold text-slate-900">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!item?.availability}
              className="btn-primary w-full py-4 text-base font-bold shadow-xl shadow-[#FF4F40]/20 transition-all hover:-translate-y-1 sm:w-auto sm:flex-1"
            >
              {item?.availability ? `Add ${qty} to Cart` : "Currently Unavailable"}
            </button>
          </div>

          {cartMessage ? (
            <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              {cartMessage}
            </div>
          ) : null}

          {item?.restaurant?.name ? (
            <button
              onClick={() => navigate(`/restaurant/${item.restaurant._id || item.restaurant}`)}
              className="group mt-8 inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-[#FF4F40]"
            >
              <Store size={18} className="transition-transform group-hover:-translate-y-1" />
              More from {item.restaurant.name}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
