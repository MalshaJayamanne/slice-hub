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

  const deliveryFee = subtotal > 0 ? 299 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

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
      <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32 text-center">
        <div className="bg-gray-50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
          <ShoppingBag size={40} className="text-gray-300 sm:w-12 sm:h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-contrast mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-500 font-medium mb-8 sm:mb-12 max-w-xs mx-auto">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <button
          onClick={() => handleNavigate("home")}
          className="bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          Start Ordering
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col gap-3 mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-black text-contrast tracking-tighter">
          Your Cart
        </h1>
        {cartRestaurantName ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-100 px-4 py-2 text-sm font-semibold text-orange-700 w-fit">
            <Store size={16} />
            Ordering from {cartRestaurantName}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.foodId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-soft border border-gray-100 flex items-center gap-4 sm:gap-8 group"
              >
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.image || "https://picsum.photos/300/300"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-base sm:text-2xl text-contrast truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="font-black text-base sm:text-2xl text-primary whitespace-nowrap sm:hidden">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <p className="text-gray-400 text-[10px] sm:text-sm font-bold mb-3 sm:mb-4">
                    Unit Price: Rs. {Number(item.price).toFixed(2)}
                  </p>

                  <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8">
                    <div className="flex items-center gap-2 sm:gap-4 bg-gray-50 p-1 rounded-xl border border-gray-100">
                      <button
                        onClick={() =>
                          updateQuantity(item.foodId, item.quantity - 1)
                        }
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-primary transition-all disabled:opacity-50 active:scale-90"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} className="sm:w-4 sm:h-4" />
                      </button>

                      <span className="font-black w-4 sm:w-6 text-center text-sm sm:text-lg">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.foodId, item.quantity + 1)
                        }
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-primary transition-all active:scale-90"
                      >
                        <Plus size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.foodId)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="font-black text-3xl text-primary tracking-tighter">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-contrast rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 text-white sticky top-24 shadow-2xl shadow-contrast/20">
            <h2 className="text-2xl sm:text-3xl font-black mb-8 sm:mb-10">
              Order Summary
            </h2>

            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              <div className="flex justify-between text-white/60 font-bold text-sm sm:text-base">
                <span>Subtotal</span>
                <span className="text-white">Rs. {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-white/60 font-bold text-sm sm:text-base">
                <span>Delivery Fee</span>
                <span className="text-white">Rs. {deliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-white/60 font-bold text-sm sm:text-base">
                <span>Tax (5%)</span>
                <span className="text-white">Rs. {tax.toFixed(2)}</span>
              </div>

              <div className="h-px bg-white/10 my-6" />

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                    Total Amount
                  </p>
                  <p className="text-4xl sm:text-5xl font-black tracking-tighter">
                    Rs. {total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleNavigate("checkout")}
              className="w-full bg-primary hover:bg-white hover:text-primary text-white font-black py-4 sm:py-6 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 text-base sm:text-xl group"
            >
              Proceed to Checkout
              <ArrowRight
                size={20}
                className="group-hover:translate-x-2 transition-transform"
              />
            </button>

            <p className="text-center text-white/40 text-[10px] font-bold mt-6 uppercase tracking-widest">
              Secure SSL Encryption
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 mt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-contrast">
                Smart Cart Suggestions
              </h2>
              <p className="text-sm text-gray-400 font-medium italic">
                Quick links based on what you already picked
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartItems.slice(0, 3).map((item, index) => (
              <motion.div
                key={item.foodId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-4 shadow-soft border border-gray-100 flex items-center gap-4 group hover:shadow-lg transition-all"
              >
                <img
                  src={item.image || "https://picsum.photos/300/300"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-2xl group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1">
                  <h3 className="font-bold text-sm text-contrast mb-1">
                    {item.name}
                  </h3>
                  <p className="text-primary font-black text-sm">
                    Rs. {Number(item.price).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleNavigate("details", item)}
                    className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
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
