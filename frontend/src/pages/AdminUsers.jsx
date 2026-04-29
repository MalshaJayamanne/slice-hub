import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  Loader2,
  Mail,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { motion } from "framer-motion";

import adminAPI from "../api/adminAPI";
import FeedbackAlert from "../components/FeedbackAlert";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
} from "../components/WorkspaceScaffold";

const roleClasses = {
  admin: "bg-purple-100 text-purple-600",
  seller: "bg-blue-100 text-blue-600",
  customer: "bg-gray-100 text-gray-600",
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

const escapeCsvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
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

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setActivityFilter("all");
  };

  const exportUsers = () => {
    if (!users.length) {
      return;
    }

    const rows = [
      ["User", "Email", "Role", "Joined Date", "Status", "Phone"],
      ...users.map((user) => [
        user.name || "Unknown user",
        user.email || "",
        user.role || "customer",
        formatDate(user.createdAt),
        user.isActive ? "Active" : "Inactive",
        user.phone || "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `platform-users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const showReadOnlyMessage = (message) => {
    setFeedback({
      type: "info",
      message,
    });
  };

  const sellerCount = users.filter((user) => user.role === "seller").length;
  const customerCount = users.filter((user) => user.role === "customer").length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const activeCount = users.filter((user) => user.isActive).length;

  const statusSummary = useMemo(() => {
    if (refreshing) {
      return "Refreshing user list...";
    }

    if (!users.length) {
      return "No users in the current filter view.";
    }

    return `${users.length} visible users, ${activeCount} active accounts`;
  }, [activeCount, refreshing, users.length]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <WorkspaceLoadingState
          title="Loading users"
          message="Pulling customer, seller, and admin accounts for review."
        />
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <WorkspaceErrorState
          title="Users unavailable"
          message={error}
          onAction={() => fetchUsers(true)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 sm:p-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-contrast">User Management</h1>
          <p className="text-gray-500">
            Manage customers, sellers, and administrators
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={exportUsers}
            disabled={!users.length}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              users.length
                ? "border border-gray-200 bg-white hover:bg-gray-50"
                : "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
            }`}
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={() =>
              showReadOnlyMessage(
                "User creation is not part of the Week 5 admin API, so this view stays read-only for the demo."
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-red-700"
          >
            <UserPlus size={16} />
            Add New User
          </button>
        </div>
      </header>

      {feedback ? (
        <FeedbackAlert
          type={feedback.type}
          title={feedback.type === "info" ? "Read-only action" : "Notice"}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      ) : null}

      {error ? (
        <FeedbackAlert
          type="error"
          title="Users unavailable"
          message={error}
          onClose={() => setError("")}
        />
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="flex gap-2">
              <div className="pointer-events-none flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-gray-400">
                <Filter size={16} />
              </div>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={activityFilter}
                onChange={(event) => setActivityFilter(event.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/60 px-6 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <div>{statusSummary}</div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            <span>{customerCount} customers</span>
            <span>{sellerCount} sellers</span>
            <span>{adminCount} admins</span>
            {refreshing ? (
              <span className="inline-flex items-center gap-2 text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                Refreshing
              </span>
            ) : null}
          </div>
        </div>

        {users.length === 0 ? (
          <div className="p-6">
            <WorkspaceEmptyState
              title="No users matched these filters"
              message="Try widening the current filters or search term to bring accounts back into view."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {users.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {getUserInitials(user.name)}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-contrast">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            roleClasses[user.role] || roleClasses.customer
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-xs capitalize text-gray-600">
                            {user.isActive ? "active" : "inactive"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              (window.location.href = `mailto:${user.email}`)
                            }
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-primary/5 hover:text-primary"
                            title="Send Message"
                          >
                            <Mail size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              showReadOnlyMessage(
                                `Role and permission editing for ${user.name} is still read-only in this demo.`
                              )
                            }
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-500"
                            title="Manage Permissions"
                          >
                            <Shield size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              showReadOnlyMessage(
                                `Account suspension for ${user.name} is not connected to a backend action yet.`
                              )
                            }
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                            title="Suspend User"
                          >
                            <UserX size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 md:hidden">
              {users.map((user, index) => (
                <motion.article
                  key={user._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-[1.5rem] border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {getUserInitials(user.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-contrast">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>

                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            roleClasses[user.role] || roleClasses.customer
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                        {user.isActive ? (
                          <UserCheck size={14} className="text-green-500" />
                        ) : (
                          <UserX size={14} className="text-red-500" />
                        )}
                        <span>{user.isActive ? "Active" : "Inactive"}</span>
                        <span className="text-gray-300">|</span>
                        <span>{formatDate(user.createdAt)}</span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            (window.location.href = `mailto:${user.email}`)
                          }
                          className="flex-1 rounded-2xl border px-4 py-3 text-sm text-primary"
                        >
                          Message
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            showReadOnlyMessage(
                              `Role and permission editing for ${user.name} is still read-only in this demo.`
                            )
                          }
                          className="flex-1 rounded-2xl border px-4 py-3 text-sm text-orange-500"
                        >
                          Permissions
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
