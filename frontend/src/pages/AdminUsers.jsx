import { useEffect, useState } from "react";
import { Loader2, Search, ShieldCheck, Store, Users } from "lucide-react";

import adminAPI from "../api/adminAPI";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";

const roleClasses = {
  admin: "bg-red-50 text-red-600 border border-red-100",
  seller: "bg-orange-50 text-orange-600 border border-orange-100",
  customer: "bg-sky-50 text-sky-600 border border-sky-100",
};

const activeClasses = {
  true: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  false: "bg-gray-100 text-gray-500 border border-gray-200",
};

const getUserInitials = (name) =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  const fetchUsers = async (initialLoad) => {
    try {
      if (initialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await adminAPI.getUsers({
        search: searchTerm.trim(),
        role: roleFilter,
        isActive: activityFilter,
      });

      setUsers(Array.isArray(response?.data?.users) ? response.data.users : []);
    } catch (fetchError) {
      setUsers([]);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load platform users."
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
      fetchUsers(!hasLoadedOnce);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, activityFilter]);

  const sellerCount = users.filter((user) => user.role === "seller").length;
  const customerCount = users.filter((user) => user.role === "customer").length;
  const activeCount = users.filter((user) => user.isActive).length;
  const adminCount = users.filter((user) => user.role === "admin").length;

  const sidebarNote = loading
    ? "Loading platform accounts for the admin workspace."
    : error && users.length === 0
    ? "User data is unavailable right now. Retry from the main panel."
    : users.length > 0
    ? `${sellerCount} sellers and ${customerCount} customers are visible in the current filter view.`
    : "User accounts will appear here once people start using the platform.";

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setActivityFilter("all");
  };

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={Users}
          title="User Management"
          subtitle="Review platform accounts, role access, and seller ownership from one consistent workspace."
          note={sidebarNote}
        >
          {users.length > 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                Active Accounts
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-primary">
                {activeCount}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {adminCount} admins are currently visible in this filtered list.
              </p>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Admin workspace"
      title="Platform Users"
      description="Start with dependable read-only user visibility first, then layer in moderation and account editing later."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading users"
          message="Pulling customer, seller, and admin accounts for review."
        />
      ) : error && users.length === 0 ? (
        <WorkspaceErrorState
          title="Users unavailable"
          message={error}
          onAction={() => fetchUsers(true)}
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
                  Narrow the current user list by search text, role, or account activity.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                {refreshing ? <Loader2 size={16} className="animate-spin" /> : null}
                {refreshing ? "Refreshing list..." : `${users.length} visible users`}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]">
              <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, or phone"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </label>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
              >
                <option value="all">All roles</option>
                <option value="customer">Customers</option>
                <option value="seller">Sellers</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={activityFilter}
                onChange={(event) => setActivityFilter(event.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
              >
                <option value="all">All activity</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
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

          {users.length === 0 ? (
            <WorkspaceEmptyState
              title="No users matched these filters"
              message="Try widening the current filters or search term to bring accounts back into view."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <WorkspaceStat
                  label="Visible Users"
                  value={users.length}
                  hint="Accounts in the current filter view"
                />
                <WorkspaceStat
                  label="Sellers"
                  value={sellerCount}
                  hint={`${customerCount} customers also visible`}
                  tone="warning"
                />
                <WorkspaceStat
                  label="Active"
                  value={activeCount}
                  hint={`${users.length - activeCount} inactive accounts`}
                  tone="success"
                />
                <WorkspaceStat
                  label="Admins"
                  value={adminCount}
                  hint="Admin-level accounts in the current view"
                  tone="dark"
                />
              </div>

              <div>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                    User List
                  </p>
                  <p className="text-sm text-gray-500">
                    Read-only visibility for Week 5 role review and demo prep.
                  </p>
                </div>

                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="rounded-[1.5rem] border border-gray-100 bg-white p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-sm font-black text-contrast">
                            {getUserInitials(user.name)}
                          </div>

                          <div>
                            <h2 className="text-xl font-bold text-contrast">
                              {user.name}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                              roleClasses[user.role] || roleClasses.customer
                            }`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                              activeClasses[String(user.isActive)]
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <div className="rounded-2xl bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Role
                          </p>
                          <p className="mt-2 text-sm font-semibold capitalize text-gray-900">
                            {user.role}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Phone
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {user.phone || "Not added"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Address
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {user.address || "Not added"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Seller Metrics
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {user.metrics?.ownedRestaurantCount || 0} restaurants
                          </p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                            Joined
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-2">
                          <ShieldCheck size={16} />
                          Access follows the stored role on this account.
                        </span>
                        {user.role === "seller" ? (
                          <span className="inline-flex items-center gap-2">
                            <Store size={16} />
                            Seller account with restaurant ownership metrics.
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <Users size={16} />
                            Included for admin-side visibility and role review.
                          </span>
                        )}
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
