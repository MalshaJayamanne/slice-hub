import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Filter,
  Loader2,
  Search,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import adminAPI from "../api/adminAPI";
import FeedbackAlert from "../components/FeedbackAlert";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
} from "../components/WorkspaceScaffold";

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;
const formatNumber = (value) =>
  new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

const HEALTH_ITEMS = [
  {
    label: "API Gateway",
    status: "Operational",
    statusClass: "text-emerald-500",
    load: 14,
  },
  {
    label: "Database Cluster",
    status: "Operational",
    statusClass: "text-emerald-500",
    load: 42,
  },
  {
    label: "Order Pipeline",
    status: "Operational",
    statusClass: "text-emerald-500",
    load: 36,
  },
  {
    label: "Approval Queue",
    status: "Monitored",
    statusClass: "text-orange-500",
    load: 78,
  },
];

const STATUS_RING_COLORS = {
  Pending: "#F59E0B",
  Preparing: "#0EA5E9",
  Delivered: "#10B981",
};

const metricCardStyles = [
  {
    icon: Users,
    iconWrap: "bg-blue-500 text-white",
    badgeWrap: "bg-blue-50 text-blue-600",
    orb: "bg-blue-500",
  },
  {
    icon: Store,
    iconWrap: "bg-violet-500 text-white",
    badgeWrap: "bg-violet-50 text-violet-600",
    orb: "bg-violet-500",
  },
  {
    icon: ShoppingBag,
    iconWrap: "bg-orange-500 text-white",
    badgeWrap: "bg-orange-50 text-orange-600",
    orb: "bg-orange-500",
  },
  {
    icon: DollarSign,
    iconWrap: "bg-emerald-500 text-white",
    badgeWrap: "bg-emerald-50 text-emerald-600",
    orb: "bg-emerald-500",
  },
];

const buildRestaurantLabel = (restaurant) =>
  restaurant?.name || "Restaurant submission";

const buildRestaurantOwnerLabel = (restaurant) =>
  restaurant?.owner?.name || restaurant?.owner?.email || "Unknown owner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingRestaurantId, setUpdatingRestaurantId] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryResponse, restaurantsResponse] = await Promise.all([
        adminAPI.getDashboardSummary(),
        adminAPI.getRestaurants({ status: "pending" }),
      ]);

      setSummary(summaryResponse?.data?.summary || null);
      setPendingRestaurants(
        Array.isArray(restaurantsResponse?.data?.restaurants)
          ? restaurantsResponse.data.restaurants
          : []
      );
    } catch (fetchError) {
      setSummary(null);
      setPendingRestaurants([]);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load the admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRestaurantAction = async (restaurant, nextStatus) => {
    try {
      setUpdatingRestaurantId(restaurant._id);
      setFeedback(null);

      await adminAPI.updateRestaurantStatus(restaurant._id, nextStatus);

      setPendingRestaurants((currentRestaurants) =>
        currentRestaurants.filter(
          (currentRestaurant) => currentRestaurant._id !== restaurant._id
        )
      );

      setSummary((currentSummary) => {
        if (!currentSummary) {
          return currentSummary;
        }

        return {
          ...currentSummary,
          restaurants: {
            ...currentSummary.restaurants,
            pending: Math.max(
              0,
              Number(currentSummary.restaurants.pending || 0) - 1
            ),
            approved:
              nextStatus === "approved"
                ? Number(currentSummary.restaurants.approved || 0) + 1
                : Number(currentSummary.restaurants.approved || 0),
            rejected:
              nextStatus === "rejected"
                ? Number(currentSummary.restaurants.rejected || 0) + 1
                : Number(currentSummary.restaurants.rejected || 0),
          },
        };
      });

      setFeedback({
        type: "success",
        message: `${buildRestaurantLabel(restaurant)} marked as ${nextStatus}.`,
      });
    } catch (updateError) {
      setFeedback({
        type: "error",
        message:
          updateError?.response?.data?.message ||
          `Failed to update ${buildRestaurantLabel(restaurant)}.`,
      });
    } finally {
      setUpdatingRestaurantId("");
    }
  };

  const filteredPendingRestaurants = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return pendingRestaurants;
    }

    return pendingRestaurants.filter((restaurant) => {
      const haystack = [
        restaurant?.name,
        restaurant?.category,
        restaurant?.owner?.name,
        restaurant?.owner?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [pendingRestaurants, searchTerm]);

  const summaryCards = useMemo(() => {
    if (!summary) {
      return [];
    }

    const activeRate = summary.users.total
      ? Math.round((summary.users.active / summary.users.total) * 100)
      : 0;
    const approvedRate = summary.restaurants.total
      ? Math.round(
          (summary.restaurants.approved / summary.restaurants.total) * 100
        )
      : 0;
    const deliveredRate = summary.orders.total
      ? Math.round((summary.orders.delivered / summary.orders.total) * 100)
      : 0;

    return [
      {
        label: "Total Users",
        value: formatNumber(summary.users.total),
        badge: `${activeRate}% active`,
      },
      {
        label: "Active Restaurants",
        value: formatNumber(summary.restaurants.approved),
        badge: `${approvedRate}% approved`,
      },
      {
        label: "Total Orders",
        value: formatNumber(summary.orders.total),
        badge: `${deliveredRate}% delivered`,
      },
      {
        label: "Platform Revenue",
        value: formatCurrency(summary.orders.totalRevenue),
        badge: `${formatNumber(summary.orders.delivered)} delivered`,
      },
    ].map((card, index) => ({
      ...card,
      ...metricCardStyles[index],
    }));
  }, [summary]);

  const activityBars = useMemo(() => {
    if (!summary) {
      return [];
    }

    const bars = [
      {
        label: "Customers",
        value: summary.users.customers,
        tone: "bg-primary",
      },
      {
        label: "Sellers",
        value: summary.users.sellers,
        tone: "bg-red-400",
      },
      {
        label: "Admins",
        value: summary.users.admins,
        tone: "bg-amber-400",
      },
      {
        label: "Pending",
        value: summary.restaurants.pending,
        tone: "bg-orange-400",
      },
      {
        label: "Approved",
        value: summary.restaurants.approved,
        tone: "bg-emerald-400",
      },
      {
        label: "Delivered",
        value: summary.orders.delivered,
        tone: "bg-sky-400",
      },
    ];

    const maxValue = Math.max(...bars.map((bar) => Number(bar.value || 0)), 1);

    return bars.map((bar) => ({
      ...bar,
      height: `${Math.max(
        18,
        Math.round((Number(bar.value || 0) / maxValue) * 100)
      )}%`,
    }));
  }, [summary]);

  const statusSplit = useMemo(() => {
    if (!summary) {
      return [];
    }

    const rows = [
      { name: "Pending", value: summary.orders.pending },
      { name: "Preparing", value: summary.orders.preparing },
      { name: "Delivered", value: summary.orders.delivered },
    ];

    const total = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);

    return rows.map((row) => ({
      ...row,
      color: STATUS_RING_COLORS[row.name],
      percentage: total
        ? Math.round((Number(row.value || 0) / total) * 100)
        : 0,
    }));
  }, [summary]);

  const ringStyle = useMemo(() => {
    if (!statusSplit.length) {
      return {
        background:
          "conic-gradient(#E5E7EB 0deg 360deg)",
      };
    }

    let currentAngle = 0;
    const segments = statusSplit.map((item) => {
      const degrees = (item.percentage / 100) * 360;
      const start = currentAngle;
      const end = currentAngle + degrees;
      currentAngle = end;
      return `${item.color} ${start}deg ${end}deg`;
    });

    return {
      background: `conic-gradient(${segments.join(", ")})`,
    };
  }, [statusSplit]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <WorkspaceLoadingState
          title="Loading dashboard"
          message="Pulling user, restaurant, and order totals for the admin workspace."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <WorkspaceErrorState
          title="Dashboard unavailable"
          message={error}
          onAction={fetchDashboard}
        />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <WorkspaceEmptyState
          title="No dashboard data yet"
          message="Summary sections will appear here once the platform has data to report."
        />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6 py-6 sm:space-y-8 sm:py-8">
        <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="section-kicker">Admin workspace</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-contrast sm:text-4xl">
              Platform Control
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-gray-500">
              Global system health, approvals, and live admin signals.
            </p>
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search pending approvals..."
                className="input-surface py-3 pl-10 text-xs shadow-sm sm:pl-12 sm:text-sm"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => setSearchTerm("")}
              disabled={!searchTerm}
              className={`rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm transition-all ${
                searchTerm
                  ? "text-gray-500 hover:bg-gray-50"
                  : "cursor-not-allowed text-gray-300"
              }`}
              title="Clear search"
            >
              <Filter size={18} />
            </button>
          </div>
        </header>

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {summaryCards.map((metric, index) => {
            const Icon = metric.icon;

            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="kpi-card sm:p-6"
              >
                <div className="relative z-10 mb-4 flex items-start justify-between">
                  <div className={`rounded-2xl p-3 shadow-lg ${metric.iconWrap}`}>
                    <Icon size={20} />
                  </div>

                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold sm:text-xs ${metric.badgeWrap}`}
                  >
                    <ArrowUpRight size={12} />
                    {metric.badge}
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 sm:text-xs">
                    {metric.label}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-contrast sm:text-3xl">
                    {metric.value}
                  </h3>
                </div>

                <div
                  className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-[0.04] transition-transform duration-700 group-hover:scale-150 ${metric.orb}`}
                />
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="surface-panel p-6 sm:p-8 lg:col-span-2">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-contrast sm:text-xl">
                  Platform Activity
                </h2>
                <p className="text-xs text-gray-400 sm:text-sm">
                  Live distribution across users, restaurants, and fulfilled orders.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-gray-500 sm:text-xs">
                    Users
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                  <span className="text-[10px] font-bold text-gray-500 sm:text-xs">
                    Restaurants
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold text-gray-500 sm:text-xs">
                    Orders
                  </span>
                </div>
              </div>
            </div>

            <div className="grid h-[250px] grid-cols-6 items-end gap-3 sm:h-[350px] sm:gap-4">
              {activityBars.map((bar) => (
                <div key={bar.label} className="flex h-full flex-col justify-end">
                  <div className="relative flex-1 rounded-[1.5rem] bg-gray-50 p-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: bar.height }}
                      transition={{ duration: 0.4 }}
                      className={`absolute bottom-2 left-2 right-2 rounded-[1rem] ${bar.tone}`}
                    />
                  </div>
                  <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    {bar.label}
                  </p>
                  <p className="mt-1 text-center text-sm font-black text-contrast">
                    {formatNumber(bar.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel flex flex-col p-8">
            <h2 className="mb-2 text-xl font-bold text-contrast">
              Order Status Split
            </h2>
            <p className="mb-8 text-sm text-gray-400">
              Live distribution across platform order states.
            </p>

            <div className="relative flex flex-1 items-center justify-center">
              <div
                className="relative h-48 w-48 rounded-full"
                style={ringStyle}
              >
                <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Total
                  </p>
                  <p className="text-xl font-black text-contrast">
                    {formatNumber(summary.orders.total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {statusSplit.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-bold text-gray-600">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-sm font-black text-contrast">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="table-shell lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-100 p-8">
              <h2 className="text-xl font-bold text-contrast">
                Restaurant Approvals
              </h2>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-600">
                {formatNumber(filteredPendingRestaurants.length)} Pending
              </span>
            </div>

            {filteredPendingRestaurants.length === 0 ? (
              <div className="px-8 py-12 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  No pending restaurants match the current search.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Try a different search term or clear the filter to see the full queue.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <th className="px-8 py-4">Restaurant</th>
                      <th className="px-8 py-4">Owner</th>
                      <th className="px-8 py-4">Category</th>
                      <th className="px-8 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPendingRestaurants.map((restaurant) => {
                      const isUpdating =
                        updatingRestaurantId === restaurant._id;

                      return (
                        <tr
                          key={restaurant._id}
                          className="transition-colors hover:bg-gray-50/50"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              {restaurant.image ? (
                                <img
                                  src={restaurant.image}
                                  alt={restaurant.name}
                                  className="h-10 w-10 rounded-xl object-cover shadow-sm"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xs font-black text-primary shadow-sm">
                                  {buildRestaurantLabel(restaurant)
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                              )}
                              <span className="text-sm font-black text-contrast">
                                {buildRestaurantLabel(restaurant)}
                              </span>
                            </div>
                          </td>

                          <td className="px-8 py-5 text-sm font-bold text-gray-600">
                            {buildRestaurantOwnerLabel(restaurant)}
                          </td>

                          <td className="px-8 py-5">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-600">
                              {restaurant.category || "Uncategorized"}
                            </span>
                          </td>

                          <td className="px-8 py-5">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRestaurantAction(
                                    restaurant,
                                    "approved"
                                  )
                                }
                                disabled={isUpdating}
                                className="rounded-xl bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Approve restaurant"
                              >
                                {isUpdating ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={18} />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRestaurantAction(
                                    restaurant,
                                    "rejected"
                                  )
                                }
                                disabled={isUpdating}
                                className="rounded-xl bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Reject restaurant"
                              >
                                {isUpdating ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <AlertCircle size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="surface-panel p-8">
            <h2 className="mb-6 text-xl font-bold text-contrast">
              System Health
            </h2>

            <div className="space-y-6">
              {HEALTH_ITEMS.map((service) => (
                <div
                  key={service.label}
                  className="rounded-2xl border border-gray-50 bg-gray-50/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-contrast">
                      {service.label}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${service.statusClass}`}
                    >
                      {service.status}
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${
                        service.load > 80 ? "bg-orange-500" : "bg-green-500"
                      }`}
                      style={{ width: `${service.load}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between">
                    <span className="text-[10px] font-bold text-gray-400">
                      Load
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {service.load}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-contrast py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-black"
            >
              <Activity size={18} />
              View Platform Orders
            </button>

            <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-sky-500">
                  <Store size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">
                    Admin Note
                  </p>
                  <p className="mt-1 text-sm text-sky-700">
                    {summary.restaurants.pending} restaurant approvals and{" "}
                    {summary.orders.pending} pending orders still need attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
