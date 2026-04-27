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
          <div className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
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
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Delivered">Delivered</option>
              </select>

              <select
                value={restaurantFilter}
                onChange={(event) => setRestaurantFilter(event.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
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
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-white"
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

              <div>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                    Live Order List
                  </p>
                  <p className="text-sm text-gray-500">
                    Live API-backed visibility for platform support and final demo review.
                  </p>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-[1.5rem] border border-gray-100 bg-white p-5"
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
                            {order.restaurant?.name || "Unknown restaurant"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                            statusClasses[order.status] || statusClasses.Pending
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
                            Seller
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {order.restaurant?.owner?.name || "Unknown owner"}
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
                            {formatDateTime(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                          Delivery Address
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                          {order.deliveryAddress || "No delivery address provided"}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-2">
                          <Store size={16} />
                          Restaurant owner: {order.restaurant?.owner?.name || "Unknown"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <User size={16} />
                          {order.customer?.email || "No customer email"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Package size={16} />
                          {order.items
                            ?.map((item) => `${item.quantity}x ${item.name}`)
                            .join(", ") || "No items"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </WorkspacePage>
  );
}
