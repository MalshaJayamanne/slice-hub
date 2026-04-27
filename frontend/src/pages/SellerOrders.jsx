import { useEffect, useState } from "react";
import { Clock3, Loader2, ShoppingBag, Store, User } from "lucide-react";

import orderAPI from "../api/orderAPI";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";

const statusClasses = {
  Pending: "bg-amber-50 text-amber-600 border border-amber-100",
  Preparing: "bg-sky-50 text-sky-600 border border-sky-100",
  Delivered: "bg-emerald-50 text-emerald-600 border border-emerald-100",
};

const sellerStatusActions = {
  Pending: {
    nextStatus: "Preparing",
    label: "Mark as Preparing",
  },
  Preparing: {
    nextStatus: "Delivered",
    label: "Mark as Delivered",
  },
  Delivered: {
    nextStatus: null,
    label: "Delivered",
  },
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;
const formatOrderId = (value) => `#${String(value || "").slice(-6).toUpperCase()}`;
const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-LK") : "Unknown";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
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

  const handleStatusUpdate = async (order) => {
    const action = sellerStatusActions[order.status];

    if (!action?.nextStatus) {
      return;
    }

    try {
      setUpdatingOrderId(order._id);
      setFeedback(null);

      const response = await orderAPI.updateOrderStatus(order._id, action.nextStatus);
      const updatedOrder = response?.data;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id && updatedOrder ? updatedOrder : currentOrder
        )
      );

      setFeedback({
        type: "success",
        message: `Order ${formatOrderId(order._id)} updated to ${action.nextStatus}.`,
      });
    } catch (updateError) {
      setFeedback({
        type: "error",
        message:
          updateError?.response?.data?.message ||
          `Failed to update order ${formatOrderId(order._id)}.`,
      });
    } finally {
      setUpdatingOrderId("");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const pendingCount = orders.filter((order) => order.status === "Pending").length;
  const preparingCount = orders.filter((order) => order.status === "Preparing").length;
  const deliveredCount = orders.filter((order) => order.status === "Delivered").length;
  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.totalAmount || 0),
    0
  );

  const sidebarNote = loading
    ? "Loading seller orders for your restaurant workspace."
    : error
    ? "Order data is unavailable right now. Retry from the main panel."
    : orders.length > 0
    ? `${pendingCount} pending orders and ${preparingCount} preparing orders are currently in your queue.`
    : "Orders will appear here after customers place them for your restaurant.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={ShoppingBag}
          title="Seller Orders"
          subtitle="A stable first pass for reviewing incoming orders before status actions are added."
          note={sidebarNote}
        >
          {orders.length > 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                Queue Revenue
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-primary">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Revenue across the orders currently visible in this queue.
              </p>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Seller workspace"
      title="Order Queue"
      description="Start by making the queue reliable and readable first, then connect status updates and deeper order actions."
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
          {feedback ? (
            <div
              className={`rounded-[1.5rem] border px-5 py-4 text-sm font-medium ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <WorkspaceStat
              label="Visible Orders"
              value={orders.length}
              hint="Orders currently in your queue"
            />
            <WorkspaceStat
              label="Pending"
              value={pendingCount}
              hint="Waiting for seller action"
              tone="warning"
            />
            <WorkspaceStat
              label="Preparing"
              value={preparingCount}
              hint={`${deliveredCount} delivered so far`}
            />
            <WorkspaceStat
              label="Queue Revenue"
              value={formatCurrency(totalRevenue)}
              hint="Gross total across visible orders"
              tone="success"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Order List
            </p>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-[1.5rem] border border-gray-100 p-5 bg-white"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                        Order Id
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-contrast">
                        {formatOrderId(order._id)}
                      </h2>
                      <p className="mt-2 text-sm text-gray-500">
                        {order.restaurant?.name || "Restaurant order"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                        statusClasses[order.status] || statusClasses.Pending
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Order Id
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {formatOrderId(order._id)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Customer Name
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {order.customer?.name || "Unknown customer"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Total
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Created Time
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Current Status
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {order.status}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Items
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {order.items?.reduce(
                          (total, item) => total + Number(item.quantity || 0),
                          0
                        ) || 0}{" "}
                        items
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <User size={16} />
                      {order.customer?.email || "No customer email"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Store size={16} />
                      Delivery: {order.deliveryAddress || "No address provided"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={16} />
                      Customer tracking stays in sync with status updates from this queue.
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Order Items
                    </p>
                    <div className="mt-3 space-y-2">
                      {order.items?.length ? (
                        order.items.map((item, index) => (
                          <div
                            key={`${order._id}-${item.name}-${index}`}
                            className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
                          >
                            <p className="font-medium text-gray-900">
                              {item.quantity}x {item.name}
                            </p>
                            <p className="text-gray-500">
                              {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-700">No items recorded</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-500">
                      Seller flow: <span className="font-semibold text-gray-700">Pending</span>
                      {" -> "}
                      <span className="font-semibold text-gray-700">Preparing</span>
                      {" -> "}
                      <span className="font-semibold text-gray-700">Delivered</span>
                    </div>

                    {sellerStatusActions[order.status]?.nextStatus ? (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(order)}
                        disabled={updatingOrderId === order._id}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                          updatingOrderId === order._id
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-primary text-white hover:opacity-90"
                        }`}
                      >
                        {updatingOrderId === order._id ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          sellerStatusActions[order.status].label
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed"
                      >
                        Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </WorkspacePage>
  );
}
