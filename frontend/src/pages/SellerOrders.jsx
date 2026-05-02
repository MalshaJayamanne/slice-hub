import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  ShoppingBag,
  Store,
  Truck,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

import orderAPI from "../api/orderAPI";
import FeedbackAlert from "../components/FeedbackAlert";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
  WorkspaceSidebar,
} from "../components/WorkspaceScaffold";

const statusClasses = {
  Pending: "bg-amber-50 text-amber-600 border border-amber-100",
  Preparing: "bg-sky-50 text-sky-600 border border-sky-100",
  Delivered: "bg-emerald-50 text-emerald-600 border border-emerald-100",
};

const filterOptions = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Preparing", value: "Preparing" },
  { label: "Delivered", value: "Delivered" },
];

const statusFlow = ["Pending", "Preparing", "Delivered"];

const statusActionMeta = {
  Pending: {
    icon: Clock3,
    activeClasses: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    currentClasses: "bg-amber-100 text-amber-700 ring-2 ring-amber-200",
  },
  Preparing: {
    icon: Truck,
    activeClasses: "bg-sky-50 text-sky-600 hover:bg-sky-100",
    currentClasses: "bg-sky-100 text-sky-700 ring-2 ring-sky-200",
  },
  Delivered: {
    icon: CheckCircle2,
    activeClasses: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    currentClasses: "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200",
  },
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;
const formatOrderId = (value) => `#${String(value || "").slice(-6).toUpperCase()}`;
const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-LK") : "Unknown";
const getItemName = (item) => item?.name || item?.food?.name || "Menu item";
const getCustomerName = (order) => order.customer?.name || "Unknown customer";
const getOrderItemCount = (order) =>
  order.items?.reduce((total, item) => total + Number(item?.quantity || 0), 0) || 0;
const escapeCsvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const getNextStatus = (status) => {
  if (status === "Pending") {
    return "Preparing";
  }

  if (status === "Preparing") {
    return "Delivered";
  }

  return null;
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [updatingAction, setUpdatingAction] = useState({
    orderId: "",
    status: "",
  });
  const [feedback, setFeedback] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await orderAPI.getSellerOrders();
      setOrders(Array.isArray(response?.data) ? response.data : []);
    } catch (fetchError) {
      setOrders([]);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load seller orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (order, nextStatus) => {
    if (!nextStatus) {
      return;
    }

    try {
      setUpdatingAction({
        orderId: order._id,
        status: nextStatus,
      });
      setFeedback(null);

      const response = await orderAPI.updateOrderStatus(order._id, nextStatus);
      const updatedOrder = response?.data;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id && updatedOrder ? updatedOrder : currentOrder
        )
      );

      setFeedback({
        type: "success",
        message: `Order ${formatOrderId(order._id)} updated to ${nextStatus}.`,
      });
    } catch (updateError) {
      setFeedback({
        type: "error",
        message:
          updateError?.response?.data?.message ||
          `Failed to update order ${formatOrderId(order._id)}.`,
      });
    } finally {
      setUpdatingAction({
        orderId: "",
        status: "",
      });
    }
  };

  const handleExportOrders = () => {
    if (!visibleOrders.length) {
      return;
    }

    const rows = [
      ["Order ID", "Customer", "Items", "Total", "Created Time", "Status"],
      ...visibleOrders.map((order) => [
        formatOrderId(order._id),
        getCustomerName(order),
        order.items?.map((item) => `${getItemName(item)} x${item.quantity || 0}`).join(", ") ||
          "No items",
        Number(order.totalAmount || 0).toFixed(2),
        formatDateTime(order.createdAt),
        order.status || "Pending",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `seller-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const pendingCount = orders.filter((order) => order.status === "Pending").length;
  const preparingCount = orders.filter((order) => order.status === "Preparing").length;
  const deliveredCount = orders.filter((order) => order.status === "Delivered").length;
  const visibleOrders =
    selectedFilter === "all"
      ? orders
      : orders.filter((order) => order.status === selectedFilter);
  const visibleRevenue = visibleOrders.reduce(
    (total, order) => total + Number(order.totalAmount || 0),
    0
  );

  const sidebarNote = loading
    ? "Loading seller orders for your restaurant workspace."
    : error
    ? "Order data is unavailable right now. Retry from the main panel."
    : orders.length > 0
    ? `${visibleOrders.length} orders are visible in the ${selectedFilter === "all" ? "full queue" : selectedFilter.toLowerCase()} view.`
    : "Orders will appear here after customers place them for your restaurant.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={ShoppingBag}
          title="Seller Orders"
          subtitle="Track incoming orders, keep updates moving, and make sure customer tracking stays accurate."
          note={sidebarNote}
        >
          {orders.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  Queue Revenue
                </p>
                <p className="font-display mt-3 text-2xl font-bold tracking-tight text-[#FF4F40]">
                  {formatCurrency(visibleRevenue)}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Revenue across the orders currently visible in this queue.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                    Pending
                  </p>
                  <p className="mt-2 text-xl font-black text-amber-600">
                    {pendingCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                    Preparing
                  </p>
                  <p className="mt-2 text-xl font-black text-sky-600">
                    {preparingCount}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Delivered
                </p>
                <p className="mt-2 text-xl font-black text-emerald-600">
                  {deliveredCount}
                </p>
                <p className="mt-2 text-sm text-emerald-700">
                  Completed orders stay synced with the customer tracking page.
                </p>
              </div>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Seller workspace"
      title="Order Management"
      description="Track active orders, keep kitchen updates moving, and make sure customers see the right status in real time."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading seller orders"
          message="Gathering customer, item, and restaurant data for your current order queue."
        />
      ) : error ? (
        <WorkspaceErrorState
          title="Orders unavailable"
          message={error}
          onAction={fetchOrders}
        />
      ) : orders.length === 0 ? (
        <WorkspaceEmptyState
          title="No seller orders yet"
          message="New customer orders will appear here once your restaurant starts receiving them."
        />
      ) : (
        <div className="space-y-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Order Management
              </h2>
              <p className="text-gray-500">
                Track and update active orders across your restaurant queue.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportOrders}
              disabled={!visibleOrders.length}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                visibleOrders.length
                  ? "border-gray-200 bg-white hover:bg-gray-50"
                  : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
              }`}
            >
              <Download size={18} />
              Export Orders
            </button>
          </header>

          {feedback ? (
            <FeedbackAlert
              type={feedback.type}
              title={
                feedback.type === "success"
                  ? "Order updated"
                  : "Update failed"
              }
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          ) : null}

          <div className="flex flex-wrap gap-4">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedFilter(filter.value)}
                className={`rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
                  selectedFilter === filter.value
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {visibleOrders.length === 0 ? (
            <WorkspaceEmptyState
              title={
                orders.length === 0
                  ? "No seller orders yet"
                  : `No ${selectedFilter.toLowerCase()} orders right now`
              }
              message={
                orders.length === 0
                  ? "New customer orders will appear here once your restaurant starts receiving them."
                  : "Try another filter to review the rest of your order queue."
              }
              actionLabel={orders.length === 0 ? undefined : "Show All Orders"}
              onAction={
                orders.length === 0 ? undefined : () => setSelectedFilter("all")
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {visibleOrders.map((order, index) => {
                const nextStatus = getNextStatus(order.status);
                const currentStepIndex = statusFlow.indexOf(order.status);

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    className="surface-panel flex flex-col items-start gap-8 rounded-3xl p-6 xl:flex-row xl:items-center"
                  >
                    <div className="w-full flex-1 space-y-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold text-slate-900">
                            Order {formatOrderId(order._id)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(order.createdAt)} {" | "}{" "}
                            {getCustomerName(order)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center rounded-full px-4 py-1 text-xs font-bold ${
                            statusClasses[order.status] || statusClasses.Pending
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Order Id
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {formatOrderId(order._id)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Customer Name
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {getCustomerName(order)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Current Status
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {order.status}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Created Time
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Items
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {getOrderItemCount(order)} items
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Total
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {order.items?.length ? (
                          order.items.map((item, itemIndex) => (
                            <div
                              key={`${order._id}-${getItemName(item)}-${itemIndex}`}
                              className="flex min-w-[220px] flex-shrink-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                            >
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-primary shadow-sm">
                                {getItemName(item).slice(0, 2).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-900">
                                  {getItemName(item)}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {item.quantity || 0}x {" | "}{" "}
                                  {formatCurrency(item.price)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                            No items recorded for this order.
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-2">
                          <User size={16} />
                          {order.customer?.email || "No customer email"}
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <Store size={16} />
                          {order.restaurant?.name || "Restaurant order"}
                        </span>
                      </div>
                    </div>

                    <div className="h-px w-full bg-gray-100 xl:h-24 xl:w-px" />

                    <div className="w-full space-y-4 xl:w-auto">
                      <div className="flex flex-col gap-2">
                        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 xl:text-left">
                          Update Status
                        </p>

                        <div className="flex gap-2">
                          {statusFlow.map((status) => {
                            const iconConfig = statusActionMeta[status];
                            const Icon = iconConfig.icon;
                            const stepIndex = statusFlow.indexOf(status);
                            const isCurrent = currentStepIndex === stepIndex;
                            const isCompleted = stepIndex < currentStepIndex;
                            const isNext = stepIndex === currentStepIndex + 1;
                            const isUpdatingOrder =
                              updatingAction.orderId === order._id;
                            const isUpdatingStep =
                              isUpdatingOrder && updatingAction.status === status;
                            const isInteractive = isNext && !isUpdatingOrder;

                            let buttonClasses =
                              "flex-1 rounded-xl p-3 transition-all md:flex-none";

                            if (isCurrent) {
                              buttonClasses += ` ${iconConfig.currentClasses}`;
                            } else if (isCompleted) {
                              buttonClasses +=
                                " border border-emerald-200 bg-emerald-50 text-emerald-600";
                            } else if (isInteractive) {
                              buttonClasses += ` ${iconConfig.activeClasses}`;
                            } else {
                              buttonClasses +=
                                " cursor-not-allowed bg-gray-100 text-gray-300";
                            }

                            return (
                              <button
                                key={`${order._id}-${status}`}
                                type="button"
                                onClick={() =>
                                  isInteractive
                                    ? handleStatusUpdate(order, status)
                                    : undefined
                                }
                                disabled={!isInteractive}
                                title={
                                  isCurrent
                                    ? `${status} is the current status`
                                    : isCompleted
                                    ? `${status} already completed`
                                    : isInteractive
                                    ? `Mark order as ${status}`
                                    : `${status} is not available yet`
                                }
                                className={buttonClasses}
                              >
                                {isUpdatingStep ? (
                                  <Loader2 size={20} className="animate-spin" />
                                ) : (
                                  <Icon size={20} />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-center text-xs text-gray-500 xl:text-left">
                          {nextStatus
                            ? `Next step: mark this order as ${nextStatus}.`
                            : "This order is complete."}
                        </p>
                      </div>

                      <div className="w-full text-center xl:text-right">
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                          Total Amount
                        </p>
                        <p className="font-display text-2xl font-bold text-[#FF4F40]">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {order.items?.length
                            ? order.items
                                .map(
                                  (item) =>
                                    `${item.quantity || 0}x ${getItemName(item)}`
                                )
                                .join(", ")
                            : "No items recorded"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </WorkspacePage>
  );
}
