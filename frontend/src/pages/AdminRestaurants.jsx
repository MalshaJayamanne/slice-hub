import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Loader2,
  Search,
  ShoppingBag,
  Store,
  User,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import adminAPI from "../api/adminAPI";
import FeedbackAlert from "../components/FeedbackAlert";

const statusClasses = {
  approved: "bg-green-100 text-green-600",
  pending: "bg-orange-100 text-orange-600",
  rejected: "bg-red-100 text-red-600",
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export default function AdminRestaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingRestaurantId, setUpdatingRestaurantId] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const fetchRestaurants = async (initialLoad) => {
    try {
      if (initialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await adminAPI.getRestaurants({
        search: searchTerm.trim(),
        status: statusFilter,
      });

      setRestaurants(
        Array.isArray(response?.data?.restaurants) ? response.data.restaurants : []
      );
    } catch (fetchError) {
      setRestaurants([]);
      setError(
        fetchError?.response?.data?.message || "Failed to load restaurants."
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
      fetchRestaurants(!hasLoadedOnce);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const handleStatusUpdate = async (restaurant, nextStatus) => {
    try {
      setUpdatingRestaurantId(restaurant._id);
      setFeedback(null);

      const response = await adminAPI.updateRestaurantStatus(
        restaurant._id,
        nextStatus
      );
      const updatedRestaurant = response?.data?.restaurant;

      setRestaurants((currentRestaurants) =>
        currentRestaurants.flatMap((currentRestaurant) => {
          if (
            currentRestaurant._id !== restaurant._id ||
            !updatedRestaurant
          ) {
            return [currentRestaurant];
          }

          if (statusFilter !== "all" && updatedRestaurant.status !== statusFilter) {
            return [];
          }

          return [updatedRestaurant];
        })
      );

      setFeedback({
        type: "success",
        message: `${restaurant.name} marked as ${nextStatus}.`,
      });
    } catch (updateError) {
      setFeedback({
        type: "error",
        message:
          updateError?.response?.data?.message ||
          `Failed to update ${restaurant.name}.`,
      });
    } finally {
      setUpdatingRestaurantId("");
    }
  };

  const handleRegisterRestaurant = () => {
    setFeedback({
      type: "info",
      message:
        "Admin-side restaurant creation is not part of the current Week 5 API, so this page stays focused on review and approval.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          Loading management console...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 sm:p-8">
      <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-contrast">
            Restaurant Management
          </h1>
          <p className="font-medium text-gray-500">
            Approve, monitor, and manage platform vendors
          </p>
        </div>

        <button
          type="button"
          onClick={handleRegisterRestaurant}
          className="w-full rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 sm:w-auto"
        >
          <span className="flex items-center justify-center gap-2">
            <Store size={20} />
            Register New Restaurant
          </span>
        </button>
      </header>

      {feedback ? (
        <FeedbackAlert
          type={feedback.type}
          title={
            feedback.type === "success"
              ? "Restaurant updated"
              : feedback.type === "info"
              ? "Read-only action"
              : "Update failed"
          }
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      ) : null}

      {error ? (
        <div className="flex items-center gap-4 rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600">
          <AlertCircle size={24} />
          <div className="flex-1">
            <p className="font-black">Error</p>
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchRestaurants(true)}
            className="rounded-xl bg-white px-4 py-2 font-bold shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-soft">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row">
          <div className="group relative w-full sm:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary"
              size={18}
            />
            <input
              type="text"
              placeholder="Search restaurants..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm font-bold text-contrast transition-all focus:border-primary focus:outline-none"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <select
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-black text-contrast transition-all focus:border-primary focus:outline-none sm:w-auto"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="border-b border-gray-100 bg-gray-50/40 px-6 py-3 text-sm text-gray-500">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{restaurants.length} restaurants in the current view</span>
            <span className="inline-flex items-center gap-2">
              {refreshing ? <Loader2 size={14} className="animate-spin" /> : null}
              {refreshing ? "Refreshing list..." : "Live admin restaurant data"}
            </span>
          </div>
        </div>

        {restaurants.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Store className="mx-auto text-gray-300" size={36} />
            <p className="mt-4 text-lg font-semibold text-gray-700">
              No restaurants found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try a different search or change the current status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    <th className="px-8 py-5">Restaurant</th>
                    <th className="px-8 py-5">Owner</th>
                    <th className="px-8 py-5">Total Orders</th>
                    <th className="px-8 py-5">Revenue</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {restaurants.map((restaurant) => {
                    const isUpdating =
                      updatingRestaurantId === restaurant._id;

                    return (
                      <tr
                        key={restaurant._id}
                        className="transition-colors hover:bg-gray-50/50"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 overflow-hidden rounded-2xl border border-gray-100 shadow-soft">
                              {restaurant.image ? (
                                <img
                                  src={restaurant.image}
                                  alt={restaurant.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-black text-primary">
                                  {restaurant.name?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-black text-contrast">
                                {restaurant.name}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {restaurant.category || "Uncategorized"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                            <User size={14} />
                            {restaurant.owner?.name || restaurant.owner?.email || "No owner"}
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                            <ShoppingBag size={14} />
                            {restaurant.metrics?.totalOrders || 0}
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1 text-sm font-black text-green-600">
                            <DollarSign size={14} />
                            {formatCurrency(restaurant.metrics?.totalRevenue || 0)}
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                              statusClasses[restaurant.status] || statusClasses.pending
                            }`}
                          >
                            {restaurant.status}
                          </span>
                        </td>

                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                              className="rounded-xl p-3 text-gray-400 transition-all hover:bg-primary/5 hover:text-primary"
                              title="View Storefront"
                            >
                              <ExternalLink size={20} />
                            </button>

                            {restaurant.status !== "approved" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusUpdate(restaurant, "approved")
                                }
                                disabled={isUpdating}
                                className="rounded-xl p-3 text-gray-400 transition-all hover:bg-green-50 hover:text-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Approve"
                              >
                                {isUpdating ? (
                                  <Loader2 size={20} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={20} />
                                )}
                              </button>
                            ) : null}

                            {restaurant.status !== "rejected" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusUpdate(restaurant, "rejected")
                                }
                                disabled={isUpdating}
                                className="rounded-xl p-3 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Reject"
                              >
                                {isUpdating ? (
                                  <Loader2 size={20} className="animate-spin" />
                                ) : (
                                  <XCircle size={20} />
                                )}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 lg:hidden">
              {restaurants.map((restaurant) => {
                const isUpdating = updatingRestaurantId === restaurant._id;

                return (
                  <article
                    key={restaurant._id}
                    className="rounded-[1.5rem] border border-gray-100 p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-2xl border border-gray-100">
                        {restaurant.image ? (
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-black text-primary">
                            {restaurant.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-contrast">
                              {restaurant.name}
                            </p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              {restaurant.category || "Uncategorized"}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                              statusClasses[restaurant.status] || statusClasses.pending
                            }`}
                          >
                            {restaurant.status}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            {restaurant.owner?.name || restaurant.owner?.email || "No owner"}
                          </div>
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={14} />
                            {restaurant.metrics?.totalOrders || 0} orders
                          </div>
                          <div className="flex items-center gap-1 font-bold text-green-600">
                            <DollarSign size={14} />
                            {formatCurrency(restaurant.metrics?.totalRevenue || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                        className="flex-1 rounded-2xl border px-4 py-3 text-sm text-primary"
                      >
                        View
                      </button>

                      {restaurant.status !== "approved" ? (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(restaurant, "approved")}
                          disabled={isUpdating}
                          className="flex-1 rounded-2xl border px-4 py-3 text-sm text-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? "Updating..." : "Approve"}
                        </button>
                      ) : null}

                      {restaurant.status !== "rejected" ? (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(restaurant, "rejected")}
                          disabled={isUpdating}
                          className="flex-1 rounded-2xl border px-4 py-3 text-sm text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? "Updating..." : "Reject"}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
