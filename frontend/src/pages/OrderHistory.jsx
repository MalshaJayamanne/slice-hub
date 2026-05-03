import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, Package, ShoppingBag, Store } from "lucide-react";
import { motion } from "framer-motion";

import orderAPI from "../api/orderAPI";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      setOrders(Array.isArray(response?.data) ? response.data : []);
      setError("");
    } catch (fetchError) {
      setOrders([]);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const summary = useMemo(
    () => ({
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status === "Pending").length,
      preparingOrders: orders.filter((order) => order.status === "Preparing").length,
      deliveredOrders: orders.filter((order) => order.status === "Delivered").length,
      totalSpent: orders.reduce(
        (total, order) => total + Number(order.totalAmount || 0),
        0
      ),
    }),
    [orders]
  );

  const sidebarNote = loading
    ? "Loading your customer order history and current delivery states."
    : error
    ? "Order history is unavailable right now. Retry from the main panel."
    : orders.length > 0
    ? `${summary.pendingOrders} pending and ${summary.preparingOrders} preparing orders are still active.`
    : "Your completed and active orders will appear here once you place them.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={ShoppingBag}
          title="Order History"
          subtitle="A shared customer workspace for reviewing recent purchases and jumping into live tracking."
          note={sidebarNote}
        >
          {!loading && !error && orders.length > 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                Total Spent
              </p>
              <p className="font-display mt-3 text-2xl font-bold tracking-tight text-[#FF4F40]">
                {formatCurrency(summary.totalSpent)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Combined value across the orders currently visible in your history.
              </p>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Customer workspace"
      title="Your Orders"
      description="Review what you ordered, check the current status, and open any order to see the latest tracking details."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading your orders"
          message="Gathering your customer order history and the latest delivery statuses."
        />
      ) : error ? (
        <WorkspaceErrorState
          title="Order history unavailable"
          message={error}
          onAction={fetchOrders}
        />
      ) : orders.length === 0 ? (
        <WorkspaceEmptyState
          title="No orders yet"
          message="Place your first order and it will appear here with status, item details, and tracking access."
          actionLabel="Browse Restaurants"
          onAction={() => navigate("/restaurants")}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <WorkspaceStat
              label="Total Orders"
              value={summary.totalOrders}
              hint="Orders recorded for this account"
            />
            <WorkspaceStat
              label="Pending"
              value={summary.pendingOrders}
              hint="Waiting for restaurant action"
              tone="warning"
            />
            <WorkspaceStat
              label="Preparing"
              value={summary.preparingOrders}
              hint="Currently moving through the seller flow"
              tone="dark"
            />
            <WorkspaceStat
              label="Delivered"
              value={summary.deliveredOrders}
              hint="Completed orders in your history"
              tone="success"
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Recent Orders
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Open any order to track the live status shared by the seller workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/restaurants")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Order Again
            </button>
          </div>

          <div className="space-y-5">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="surface-panel p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
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

                    <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-gray-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                          Restaurant
                        </p>
                        <p className="mt-2 flex items-center gap-2 font-semibold text-gray-900">
                          <Store size={16} className="text-primary" />
                          {order?.restaurant?.name || "Restaurant"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-gray-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                          Ordered At
                        </p>
                        <p className="mt-2 flex items-center gap-2 font-semibold text-gray-900">
                          <Clock3 size={16} className="text-primary" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-gray-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                          Total
                        </p>
                        <p className="mt-2 flex items-center gap-2 font-semibold text-gray-900">
                          <Package size={16} className="text-primary" />
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                        Items
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {order.items.map((item, itemIndex) => (
                          <div
                            key={`${order._id}-${item.food || itemIndex}`}
                            className="rounded-2xl border border-gray-100 bg-white px-4 py-3"
                          >
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.quantity} x {formatCurrency(item.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-52 lg:pl-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="btn-primary w-full"
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
      )}
    </WorkspacePage>
  );
}
