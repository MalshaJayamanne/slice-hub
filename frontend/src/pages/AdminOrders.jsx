import { useEffect, useState } from "react";
import { Loader2, Package, Receipt, Search, Store, User } from "lucide-react";

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
const formatOrderId = (value) => `#${String(value || "").slice(-6).toUpperCase()}`;
const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Unknown";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [restaurantOptions, setRestaurantOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [restaurantFilter, setRestaurantFilter] = useState("");

  const fetchOrders = async (initialLoad) => {
    try {
      if (initialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const orderResponse = await adminAPI.getOrders({
        search: searchTerm.trim(),
        status: statusFilter,
        restaurantId: restaurantFilter,
      });

      setOrders(Array.isArray(orderResponse?.data?.orders) ? orderResponse.data.orders : []);
      setSummary(orderResponse?.data?.summary || null);

      if (restaurantOptions.length === 0) {
        try {
          const restaurantResponse = await adminAPI.getRestaurants({ status: "all" });
          setRestaurantOptions(
            Array.isArray(restaurantResponse?.data?.restaurants)
              ? restaurantResponse.data.restaurants
              : []
          );
        } catch (_restaurantError) {
          // Keep the monitoring page usable even if the restaurant filter list fails.
          setRestaurantOptions([]);
        }
      }
    } catch (fetchError) {
      setOrders([]);
      setSummary(null);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load platform orders."
      );
    } finally {
      if (initialLoad) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }

      if (!hasLoadedOnce) {
        setHasLoadedOnce(true);
      }
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(!hasLoadedOnce);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, restaurantFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRestaurantFilter("");
  };

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    statusFilter !== "all" ||
    Boolean(restaurantFilter);

  const sidebarNote = loading
    ? "Loading order activity across the platform."
    : error && orders.length === 0
    ? "Order monitoring is unavailable right now. Retry from the main panel."
    : summary
    ? `${summary.statusCounts.Pending} pending, ${summary.statusCounts.Preparing} preparing, and ${summary.statusCounts.Delivered} delivered orders are visible in the current view.`
    : "Platform orders will appear here once customers start checking out.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={Receipt}
          title="Platform Orders"
          subtitle="A live admin monitoring view for tracking customer orders across restaurants."
          note={sidebarNote}
        >
          {summary ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                Current Revenue
              </p>
              <p className="font-display mt-3 text-2xl font-bold tracking-tight text-[#FF4F40]">
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
      description="Track live order activity with dependable filters first, then layer in deeper platform workflows later."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading platform orders"
          message="Gathering restaurant, customer, and status data for the monitoring workspace."
        />
      ) : error && orders.length === 0 ? (
        <WorkspaceErrorState
          title="Orders unavailable"
          message={error}
          onAction={() => fetchOrders(true)}
        />
      ) : (
        <div className="space-y-8">
          <div className="surface-panel p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                  Filters
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Search by order id, customer, or restaurant, then narrow the current view by status or restaurant.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                {refreshing ? <Loader2 size={16} className="animate-spin" /> : null}
                {refreshing
                  ? "Refreshing list..."
                  : `${summary?.totalOrders ?? orders.length} visible orders`}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto]">
              <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search order, customer, or restaurant"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="select-surface px-4 py-3 text-sm text-gray-700"
              >
                <option value="all">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Delivered">Delivered</option>
              </select>

              <select
                value={restaurantFilter}
                onChange={(event) => setRestaurantFilter(event.target.value)}
                className="select-surface px-4 py-3 text-sm text-gray-700"
              >
                <option value="">All restaurants</option>
                {restaurantOptions.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {orders.length === 0 ? (
            <WorkspaceEmptyState
              title={
                hasActiveFilters
                  ? "No orders matched these filters"
                  : "No platform orders yet"
              }
              message={
                hasActiveFilters
                  ? "Try widening the current filters to bring orders back into view."
                  : "Order monitoring cards will appear here once customers place orders."
              }
              actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
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
                  tone="warning"
                />
                <WorkspaceStat
                  label="Delivered"
                  value={summary?.statusCounts?.Delivered || 0}
                  hint="Completed orders in this view"
                  tone="success"
                />
                <WorkspaceStat
                  label="Revenue"
                  value={formatCurrency(summary?.totalRevenue || 0)}
                  hint="Gross total in the current list"
                  tone="success"
                />
              </div>

              <div className="surface-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table-lite">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Restaurant</th>
                        <th>Customer</th>
                        <th>Seller</th>
                        <th>Total</th>
                        <th>Items</th>
                        <th>Created</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="font-display font-bold text-slate-900 whitespace-nowrap">
                            {formatOrderId(order._id)}
                          </td>
                          <td className="max-w-[130px]">
                            <span className="block truncate">{order.restaurant?.name || "—"}</span>
                          </td>
                          <td className="max-w-[140px]">
                            <span className="block truncate font-medium text-slate-800">{order.customer?.name || "—"}</span>
                            <span className="block truncate text-xs text-slate-400">{order.customer?.email || ""}</span>
                          </td>
                          <td className="max-w-[120px]">
                            <span className="block truncate">{order.restaurant?.owner?.name || "—"}</span>
                          </td>
                          <td className="whitespace-nowrap font-semibold text-slate-900">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="whitespace-nowrap text-slate-500">
                            {order.metrics?.itemCount || 0}
                          </td>
                          <td className="whitespace-nowrap text-xs text-slate-400">
                            {formatDateTime(order.createdAt)}
                          </td>
                          <td>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${statusClasses[order.status] || statusClasses.Pending}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </WorkspacePage>
  );
}
