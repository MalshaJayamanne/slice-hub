import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, Package, ShoppingBag, Store, Star } from "lucide-react";
import { motion } from "framer-motion";
import orderAPI from "../api/orderAPI";
import ReviewModal from "../components/ReviewModal";
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
  const [reviewTarget, setReviewTarget] = useState(null);


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
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Recent Orders
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Open any order to track the live status shared by the seller workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/restaurants")}
              className="btn-secondary"
            >
              Order Again
            </button>
          </div>

          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="surface-panel p-6 sm:p-8 hover:shadow-lg transition-all border border-slate-100/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100 pb-6 mb-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-widest shadow-sm ${
                        STATUS_STYLES[order.status] ||
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="btn-primary py-3 px-6 text-sm shadow-md shadow-[#FF4F40]/20 sm:w-auto w-full"
                  >
                    Track Order
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-8">
                  <div className="relative group rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition-colors hover:bg-slate-100/50">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Restaurant
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-base font-bold text-slate-900">
                      <Store size={18} className="text-[#FF4F40]" />
                    </p>
                    {order.status === "Delivered" && (
                      <button
                        onClick={() =>
                          setReviewTarget({
                            id: order.restaurant?._id || order.restaurant,
                            name: order.restaurant?.name || "Restaurant",
                            type: "restaurant",
                          })
                        }
                        className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors"
                      >
                        <Star size={14} className="fill-current" />
                        Rate Restaurant
                      </button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition-colors hover:bg-slate-100/50">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Ordered At
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-base font-bold text-slate-900">
                      <Clock3 size={18} className="text-[#FF4F40]" />
                      <span className="truncate">{formatDate(order.createdAt)}</span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition-colors hover:bg-slate-100/50">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Total Amount
                    </p>
                    <p className="mt-2 flex items-center gap-2 font-display text-xl font-bold text-[#FF4F40]">
                      <Package size={18} />
                      <span className="truncate">{formatCurrency(order.totalAmount)}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">
                    Order Items
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {order.items.map((item, itemIndex) => (
                      <div
                        key={`${order._id}-${item.food || itemIndex}`}
                        className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xs font-black text-slate-500 shadow-inner group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          {item.quantity}x
                        </div>
                        <div className="pr-2">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-slate-900">{item.name}</p>

                          </div>
                          <p className="mt-0.5 font-display text-sm font-bold text-[#FF4F40]">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>


        </div>
      )}

      <ReviewModal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        target={reviewTarget}
        onSuccess={() => {
          // You could add a toast here
          fetchOrders();
        }}
      />
    </WorkspacePage>
  );
}
