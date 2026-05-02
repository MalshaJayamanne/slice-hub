import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Loader2,
  Pencil,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  User,
  X,
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

const initialRestaurantForm = {
  name: "",
  ownerId: "",
  category: "",
  description: "",
  image: "",
  status: "pending",
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
  const [deletingRestaurantId, setDeletingRestaurantId] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [isRestaurantFormOpen, setIsRestaurantFormOpen] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState("");
  const [restaurantForm, setRestaurantForm] = useState(initialRestaurantForm);
  const [submittingRestaurant, setSubmittingRestaurant] = useState(false);

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

  const fetchOwnerOptions = async () => {
    try {
      setOwnersLoading(true);

      const response = await adminAPI.getUsers({ role: "all", isActive: "all" });
      const users = Array.isArray(response?.data?.users) ? response.data.users : [];

      setOwnerOptions(
        users.filter((user) => ["seller", "admin"].includes(user.role))
      );
    } catch (ownerError) {
      setOwnerOptions([]);
      setFeedback({
        type: "error",
        message:
          ownerError?.response?.data?.message ||
          "Failed to load restaurant owner options.",
      });
    } finally {
      setOwnersLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRestaurants(!hasLoadedOnce);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const resetRestaurantForm = () => {
    setRestaurantForm(initialRestaurantForm);
    setEditingRestaurantId("");
  };

  const openCreateRestaurantForm = async () => {
    resetRestaurantForm();
    setIsRestaurantFormOpen(true);
    setFeedback(null);

    if (ownerOptions.length === 0) {
      await fetchOwnerOptions();
    }
  };

  const openEditRestaurantForm = async (restaurant) => {
    const ownerId =
      restaurant?.owner?._id ||
      restaurant?.ownerId?._id ||
      restaurant?.ownerId ||
      "";

    setEditingRestaurantId(restaurant._id);
    setRestaurantForm({
      name: restaurant?.name || "",
      ownerId: ownerId?.toString?.() || "",
      category: restaurant?.category || "",
      description: restaurant?.description || "",
      image: restaurant?.image || "",
      status: restaurant?.status || "pending",
    });
    setIsRestaurantFormOpen(true);
    setFeedback(null);

    if (ownerOptions.length === 0) {
      await fetchOwnerOptions();
    }
  };

  const closeRestaurantForm = () => {
    setIsRestaurantFormOpen(false);
    resetRestaurantForm();
  };

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

  const handleRestaurantFormChange = (field, value) => {
    setRestaurantForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmitRestaurant = async (event) => {
    event.preventDefault();

    if (
      !restaurantForm.name.trim() ||
      !restaurantForm.category.trim() ||
      !restaurantForm.ownerId
    ) {
      setFeedback({
        type: "error",
        message: "Name, owner, and category are required.",
      });
      return;
    }

    try {
      setSubmittingRestaurant(true);
      setFeedback(null);

      const payload = {
        name: restaurantForm.name.trim(),
        ownerId: restaurantForm.ownerId,
        category: restaurantForm.category.trim(),
        description: restaurantForm.description.trim(),
        image: restaurantForm.image.trim(),
        status: restaurantForm.status,
      };

      if (editingRestaurantId) {
        await adminAPI.updateRestaurant(editingRestaurantId, payload);
      } else {
        await adminAPI.createRestaurant(payload);
      }

      await fetchRestaurants(false);
      setFeedback({
        type: "success",
        message: editingRestaurantId
          ? "Restaurant updated successfully."
          : "Restaurant created successfully.",
      });
      closeRestaurantForm();
    } catch (submitError) {
      setFeedback({
        type: "error",
        message:
          submitError?.response?.data?.message ||
          "Failed to save restaurant.",
      });
    } finally {
      setSubmittingRestaurant(false);
    }
  };

  const handleDeleteRestaurant = async (restaurant) => {
    if (
      !window.confirm(
        `Delete ${restaurant.name}? Restaurants with existing orders cannot be removed.`
      )
    ) {
      return;
    }

    try {
      setDeletingRestaurantId(restaurant._id);
      setFeedback(null);

      await adminAPI.deleteRestaurant(restaurant._id);
      await fetchRestaurants(false);
      setFeedback({
        type: "success",
        message: `${restaurant.name} deleted successfully.`,
      });
    } catch (deleteError) {
      setFeedback({
        type: "error",
        message:
          deleteError?.response?.data?.message ||
          `Failed to delete ${restaurant.name}.`,
      });
    } finally {
      setDeletingRestaurantId("");
    }
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
    <div className="page-shell space-y-8 py-6 sm:py-8">
      <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Restaurant Management
          </h1>
          <p className="font-medium text-gray-500">
            Approve, monitor, and manage platform vendors
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateRestaurantForm}
          className="btn-primary w-full px-8 sm:w-auto"
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
              ? "Notice"
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

      {isRestaurantFormOpen ? (
        <form
          onSubmit={handleSubmitRestaurant}
          className="surface-panel p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                {editingRestaurantId ? "Edit Restaurant" : "Create Restaurant"}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold text-slate-900">
                {editingRestaurantId
                  ? "Edit Restaurant"
                  : "Register Restaurant"}
              </h2>
            </div>

            <button
              type="button"
              onClick={closeRestaurantForm}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <X size={16} />
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              placeholder="Restaurant name"
              value={restaurantForm.name}
              onChange={(event) =>
                handleRestaurantFormChange("name", event.target.value)
              }
              className="input-surface"
            />

            <select
              value={restaurantForm.ownerId}
              onChange={(event) =>
                handleRestaurantFormChange("ownerId", event.target.value)
              }
              className="select-surface"
              disabled={ownersLoading}
            >
              <option value="">
                {ownersLoading ? "Loading owners..." : "Select owner"}
              </option>
              {ownerOptions.map((owner) => (
                <option key={owner._id} value={owner._id}>
                  {owner.name} ({owner.role})
                </option>
              ))}
            </select>

            <input
              placeholder="Category"
              value={restaurantForm.category}
              onChange={(event) =>
                handleRestaurantFormChange("category", event.target.value)
              }
              className="input-surface"
            />

            <select
              value={restaurantForm.status}
              onChange={(event) =>
                handleRestaurantFormChange("status", event.target.value)
              }
              className="select-surface"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              placeholder="Image URL"
              value={restaurantForm.image}
              onChange={(event) =>
                handleRestaurantFormChange("image", event.target.value)
              }
              className="input-surface md:col-span-2"
            />

            <textarea
              placeholder="Description"
              value={restaurantForm.description}
              onChange={(event) =>
                handleRestaurantFormChange("description", event.target.value)
              }
              className="textarea-surface min-h-32 md:col-span-2"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submittingRestaurant}
              className="btn-primary"
            >
              {submittingRestaurant ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Store size={18} />
              )}
              {submittingRestaurant
                ? "Saving..."
                : editingRestaurantId
                ? "Update Restaurant"
                : "Create Restaurant"}
            </button>

            <button
              type="button"
              onClick={closeRestaurantForm}
              disabled={submittingRestaurant}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="surface-panel overflow-hidden">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row">
          <div className="group relative w-full sm:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#FF4F40]"
              size={17}
            />
            <input
              type="text"
              placeholder="Search restaurants..."
              className="input-surface w-full py-2.5 pl-11 text-sm"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <select
              className="select-surface w-full py-2.5 text-sm sm:w-auto"
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

        <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/60 px-5 py-2.5 text-xs text-slate-400">
          <span>{restaurants.length} restaurants</span>
          <span className="inline-flex items-center gap-1.5">
            {refreshing ? <Loader2 size={12} className="animate-spin" /> : null}
            {refreshing ? "Refreshing..." : "Live admin data"}
          </span>
        </div>

        {restaurants.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Store className="mx-auto text-slate-200" size={36} />
            <p className="mt-4 font-semibold text-slate-600">No restaurants found</p>
            <p className="mt-1 text-sm text-slate-400">Try a different search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-lite">
              <thead>
                <tr>
                  <th className="w-14"></th>
                  <th>Restaurant</th>
                  <th>Owner</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => {
                  const isUpdating = updatingRestaurantId === restaurant._id;
                  const isDeleting = deletingRestaurantId === restaurant._id;

                  return (
                    <tr key={restaurant._id}>
                      <td className="w-14">
                        <div className="h-11 w-11 overflow-hidden rounded-xl bg-slate-100">
                          {restaurant.image ? (
                            <img
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#FF4F40]">
                              {restaurant.name?.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <p className="font-display font-bold text-slate-900">{restaurant.name}</p>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {restaurant.category || "Uncategorized"}
                        </p>
                      </td>

                      <td>
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <User size={13} className="shrink-0 text-slate-400" />
                          <span className="truncate max-w-[120px]">
                            {restaurant.owner?.name || restaurant.owner?.email || "—"}
                          </span>
                        </span>
                      </td>

                      <td className="whitespace-nowrap text-slate-600">
                        {restaurant.metrics?.totalOrders || 0}
                      </td>

                      <td className="whitespace-nowrap font-semibold text-emerald-600">
                        {formatCurrency(restaurant.metrics?.totalRevenue || 0)}
                      </td>

                      <td>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusClasses[restaurant.status] || statusClasses.pending}`}>
                          {restaurant.status}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#FF4F40]"
                            title="View"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditRestaurantForm(restaurant)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-orange-50 hover:text-orange-500"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          {restaurant.status !== "approved" ? (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(restaurant, "approved")}
                              disabled={isUpdating}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-500 disabled:opacity-50"
                              title="Approve"
                            >
                              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            </button>
                          ) : null}
                          {restaurant.status !== "rejected" ? (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(restaurant, "rejected")}
                              disabled={isUpdating}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                              title="Reject"
                            >
                              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleDeleteRestaurant(restaurant)}
                            disabled={isDeleting}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                            title="Delete"
                          >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
  );
}
