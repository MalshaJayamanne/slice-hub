import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";

import orderAPI from "../api/orderAPI";
import {
  WorkspaceErrorState,
  WorkspaceLoadingState,
} from "../components/WorkspaceScaffold";

const STATUS_ORDER = ["Pending", "Preparing", "Delivered"];

const STATUS_LABELS = {
  Pending: "Order Placed",
  Preparing: "Preparing Food",
  Delivered: "Delivered",
};

const buildSteps = (status, createdAt) => {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return STATUS_ORDER.map((stepStatus, index) => ({
    status: STATUS_LABELS[stepStatus],
    time:
      index <= currentIndex && createdAt
        ? new Date(createdAt).toLocaleTimeString("en-LK", {
            hour: "numeric",
            minute: "2-digit",
          })
        : "--:--",
    completed: index < currentIndex,
    current: index === currentIndex,
  }));
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

export default function OrderTracking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getTracking(id);
      setOrder(response?.data || null);
      setError("");
    } catch (fetchError) {
      setOrder(null);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load tracking details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const steps = useMemo(
    () => buildSteps(order?.status || "Pending", order?.createdAt),
    [order?.status, order?.createdAt]
  );

  const etaLabel = useMemo(() => {
    if (!order) return "";
    if (order.status === "Delivered") return "Delivered";
    if (order.status === "Preparing") return "Preparing now";
    return "Order received";
  }, [order]);

  const statusVisual = useMemo(() => {
    if (!order) {
      return {
        badgeClasses: "bg-gray-100 text-gray-600",
        bubbleLabel: "Tracking order",
        bubbleClasses: "bg-gray-500",
        panelWrapClasses: "bg-gray-100 text-gray-600",
        presenceClasses: "bg-gray-500",
        presenceLabel: "Order update",
        summaryTitle: "Checking order details",
        summaryCopy: "We are syncing the latest order state from the restaurant workflow.",
        icon: Clock,
      };
    }

    if (order.status === "Delivered") {
      return {
        badgeClasses: "bg-emerald-50 text-emerald-600",
        bubbleLabel: "Delivered",
        bubbleClasses: "bg-emerald-500",
        panelWrapClasses: "bg-emerald-50 text-emerald-600",
        presenceClasses: "bg-emerald-500",
        presenceLabel: "Delivery complete",
        summaryTitle: "Order delivered",
        summaryCopy: "This order has been marked as delivered in the seller workflow.",
        icon: CheckCircle2,
      };
    }

    if (order.status === "Preparing") {
      return {
        badgeClasses: "bg-sky-50 text-sky-600",
        bubbleLabel: "Preparing your order",
        bubbleClasses: "bg-sky-500",
        panelWrapClasses: "bg-sky-50 text-sky-600",
        presenceClasses: "bg-sky-500",
        presenceLabel: "Kitchen in progress",
        summaryTitle: "Restaurant is preparing your order",
        summaryCopy: "The seller moved this order to Preparing. Tracking stays in sync with each seller update.",
        icon: Package,
      };
    }

    return {
      badgeClasses: "bg-amber-50 text-amber-700",
      bubbleLabel: "Order received",
      bubbleClasses: "bg-amber-500",
      panelWrapClasses: "bg-amber-50 text-amber-700",
      presenceClasses: "bg-amber-500",
      presenceLabel: "Waiting for kitchen",
      summaryTitle: "Waiting for the restaurant to begin",
      summaryCopy: "The order is placed and ready for the seller to move into preparation.",
      icon: Clock,
    };
  }, [order]);

  const progressMotion = useMemo(() => {
    if (!order || order.status === "Pending") {
      return { x: 0, y: 0 };
    }

    if (order.status === "Delivered") {
      return { x: 450, y: -250 };
    }

    return { x: 230, y: -120 };
  }, [order]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <WorkspaceLoadingState
          title="Loading tracking details"
          message="Gathering the latest order status, route details, and delivery summary."
        />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <WorkspaceErrorState
          title="Tracking unavailable"
          message={error || "Order not found."}
          onAction={fetchOrder}
        />
      </div>
    );
  }

  const isDelivered = order.status === "Delivered";
  const deliveryAddress = order.deliveryAddress || "Delivery address unavailable";
  const StatusBubbleIcon = statusVisual.icon;

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-30 border-b border-white/60 bg-[#f7f8fa]/85 backdrop-blur-xl">
        <div className="page-shell flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/orders")}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black text-contrast">Track Order</h1>
              <p className="text-xs font-bold text-gray-400">
                Order #{order._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <div
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black ${statusVisual.badgeClasses}`}
          >
            <Clock size={16} />
            {etaLabel}
          </div>
        </div>
      </div>

      <div className="page-shell grid grid-cols-1 gap-8 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          <div className="relative h-[550px] overflow-hidden rounded-[4rem] border-8 border-white bg-blue-50 shadow-2xl group">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(#3b82f6 1.5px, transparent 1.5px)",
                backgroundSize: "48px 48px",
              }}
            />

            <svg className="absolute inset-0 w-full h-full">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d="M 120 400 Q 350 300 550 120"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="6"
                strokeDasharray="12 12"
                className="opacity-40"
              />
            </svg>

            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute left-[100px] bottom-[380px] bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 z-10"
            >
              <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                <MapPin size={32} />
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-contrast text-white px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl">
                {order?.restaurant?.name || "Restaurant"}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-contrast rotate-45" />
              </div>
            </motion.div>

            <motion.div
              animate={progressMotion}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute left-[120px] bottom-[400px] z-20"
            >
              <div className="relative">
                <div
                  className={`${statusVisual.bubbleClasses} p-4 rounded-full shadow-2xl border-4 border-white text-white`}
                >
                  <StatusBubbleIcon size={32} />
                </div>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`absolute -top-16 left-1/2 -translate-x-1/2 ${statusVisual.bubbleClasses} text-white px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap shadow-2xl`}
                >
                  {statusVisual.bubbleLabel}
                  <div
                    className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 ${statusVisual.bubbleClasses} rotate-45`}
                  />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute right-[150px] top-[100px] bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 z-10"
            >
              <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                <Package size={32} />
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-contrast text-white px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl">
                You
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-contrast rotate-45" />
              </div>
            </motion.div>

            <div className="absolute bottom-10 left-10 right-10">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="surface-panel-strong p-8"
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-[1.5rem] ${statusVisual.panelWrapClasses}`}
                  >
                    <StatusBubbleIcon size={34} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                      Live status
                    </p>
                    <h4 className="mt-2 text-2xl font-black text-contrast">
                      {statusVisual.summaryTitle}
                    </h4>
                    <p className="mt-3 max-w-xl text-sm font-medium text-gray-500">
                      {statusVisual.summaryCopy}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${statusVisual.presenceClasses}`}
                      />
                      {statusVisual.presenceLabel}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="surface-panel-strong rounded-[4rem] p-10">
            <h3 className="text-2xl font-black text-contrast tracking-tight mb-10">
              Delivery Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 flex-shrink-0">
                  <MapPin size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Delivery Address
                  </p>
                  <p className="text-xl font-black text-contrast break-words">
                    {deliveryAddress}
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-orange-50 rounded-[1.5rem] flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Clock size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Current Status
                  </p>
                  <p className="text-xl font-black text-contrast">
                    {order.status}
                  </p>
                  <p className="text-base font-medium text-gray-500">
                    Updated from your restaurant workflow
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="surface-panel-strong rounded-[4rem] p-10">
            <h3 className="text-2xl font-black text-contrast tracking-tight mb-12">
              Order Status
            </h3>
            <div className="relative space-y-0">
              {steps.map((step, idx) => {
                const isCompleted = step.completed;
                const isCurrent = step.current;
                const isLast = idx === steps.length - 1;

                return (
                  <div key={step.status} className="relative pb-12 last:pb-0">
                    {!isLast && (
                      <div
                        className={`absolute left-8 top-16 w-1 h-full -ml-0.5 transition-colors duration-500 ${
                          isCompleted ? "bg-green-500" : "bg-gray-100"
                        }`}
                      />
                    )}
                    <div className="flex gap-8 relative z-10">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isCurrent ? 1.2 : 1,
                          backgroundColor: isCompleted
                            ? "#22C55E"
                            : isCurrent
                              ? "#FF6321"
                              : "#F3F4F6",
                          color:
                            isCompleted || isCurrent ? "#FFFFFF" : "#9CA3AF",
                        }}
                        className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl"
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={32} />
                        ) : isCurrent ? (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <Package size={32} />
                          </motion.div>
                        ) : (
                          <div className="w-4 h-4 bg-current rounded-full" />
                        )}
                      </motion.div>
                      <div className="flex-1 pt-3">
                        <div className="flex justify-between items-start">
                          <h4
                            className={`text-xl font-black leading-none ${
                              isCompleted || isCurrent
                                ? "text-contrast"
                                : "text-gray-300"
                            }`}
                          >
                            {step.status}
                          </h4>
                          <span className="text-xs font-bold text-gray-400">
                            {step.time}
                          </span>
                        </div>
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-wider"
                          >
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            Active Now
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[4rem] bg-contrast p-10 text-white shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Package size={120} />
            </div>
            <h3 className="text-2xl font-black mb-10 relative z-10">
              Order Summary
            </h3>
            <div className="space-y-6 mb-10 relative z-10">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.food || item.name}-${idx}`}
                  className="flex justify-between text-base font-bold text-white/80 gap-4"
                >
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="pt-10 border-t border-white/10 flex justify-between items-center relative z-10">
              <span className="font-black text-lg opacity-60">Total Paid</span>
              <span className="text-4xl font-black text-primary">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {isDelivered && !isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-panel-strong mx-auto mt-12 max-w-2xl rounded-[2.5rem] p-10 text-center lg:col-span-3"
          >
            <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star size={40} className="text-yellow-500 fill-yellow-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-contrast mb-4">
              How was your order?
            </h2>
            <p className="text-gray-500 mb-8 font-medium">
              This note stays on your device for the current demo review.
            </p>

            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 transition-all ${
                    rating >= star
                      ? "text-yellow-500 scale-110"
                      : "text-gray-200"
                  }`}
                >
                  <Star
                    size={32}
                    fill={rating >= star ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Tell us about your experience..."
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-6 h-32 resize-none font-medium"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <button
              onClick={() => setIsSubmitted(true)}
              className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
            >
              Save Local Note
            </button>
          </motion.div>
        )}

        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mt-12 max-w-2xl rounded-[2.5rem] border border-green-100 bg-green-50 p-10 text-center lg:col-span-3"
          >
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Thank you for your feedback!
            </h2>
            <p className="text-green-600 font-medium">
              Your note was saved locally for this demo review.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
