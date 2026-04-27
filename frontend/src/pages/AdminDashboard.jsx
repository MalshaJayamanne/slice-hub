import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  LayoutDashboard,
  Package,
  Users,
} from "lucide-react";

import adminAPI from "../api/adminAPI";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getDashboardSummary();
      setSummary(response?.data?.summary || null);
    } catch (fetchError) {
      setSummary(null);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load the admin dashboard summary."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const quickLinks = [
    {
      label: "Manage Users",
      description: "Review platform accounts and role access",
      icon: Users,
      action: () => navigate("/admin/users"),
    },
    {
      label: "Review Restaurants",
      description: "Approve or reject seller restaurant submissions",
      icon: Building2,
      action: () => navigate("/admin/restaurants"),
    },
    {
      label: "Monitor Orders",
      description: "Track live platform order activity",
      icon: Package,
      action: () => navigate("/admin/orders"),
    },
  ];

  const sidebarNote = loading
    ? "Loading platform totals for your admin workspace."
    : error
    ? "The admin summary is unavailable right now. You can retry from the main panel."
    : summary
    ? `${summary.restaurants.pending} restaurant approvals and ${summary.orders.pending} pending orders are waiting for review.`
    : "Dashboard totals will appear here once platform data is available.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={LayoutDashboard}
          title="Admin Control"
          subtitle="A central snapshot for platform health, approvals, and order activity."
          note={sidebarNote}
        >
          {summary ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                Revenue Snapshot
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-primary">
                {formatCurrency(summary.orders.totalRevenue)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Based on all orders recorded on the platform.
              </p>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Admin workspace"
      title="Platform Dashboard"
      description="Start with stable platform visibility first, then layer in editing tools and deeper controls."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading dashboard"
          message="Pulling user, restaurant, and order totals for the admin workspace."
        />
      ) : error ? (
        <WorkspaceErrorState
          title="Dashboard unavailable"
          message={error}
          onAction={fetchSummary}
        />
      ) : !summary ? (
        <WorkspaceEmptyState
          title="No dashboard data yet"
          message="Summary cards will appear here once the platform has data to report."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <WorkspaceStat
              label="Total Users"
              value={summary.users.total}
              hint={`${summary.users.active} active accounts`}
            />
            <WorkspaceStat
              label="Pending Restaurants"
              value={summary.restaurants.pending}
              hint={`${summary.restaurants.approved} approved so far`}
              tone="warning"
            />
            <WorkspaceStat
              label="Total Orders"
              value={summary.orders.total}
              hint={`${summary.orders.pending} still pending`}
            />
            <WorkspaceStat
              label="Customers"
              value={summary.users.customers}
              hint={`${summary.users.sellers} sellers and ${summary.users.admins} admins`}
              tone="dark"
            />
            <WorkspaceStat
              label="Delivered Orders"
              value={summary.orders.delivered}
              hint={`${summary.orders.preparing} currently preparing`}
              tone="success"
            />
            <WorkspaceStat
              label="Platform Revenue"
              value={formatCurrency(summary.orders.totalRevenue)}
              hint="Gross revenue across all recorded orders"
              tone="success"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Admin Actions
            </p>
            <div className="space-y-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="w-full flex items-center justify-between rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <Icon className="text-gray-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </WorkspacePage>
  );
}
