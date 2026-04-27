import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Package,
  Bike,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Star,
  Send,
  X,
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
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
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
    if (order.status === "Preparing") return "Arriving in 15-25 mins";
    return "Confirming your order";
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
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
          <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-black">
            <Clock size={16} />
            {etaLabel}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          <div className="relative h-[550px] bg-blue-50 rounded-[4rem] overflow-hidden border-8 border-white shadow-2xl group">
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
              animate={{
                x: [0, 150, 300, 450],
                y: [0, -50, -120, -250],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute left-[120px] bottom-[400px] z-20"
            >
              <div className="relative">
                <div className="bg-primary p-4 rounded-full shadow-2xl border-4 border-white text-white">
                  <Bike size={32} />
                </div>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap shadow-2xl"
                >
                  Courier en route
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
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
                className="bg-white/95 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src="https://i.pravatar.cc/150?u=driver"
                      alt="Driver"
                      className="w-20 h-20 rounded-[1.5rem] object-cover shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-contrast">
                      Michael Scott
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-yellow-500 text-sm font-black">
                        <Star size={14} fill="currentColor" /> 4.9
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs font-bold text-gray-400">
                        Courier Partner
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowChat(true)}
                    className="p-5 bg-gray-50 hover:bg-gray-100 rounded-[1.5rem] transition-all text-contrast border border-gray-100"
                  >
                    <MessageCircle size={28} />
                  </button>
                  <button className="p-5 bg-primary text-white rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    <Phone size={28} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[4rem] shadow-soft border border-gray-100">
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
          <div className="bg-white p-10 rounded-[4rem] shadow-soft border border-gray-100">
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
                            <Bike size={32} />
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

          <div className="bg-contrast text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden">
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
            className="mt-12 bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-100 text-center max-w-2xl mx-auto lg:col-span-3"
          >
            <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star size={40} className="text-yellow-500 fill-yellow-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-contrast mb-4">
              How was your food?
            </h2>
            <p className="text-gray-500 mb-8 font-medium">
              Your feedback helps us improve and rewards the restaurant!
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
              Submit Feedback
            </button>
          </motion.div>
        )}

        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 bg-green-50 rounded-[2.5rem] p-10 border border-green-100 text-center max-w-2xl mx-auto lg:col-span-3"
          >
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Thank you for your feedback!
            </h2>
            <p className="text-green-600 font-medium">
              We&apos;ve shared your thoughts with the restaurant.
            </p>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-24 right-8 z-40">
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.9,
                transformOrigin: "bottom right",
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 w-96 mb-6 overflow-hidden flex flex-col h-[500px]"
            >
              <div className="bg-contrast p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/30">
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"
                      alt="Courier"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight">
                      Michael (Courier)
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        Online
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar bg-gray-50">
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-[1.5rem] rounded-tl-none text-xs font-medium text-gray-600 max-w-[85%] shadow-sm border border-gray-100">
                    Hi! I&apos;m Michael, your courier. I&apos;ve just picked up
                    your order and I&apos;m on my way!
                    <p className="text-[9px] mt-2 font-black text-gray-400 uppercase tracking-widest">
                      Live courier chat mock
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary p-4 rounded-[1.5rem] rounded-tr-none text-xs font-medium text-white max-w-[85%] shadow-lg shadow-primary/10">
                    Great, thanks Michael! Please leave it at the front door.
                    <p className="text-[9px] mt-2 font-black text-white/60 uppercase tracking-widest">
                      Customer message
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setChatMessage("");
                  }}
                  className="flex items-center gap-3 bg-gray-50 rounded-2xl p-2 border border-gray-100"
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 font-medium outline-none"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                  <button className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-contrast text-white w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl hover:scale-110 hover:rotate-12 transition-all group relative"
        >
          <MessageCircle
            size={28}
            className="group-hover:scale-110 transition-transform"
          />
          {!showChat && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              1
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
