import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  ShoppingBag,
  Store,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import adminAPI from "../api/adminAPI";
import FeedbackAlert from "../components/FeedbackAlert";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";

const statusClasses = {
  pending: "bg-amber-50 text-amber-600 border border-amber-100",
  approved: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  rejected: "bg-red-50 text-red-600 border border-red-100",
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;
const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

export default function AdminRestaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [updatingRestaurantId, setUpdatingRestaurantId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
        fetchError?.response?.data?.message ||
          "Failed to load restaurants."
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

  const updateStatus = async (restaurant, nextStatus) => {
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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const pendingCount = restaurants.filter(
    (restaurant) => restaurant.status === "pending"
  ).length;
  const approvedCount = restaurants.filter(
    (restaurant) => restaurant.status === "approved"
  ).length;
  const visibleRevenue = restaurants.reduce(
    (total, restaurant) => total + Number(restaurant.metrics?.totalRevenue || 0),
    0
  );
  const visibleOrders = restaurants.reduce(
    (total, restaurant) => total + Number(restaurant.metrics?.totalOrders || 0),
    0
  );

  const sidebarNote = loading
    ? "Loading restaurant submissions for the admin workspace."
    : error && restaurants.length === 0
    ? "Restaurant data is unavailable right now. Retry from the main panel."
    : restaurants.length > 0
    ? `${pendingCount} restaurants are still waiting for approval in the current view.`
    : "Restaurant submissions will appear here once sellers create them.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={Building2}
          title="Restaurant Review"
          subtitle="Approve, reject, and monitor seller restaurant submissions from one consistent admin workspace."
          note={sidebarNote}
        >
          {restaurants.length > 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                Visible Revenue
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-primary">
                {formatCurrency(visibleRevenue)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Based on {visibleOrders} orders across the restaurants in this view.
              </p>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Admin workspace"
      title="Restaurant Management"
      description="Start with dependable approval and visibility first, then layer in heavier moderation tools later."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading restaurants"
          message="Gathering restaurant, owner, and approval data for review."
        />
      ) : error && restaurants.length === 0 ? (
        <WorkspaceErrorState
          title="Restaurants unavailable"
          message={error}
          onAction={() => fetchRestaurants(true)}
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
                  Narrow the current restaurant list by search text or approval status.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                {refreshing ? <Loader2 size={16} className="animate-spin" /> : null}
                {refreshing
                  ? "Refreshing list..."
                  : `${restaurants.length} visible restaurants`}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_auto]">
              <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by restaurant name or category"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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

          {feedback ? (
            <FeedbackAlert
              type={feedback.type}
              title={
                feedback.type === "success"
                  ? "Restaurant updated"
                  : "Update failed"
              }
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          ) : null}

          {error ? (
            <FeedbackAlert
              type="error"
              title="Restaurants unavailable"
              message={error}
              onClose={() => setError("")}
            />
          ) : null}

          {restaurants.length === 0 ? (
            <WorkspaceEmptyState
              title="No restaurants matched these filters"
              message="Try widening the current filters to bring submissions back into view."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <WorkspaceStat
                  label="Visible Restaurants"
                  value={restaurants.length}
                  hint="Submissions in the current view"
                />
                <WorkspaceStat
                  label="Pending"
                  value={pendingCount}
                  hint="Waiting for an admin decision"
                  tone="warning"
                />
                <WorkspaceStat
                  label="Approved"
                  value={approvedCount}
                  hint={`${restaurants.length - approvedCount} not approved in this view`}
                  tone="success"
                />
                <WorkspaceStat
                  label="Visible Orders"
                  value={visibleOrders}
                  hint={formatCurrency(visibleRevenue)}
                  tone="dark"
                />
              </div>

              <div>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                    Restaurant List
                  </p>
                  <p className="text-sm text-gray-500">
                    Approval-focused cards for Week 5 demo and admin review.
                  </p>
                </div>

                <div className="space-y-4">
                  {restaurants.map((restaurant) => {
                    const isUpdating = updatingRestaurantId === restaurant._id;

                    return (
                      <div
                        key={restaurant._id}
                        className="rounded-[1.5rem] border border-gray-100 bg-white p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={restaurant.image || "/default-restaurant.png"}
                              alt={restaurant.name}
                              className="h-16 w-16 rounded-2xl object-cover bg-gray-100"
                            />

                            <div>
                              <h2 className="text-xl font-bold text-contrast">
                                {restaurant.name}
                              </h2>
                              <p className="mt-1 text-sm text-gray-500">
                                {restaurant.category || "Uncategorized"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                              statusClasses[restaurant.status] || statusClasses.pending
                            }`}
                          >
                            {restaurant.status}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl bg-gray-50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                              Owner
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                              {restaurant.owner?.name || "No owner assigned"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {restaurant.owner?.email || "No email available"}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                              Total Orders
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                              {restaurant.metrics?.totalOrders || 0}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                              Revenue
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                              {formatCurrency(restaurant.metrics?.totalRevenue || 0)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                              Created
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                              {formatDate(restaurant.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-2">
                            <Store size={16} />
                            Seller: {restaurant.owner?.name || "Unknown owner"}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <ShoppingBag size={16} />
                            {restaurant.metrics?.totalOrders || 0} platform orders linked
                          </span>
                        </div>

                        {restaurant.description ? (
                          <p className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            {restaurant.description}
                          </p>
                        ) : null}

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm text-gray-500">
                            Approval updates flow directly through the admin restaurant API.
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => updateStatus(restaurant, "approved")}
                              disabled={isUpdating || restaurant.status === "approved"}
                              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                isUpdating || restaurant.status === "approved"
                                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                  : "bg-emerald-500 text-white hover:bg-emerald-600"
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStatus(restaurant, "rejected")}
                              disabled={isUpdating || restaurant.status === "rejected"}
                              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                isUpdating || restaurant.status === "rejected"
                                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                  : "bg-red-500 text-white hover:bg-red-600"
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <XCircle size={16} />
                              )}
                              Reject
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                              <ExternalLink size={16} />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </WorkspacePage>
  );
}
