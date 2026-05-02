import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    cartRestaurantName,
    subtotal,
    removeItem,
    updateQuantity,
  } = useCart();

  const total = subtotal;

  const handleNavigate = (target, item) => {
    if (target === "home") {
      navigate("/restaurants");
      return;
    }

    if (target === "checkout") {
      navigate("/checkout");
      return;
    }

    if (target === "details" && item?.foodId) {
      navigate(`/food/${item.foodId}`);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-shell py-20 text-center sm:py-32">
        <div className="surface-panel mx-auto max-w-2xl p-12 shadow-xl shadow-slate-200/50">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 sm:mb-8 sm:h-24 sm:w-24 shadow-inner">
            <ShoppingBag size={40} className="text-slate-300 sm:h-12 sm:w-12" />
          </div>
          <h2 className="font-display mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your cart is empty
          </h2>
          <p className="mx-auto mb-8 max-w-xs text-base font-medium text-slate-500 sm:mb-10">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <button
            onClick={() => handleNavigate("home")}
            className="btn-primary px-8"
          >
            Start Ordering
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-12 sm:py-16">
      <div className="mb-10 flex flex-col gap-3 sm:mb-14">
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Your Cart
        </h1>
        {cartRestaurantName ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200/50 bg-orange-50 px-4 py-2 text-sm font-semibold text-[#f97316]">
            <Store size={16} />
            Ordering from {cartRestaurantName}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="space-y-4 lg:col-span-2 sm:space-y-6">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.foodId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="surface-panel group flex items-center gap-4 p-4 transition-all hover:shadow-lg hover:shadow-slate-200/40 sm:gap-6 sm:p-5"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28">
                  <img
                    src={item.image || "https://picsum.photos/300/300"}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-[#FF4F40] sm:text-xl">
                      {item.name}
                    </h3>
                    <p className="font-display whitespace-nowrap text-lg font-bold text-[#FF4F40] sm:hidden">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Unit Price: Rs. {Number(item.price).toFixed(2)}
                  </p>

                  <div className="flex items-center justify-between gap-4 sm:justify-start sm:gap-8">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-1 sm:gap-4">
                      <button
                        onClick={() =>
                          updateQuantity(item.foodId, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-all hover:text-[#FF4F40] active:scale-[0.9] disabled:opacity-50 sm:h-9 sm:w-9"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>

                      <span className="w-4 text-center text-sm font-bold sm:w-6 sm:text-base">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.foodId, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-all hover:text-[#FF4F40] active:scale-[0.9] sm:h-9 sm:w-9"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.foodId)}
                      className="rounded-xl p-2.5 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="hidden text-right sm:block pr-4">
                  <p className="font-display text-2xl font-bold tracking-tight text-[#FF4F40]">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-28 rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#FF4F40]/20 blur-[50px]" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-[50px]" />
            
            <div className="relative z-10">
              <h2 className="font-display mb-8 text-2xl font-bold tracking-tight sm:mb-10 sm:text-3xl">
                Order Summary
              </h2>

              <div className="mb-8 space-y-4 sm:mb-10 sm:space-y-6">
                <div className="flex justify-between text-sm font-medium text-white/60 sm:text-base">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">Rs. {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-medium text-white/60 sm:text-base">
                  <span>Validated Total</span>
                  <span className="text-white font-bold">Rs. {subtotal.toFixed(2)}</span>
                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                      Total Amount
                    </p>
                    <p className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                      Rs. {total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleNavigate("checkout")}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FF4F40] py-4 text-base font-bold text-white shadow-xl shadow-[#FF4F40]/30 transition-all hover:-translate-y-1 hover:bg-[#E63E30] hover:shadow-[#FF4F40]/40 sm:py-5 sm:text-lg"
              >
                Proceed to Checkout
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                Secure SSL Encryption
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 lg:col-span-3">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-[#FF4F40]/10 p-2.5 text-[#FF4F40]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Smart Suggestions
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Quick links based on your selections
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cartItems.slice(0, 3).map((item, index) => (
              <motion.div
                key={item.foodId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="surface-panel group flex items-center gap-4 p-4 transition-all hover:shadow-lg hover:shadow-slate-200/40"
              >
                <img
                  src={item.image || "https://picsum.photos/300/300"}
                  alt={item.name}
                  className="h-20 w-20 rounded-2xl object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-bold text-slate-900">
                    {item.name}
                  </h3>
                  <p className="font-display text-sm font-bold text-[#FF4F40]">
                    Rs. {Number(item.price).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleNavigate("details", item)}
                    className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-[#FF4F40]"
                  >
                    View Details <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
