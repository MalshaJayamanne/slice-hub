import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Filter,
  LayoutDashboard,
  Package,
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
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";
import { getCategoryStyles } from "../utils/categoryUtils";

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

  const quickNav = [
    { label: "Manage Users", icon: Users, path: "/admin/users" },
    { label: "Manage Restaurants", icon: Store, path: "/admin/restaurants" },
    { label: "Manage Orders", icon: Package, path: "/admin/orders" },
  ];

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
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={LayoutDashboard}
          title="Admin Control"
          subtitle="Global system health, approvals, and live admin signals."
          note={`${summary.restaurants.pending} restaurant approvals and ${summary.orders.pending} pending orders need attention.`}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Quick Navigation
              </p>
              <div className="grid grid-cols-1 gap-2">
                {quickNav.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-primary" />
                      {item.label}
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  Platform Revenue
                </p>
                <DollarSign size={14} className="text-emerald-500" />
              </div>
              <p className="font-display text-2xl font-bold text-emerald-700">
                {formatCurrency(summary.orders.totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-emerald-600/80">
                Generated from {summary.orders.delivered} delivered orders.
              </p>
            </div>
          </div>
        </WorkspaceSidebar>
      }
      eyebrow="Platform Overview"
      title="Admin Dashboard"
      description="Monitor platform health, manage pending approvals, and track order fulfillment across the entire SliceHub network."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <WorkspaceStat
            label="Total Users"
            value={formatNumber(summary.users.total)}
            hint={`${Math.round((summary.users.active / summary.users.total) * 100)}% accounts active`}
            tone="primary"
          />
          <WorkspaceStat
            label="Restaurants"
            value={formatNumber(summary.restaurants.approved)}
            hint={`${summary.restaurants.pending} pending approval`}
            tone="dark"
          />
          <WorkspaceStat
            label="Total Orders"
            value={formatNumber(summary.orders.total)}
            hint={`${Math.round((summary.orders.delivered / summary.orders.total) * 100)}% fulfillment rate`}
            tone="warning"
          />
          <WorkspaceStat
            label="Growth Signal"
            value="+12.4%"
            hint="User acquisition trend this week"
            tone="success"
          />
        </div>

        <div className="flex flex-col gap-8 lg:gap-10">
          <div className="surface-panel p-8 sm:p-10 flex flex-col w-full">
            <h2 className="font-display mb-10 text-2xl font-bold text-slate-900">
              Platform Activity
            </h2>
            <div className="flex items-end justify-between gap-2 sm:gap-4 lg:gap-6 w-full max-w-4xl mx-auto">
              {activityBars.map((bar) => (
                <div key={bar.label} className="group flex flex-1 flex-col items-center justify-end">
                  <div className="flex h-[240px] w-full max-w-[80px] flex-col justify-end rounded-2xl bg-slate-50 border border-slate-100 p-1.5 transition-colors group-hover:bg-slate-100 shadow-sm mx-auto">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: bar.height }}
                      transition={{ duration: 0.8, ease: "easeOut", type: "spring", bounce: 0.2 }}
                      className={`w-full rounded-[10px] shadow-sm ${bar.tone} transition-all duration-300 group-hover:brightness-110 origin-bottom`}
                    />
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-1 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 truncate w-full px-1">
                      {bar.label}
                    </p>
                    <p className="font-display text-base font-bold text-slate-900 transition-colors group-hover:text-[#FF4F40]">
                      {formatNumber(bar.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel p-8 sm:p-10 flex flex-col w-full">
            <h2 className="font-display mb-10 text-2xl font-bold text-slate-900">
              Order Fulfillment
            </h2>
            <div className="flex flex-col items-center justify-center gap-10 sm:flex-row w-full max-w-3xl mx-auto">
              <div className="relative flex h-56 w-56 shrink-0 items-center justify-center drop-shadow-xl transition-transform duration-500 hover:scale-105">
                <div className="h-full w-full rounded-full" style={ringStyle} />
                <div className="absolute flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border-8 border-white">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total</p>
                  <p className="font-display mt-0.5 text-4xl font-bold tracking-tight text-slate-900">{formatNumber(summary.orders.total)}</p>
                </div>
              </div>

              <div className="flex w-full flex-1 flex-col justify-center gap-4 xl:pl-8">
                {statusSplit.map((item) => (
                  <div key={item.name} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-[#FF4F40]/30 hover:bg-white hover:shadow-md hover:shadow-[#FF4F40]/5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110">
                        <div className="h-3.5 w-3.5 rounded-full shadow-inner" style={{ backgroundColor: item.color }} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500 transition-colors group-hover:text-slate-900">{item.name}</span>
                        <span className="text-[13px] font-semibold text-slate-400">{formatNumber(item.value)} orders</span>
                      </div>
                    </div>
                    <span className="font-display text-2xl font-bold text-slate-900">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="surface-panel overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Pending Approvals
            </h2>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search queue..."
                className="input-surface py-3.5 pl-12 pr-4 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredPendingRestaurants.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-500 font-medium text-lg">No pending restaurant approvals found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-lite w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="w-20 px-6 py-5"></th>
                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-400">Restaurant</th>
                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-400">Owner</th>
                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="w-32 px-6 py-5 text-right text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPendingRestaurants.map((restaurant) => {
                    const isUpdating = updatingRestaurantId === restaurant._id;
                    return (
                      <tr key={restaurant._id} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="w-20 px-6 py-5">
                          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
                            {restaurant.image ? (
                              <img src={restaurant.image} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Store size={24} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-display text-lg font-bold text-slate-900">{restaurant.name}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-600">
                            {restaurant.owner?.name || "No name"}
                          </p>
                          <p className="text-xs font-medium text-slate-400">
                            {restaurant.owner?.email || "No email"}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${getCategoryStyles(restaurant.category)}`}>
                            {restaurant.category || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleRestaurantAction(restaurant, "approved")}
                              disabled={isUpdating}
                              title="Approve"
                              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-500/30"
                            >
                              {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={22} />}
                            </button>
                            <button
                              onClick={() => handleRestaurantAction(restaurant, "rejected")}
                              disabled={isUpdating}
                              title="Reject"
                              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-red-500/30"
                            >
                              {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <AlertCircle size={22} />}
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
      </div>
    </WorkspacePage>
  );
}

