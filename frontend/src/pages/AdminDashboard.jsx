import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";

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

  const sidebarNote = loading
    ? "Loading platform totals for the admin workspace."
    : error
    ? "The platform summary is unavailable right now. Retry from the main panel."
    : summary
    ? `${summary.restaurants.pending} restaurants are waiting for approval and ${summary.orders.pending} orders are still pending.`
    : "Summary cards will appear here once the platform has data to report.";

  const summaryCards = summary
    ? [
        {
          label: "Total Users",
          value: summary.users.total,
          hint: `${summary.users.active} active accounts`,
        },
        {
          label: "Sellers",
          value: summary.users.sellers,
          hint: `${summary.users.customers} customers on the platform`,
          tone: "dark",
        },
        {
          label: "Pending Restaurants",
          value: summary.restaurants.pending,
          hint: `${summary.restaurants.approved} approved restaurants`,
          tone: "warning",
        },
        {
          label: "Rejected Restaurants",
          value: summary.restaurants.rejected,
          hint: `${summary.restaurants.total} total restaurant records`,
        },
        {
          label: "Total Orders",
          value: summary.orders.total,
          hint: `${summary.orders.pending} still waiting to be processed`,
        },
        {
          label: "Preparing Orders",
          value: summary.orders.preparing,
          hint: `${summary.orders.delivered} delivered successfully`,
          tone: "warning",
        },
        {
          label: "Delivered Orders",
          value: summary.orders.delivered,
          hint: "Completed platform orders",
          tone: "success",
        },
        {
          label: "Platform Revenue",
          value: formatCurrency(summary.orders.totalRevenue),
          hint: "Gross revenue across recorded orders",
          tone: "success",
        },
      ]
    : [];

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={LayoutDashboard}
          title="Admin Control"
          subtitle="A summary-first view of platform health before deeper management tools are layered in."
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
                Based on all orders currently recorded on the platform.
              </p>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Admin workspace"
      title="Platform Dashboard"
      description="Start with stable summary cards first so the admin team can trust the numbers before we expand into deeper actions."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <WorkspaceStat
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
              tone={card.tone}
            />
          ))}
        </div>
      )}
    </WorkspacePage>
  );
}
