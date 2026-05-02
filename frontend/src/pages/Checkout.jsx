import React, { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Package,
  Navigation,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import orderAPI from "../api/orderAPI";
import FeedbackAlert from "../components/FeedbackAlert";
import { useCart } from "../context/CartContext";

const DELIVERY_OPTIONS = {
  standard: {
    label: "Standard Delivery",
    timing: "25-35 mins",
  },
  priority: {
    label: "Priority Delivery",
    timing: "15-20 mins",
  },
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartRestaurantId, clearCart, subtotal } = useCart();

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("authUser"));
  } catch (_error) {
    storedUser = null;
  }

  const [isOrdered, setIsOrdered] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [form, setForm] = useState({
    fullName: storedUser?.name || "",
    phone: storedUser?.phone || "",
    streetAddress: storedUser?.address || "",
    city: "",
    zipCode: "",
    instructions: "",
  });

  const total = subtotal;

  const deliveryAddress = useMemo(() => {
    const parts = [
      form.streetAddress.trim(),
      form.city.trim(),
      form.zipCode.trim(),
    ].filter(Boolean);

    const contactBits = [];
    if (form.fullName.trim()) contactBits.push(`Name: ${form.fullName.trim()}`);
    if (form.phone.trim()) contactBits.push(`Phone: ${form.phone.trim()}`);
    contactBits.push(`Delivery: ${DELIVERY_OPTIONS[deliveryType].label}`);
    if (form.instructions.trim()) {
      contactBits.push(`Instructions: ${form.instructions.trim()}`);
    }

    return [...parts, ...contactBits].join(", ");
  }, [deliveryType, form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !cartRestaurantId) {
      setError("Your cart is empty.");
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.streetAddress.trim() ||
      !form.city.trim()
    ) {
      setError("Please complete the delivery and contact details.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      await orderAPI.placeOrder({
        restaurantId: cartRestaurantId,
        items: cartItems.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity,
        })),
        deliveryAddress,
      });

      clearCart();
      setIsOrdered(true);

      window.setTimeout(() => {
        navigate("/dashboard", {
          state: {
            feedback: {
              type: "success",
              title: "Order placed",
              message: "Your order was placed successfully. You can review it from your account.",
            },
          },
        });
      }, 2500);
    } catch (placeOrderError) {
      setError(
        placeOrderError?.response?.data?.message ||
          "Failed to place the order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0 && !isOrdered) {
    return <Navigate to="/cart" replace />;
  }

  if (isOrdered) {
    return (
      <div className="page-shell py-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-emerald-50 shadow-inner"
        >
          <CheckCircle2 size={48} className="text-emerald-500" />
        </motion.div>
        <h2 className="font-display text-4xl font-bold text-slate-900 mb-4 tracking-tight sm:text-5xl">
          Order Placed Successfully!
        </h2>
        <p className="text-slate-500 mb-8 text-lg font-medium">
          Your delicious food is being prepared and will be with you shortly.
        </p>
        <div className="animate-pulse text-[#FF4F40] font-bold tracking-widest text-sm uppercase">
          Redirecting to your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8 sm:py-12">
      <button
        onClick={() => navigate("/cart")}
        className="group mb-8 flex items-center gap-3 font-bold text-slate-400 transition-all hover:text-[#FF4F40]"
      >
        <div className="rounded-xl bg-white p-2 shadow-sm transition-all group-hover:-translate-x-1 group-hover:bg-[#FF4F40] group-hover:text-white group-hover:shadow-md">
          <ChevronLeft size={18} className="sm:h-5 sm:w-5" />
        </div>
        <span className="text-sm uppercase tracking-widest sm:text-xs">Back to Cart</span>
      </button>

      <h1 className="font-display text-4xl font-bold text-slate-900 mb-8 sm:mb-12 sm:text-5xl tracking-tight">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <section className="surface-panel space-y-6 p-6 sm:space-y-8 sm:p-10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:h-14 sm:w-14">
                <MapPin size={22} className="sm:h-7 sm:w-7" />
              </div>
              <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Delivery Address
              </h2>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  type="text"
                  placeholder="Your name"
                  className="input-surface px-4 py-3 sm:px-6 sm:py-4 sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Contact Number
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="text"
                  placeholder="071 234 5678"
                  className="input-surface px-4 py-3 sm:px-6 sm:py-4 sm:text-base"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Street Address
                </label>
                <div className="relative">
                  <input
                    name="streetAddress"
                    value={form.streetAddress}
                    onChange={handleChange}
                    type="text"
                    placeholder="123 Foodie St"
                    className="input-surface w-full pl-12 pr-4 py-3 sm:pl-14 sm:pr-6 sm:py-4 sm:text-base"
                  />
                  <Navigation
                    size={18}
                    className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-primary sm:w-5 sm:h-5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  City
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  type="text"
                  placeholder="Colombo"
                  className="input-surface px-4 py-3 sm:px-6 sm:py-4 sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Zip Code
                </label>
                <input
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  type="text"
                  placeholder="10001"
                  className="input-surface px-4 py-3 sm:px-6 sm:py-4 sm:text-base"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Delivery Instructions
                </label>
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  placeholder="e.g. Ring the bell, leave at the front door, gate code is 1234..."
                  className="textarea-surface h-24 px-4 py-3 sm:h-32 sm:px-6 sm:py-4 sm:text-base"
                />
              </div>
            </form>
          </section>

          <section className="surface-panel p-6 sm:rounded-3xl sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <CreditCard size={20} className="sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-contrast">
                Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <label
                className={`relative flex flex-row sm:flex-col items-center gap-4 sm:gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="hidden"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <CreditCard size={24} className="text-primary" />
                <span className="font-black text-sm">Credit Card</span>
              </label>

              <label
                className={`relative flex flex-row sm:flex-col items-center gap-4 sm:gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === "paypal"
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="hidden"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                />
                <div className="font-black text-primary italic text-sm sm:text-base">
                  PayPal
                </div>
                <span className="font-black text-sm">PayPal</span>
              </label>

              <label
                className={`relative flex flex-row sm:flex-col items-center gap-4 sm:gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="hidden"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                <div className="font-black text-green-600 text-sm sm:text-base">
                  Cash
                </div>
                <span className="font-black text-sm">Cash on Delivery</span>
              </label>
            </div>
          </section>

          <section className="surface-panel p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Clock size={24} />
              </div>
              <h2 className="text-2xl font-bold text-contrast">
                Delivery Preference
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`relative flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  deliveryType === "standard"
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  className="hidden"
                  checked={deliveryType === "standard"}
                  onChange={() => setDeliveryType("standard")}
                />
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Package size={20} />
                </div>
                <div>
                  <p className="font-black text-contrast text-sm">
                    Standard Delivery
                  </p>
                  <p className="text-xs font-bold text-gray-400">
                    {DELIVERY_OPTIONS.standard.timing} | Shared with the restaurant
                  </p>
                </div>
              </label>

              <label
                className={`relative flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  deliveryType === "priority"
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  className="hidden"
                  checked={deliveryType === "priority"}
                  onChange={() => setDeliveryType("priority")}
                />
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-black text-contrast text-sm">
                    Priority Delivery
                  </p>
                  <p className="text-xs font-bold text-gray-400">
                    {DELIVERY_OPTIONS.priority.timing} | Shared as a faster delivery preference
                  </p>
                </div>
              </label>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Your delivery preference is included in the order details so the
              restaurant can see it. No extra delivery fee is applied in this
              demo.
            </p>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="surface-panel sticky top-28 p-8 sm:p-10">
            <h2 className="font-display mb-6 text-2xl font-bold text-slate-900 sm:mb-8">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 no-scrollbar">
              {cartItems.map((item) => (
                <div key={item.foodId} className="flex justify-between text-sm gap-4">
                  <span className="text-gray-600">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold text-contrast whitespace-nowrap">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100 my-4" />

            <div className="mb-4 space-y-4">
              <div className="flex justify-between text-sm font-medium text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-700">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-500">
                <span>Validated Total</span>
                <span className="font-bold text-slate-700">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-500">
                <span>Delivery Preference</span>
                <span className="font-bold text-slate-700">{DELIVERY_OPTIONS[deliveryType].label}</span>
              </div>
              <div className="my-6 h-px bg-slate-100" />
              <div className="flex justify-between pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Total Amount</span>
                <span className="font-display text-3xl font-bold text-[#FF4F40]">Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            {error ? (
              <div className="mb-4">
                <FeedbackAlert
                  type="error"
                  title="Checkout failed"
                  message={error}
                  onClose={() => setError("")}
                />
              </div>
            ) : null}

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="btn-primary w-full py-4 font-bold"
            >
              {placingOrder ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
