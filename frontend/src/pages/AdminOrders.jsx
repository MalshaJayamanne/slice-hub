import { useEffect, useState } from "react";
import { Package, Receipt, Store, User } from "lucide-react";

import adminAPI from "../api/adminAPI";
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

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getOrders();
      setOrders(Array.isArray(response?.data?.orders) ? response.data.orders : []);
      setSummary(response?.data?.summary || null);
    } catch (fetchError) {
      setOrders([]);
      setSummary(null);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load platform orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const sidebarNote = loading
    ? "Loading order activity across the platform."
    : error
    ? "Order monitoring is unavailable right now. Retry from the main panel."
    : summary
    ? `${summary.statusCounts.Pending} pending, ${summary.statusCounts.Preparing} preparing, and ${summary.statusCounts.Delivered} delivered orders are in the current view.`
    : "Platform orders will appear here once customers start checking out.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={Receipt}
          title="Platform Orders"
          subtitle="A read-only order monitoring view for tracking throughput across restaurants."
          note={sidebarNote}
        >
          {summary ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                Current Revenue
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-primary">
                {formatCurrency(summary.totalRevenue)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Based on the orders returned in this monitoring view.
              </p>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Admin workspace"
      title="Order Monitoring"
      description="Start with dependable order visibility first, then add filters, status actions, and platform drill-downs."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading platform orders"
          message="Gathering restaurant, customer, and status data for the monitoring queue."
        />
      ) : error ? (
        <WorkspaceErrorState
          title="Orders unavailable"
          message={error}
          onAction={fetchOrders}
        />
      ) : orders.length === 0 ? (
        <WorkspaceEmptyState
          title="No orders yet"
          message="Order monitoring cards will appear here once customers place orders."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <WorkspaceStat
              label="Visible Orders"
              value={summary?.totalOrders || orders.length}
              hint="Orders in the current monitoring view"
            />
            <WorkspaceStat
              label="Pending"
              value={summary?.statusCounts?.Pending || 0}
              hint="Waiting to be processed"
              tone="warning"
            />
            <WorkspaceStat
              label="Preparing"
              value={summary?.statusCounts?.Preparing || 0}
              hint="Currently in progress"
            />
            <WorkspaceStat
              label="Revenue"
              value={formatCurrency(summary?.totalRevenue || 0)}
              hint="Gross total in the current list"
              tone="success"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Live Order List
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
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-contrast">
                        {order.restaurant?.name || "Unknown restaurant"}
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                          statusClasses[order.status] || statusClasses.Pending
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Customer
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {order.customer?.name || "Unknown customer"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Amount
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Items
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {order.metrics?.itemCount || 0} items
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Created
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("en-LK")
                          : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Store size={16} />
                      Seller: {order.restaurant?.owner?.name || "Unknown owner"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <User size={16} />
                      {order.customer?.email || "No customer email"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Package size={16} />
                      {order.items
                        ?.slice(0, 2)
                        .map((item) => `${item.quantity}x ${item.name}`)
                        .join(", ") || "No items"}
                    </span>
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
