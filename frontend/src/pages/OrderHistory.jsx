import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  Loader2,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";
import { motion } from "framer-motion";

import orderAPI from "../api/orderAPI";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Preparing: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatDate = (value) =>
  new Date(value).toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderAPI.getMyOrders();

        if (!isMounted) {
          return;
        }

        setOrders(Array.isArray(response?.data) ? response.data : []);
        setError("");
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setOrders([]);
        setError(
          fetchError?.response?.data?.message ||
            "Failed to load your orders. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(
    () => ({
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status === "Pending").length,
      deliveredOrders: orders.filter((order) => order.status === "Delivered").length,
    }),
    [orders]
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
          <AlertCircle className="mx-auto mb-4" size={32} />
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="bg-gray-50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
          <ShoppingBag size={40} className="text-gray-300 sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-contrast mb-4">
          No orders yet
        </h1>
        <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
          When you place your first order, it will show up here with status,
          restaurant details, and tracking access.
        </p>
        <button
          onClick={() => navigate("/restaurants")}
          className="bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/70">
            Customer Orders
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black text-contrast tracking-tight">
            Order History
          </h1>
          <p className="mt-3 text-gray-500 max-w-2xl">
            Review your recent purchases and open any order to track the latest
            delivery status.
          </p>
        </div>

        <button
          onClick={() => navigate("/restaurants")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Order Again
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
            Total Orders
          </p>
          <p className="mt-3 text-3xl font-black text-contrast">
            {summary.totalOrders}
          </p>
        </div>
        <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
            Pending
          </p>
          <p className="mt-3 text-3xl font-black text-amber-600">
            {summary.pendingOrders}
          </p>
        </div>
        <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
            Delivered
          </p>
          <p className="mt-3 text-3xl font-black text-emerald-600">
            {summary.deliveredOrders}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {orders.map((order, index) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-[2rem] border bg-white p-6 sm:p-7 shadow-sm"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
                      STATUS_STYLES[order.status] ||
                      "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="rounded-2xl bg-gray-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      Restaurant
                    </p>
                    <p className="mt-2 font-semibold text-gray-900 flex items-center gap-2">
                      <Store size={16} className="text-primary" />
                      {order?.restaurant?.name || "Restaurant"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      Ordered At
                    </p>
                    <p className="mt-2 font-semibold text-gray-900 flex items-center gap-2">
                      <Clock3 size={16} className="text-primary" />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      Total
                    </p>
                    <p className="mt-2 font-semibold text-gray-900 flex items-center gap-2">
                      <Package size={16} className="text-primary" />
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">
                    Items
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {order.items.map((item, itemIndex) => (
                      <div
                        key={`${order._id}-${item.food || itemIndex}`}
                        className="rounded-2xl border border-gray-100 bg-white px-4 py-3"
                      >
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:w-52 lg:pl-4">
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-red-700 transition"
                >
                  Track Order
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
