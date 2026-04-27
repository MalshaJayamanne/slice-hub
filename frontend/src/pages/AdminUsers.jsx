import { useEffect, useState } from "react";
import { Activity, ShieldCheck, Store, Users } from "lucide-react";

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

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getUsers();
      setUsers(Array.isArray(response?.data?.users) ? response.data.users : []);
    } catch (fetchError) {
      setUsers([]);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load platform users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const sellerCount = users.filter((user) => user.role === "seller").length;
  const customerCount = users.filter((user) => user.role === "customer").length;
  const activeCount = users.filter((user) => user.isActive).length;

  const sidebarNote = loading
    ? "Loading platform accounts for the admin workspace."
    : error
    ? "User data is unavailable right now. Retry from the main panel."
    : users.length > 0
    ? `${sellerCount} sellers and ${customerCount} customers are currently on the platform.`
    : "User accounts will appear here once they have been created.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={Users}
          title="User Management"
          subtitle="Review account roles, activity, and seller ownership from one place."
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
                Accounts currently allowed to access the platform.
              </p>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Admin workspace"
      title="Platform Users"
      description="Start with read-only account visibility first, then layer in filters, editing, and moderation actions."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading users"
          message="Pulling customer, seller, and admin accounts for review."
        />
      ) : error ? (
        <WorkspaceErrorState
          title="Users unavailable"
          message={error}
          onAction={fetchUsers}
        />
      ) : users.length === 0 ? (
        <WorkspaceEmptyState
          title="No users found"
          message="User cards will appear here once people start using the platform."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <WorkspaceStat
              label="Total Users"
              value={users.length}
              hint="All platform accounts"
            />
            <WorkspaceStat
              label="Sellers"
              value={sellerCount}
              hint="Restaurant-side accounts"
              tone="warning"
            />
            <WorkspaceStat
              label="Active"
              value={activeCount}
              hint={`${users.length - activeCount} inactive accounts`}
              tone="success"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              User List
            </p>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="rounded-[1.5rem] border border-gray-100 p-5 bg-white"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-contrast">{user.name}</h2>
                      <p className="mt-1 text-sm text-gray-500">{user.email}</p>
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

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Role
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900 capitalize">
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
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-LK")
                          : "Unknown"}
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
                        <Activity size={16} />
                        Monitoring-only scaffold for Week 5.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </WorkspacePage>
  );
}
