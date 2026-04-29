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
          <h1 className="text-3xl font-black tracking-tight text-contrast">
            Restaurant Management
          </h1>
          <p className="font-medium text-gray-500">
            Approve, monitor, and manage platform vendors
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateRestaurantForm}
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
          className="surface-panel p-6 sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                {editingRestaurantId ? "Edit Restaurant" : "Create Restaurant"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-contrast">
                {editingRestaurantId
                  ? "Update Restaurant Record"
                  : "Register Platform Restaurant"}
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

      <div className="table-shell rounded-[2.5rem]">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row">
          <div className="group relative w-full sm:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary"
              size={18}
            />
            <input
              type="text"
              placeholder="Search restaurants..."
              className="input-surface w-full py-3 pl-12 text-sm font-bold text-contrast"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <select
              className="select-surface w-full px-6 py-3 text-sm font-black text-contrast sm:w-auto"
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
                    const isUpdating = updatingRestaurantId === restaurant._id;
                    const isDeleting = deletingRestaurantId === restaurant._id;

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

                            <button
                              type="button"
                              onClick={() => openEditRestaurantForm(restaurant)}
                              className="rounded-xl p-3 text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-500"
                              title="Edit Restaurant"
                            >
                              <Pencil size={20} />
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

                            <button
                              type="button"
                              onClick={() => handleDeleteRestaurant(restaurant)}
                              disabled={isDeleting}
                              className="rounded-xl p-3 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                              title="Delete Restaurant"
                            >
                              {isDeleting ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : (
                                <Trash2 size={20} />
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

            <div className="grid gap-4 p-4 lg:hidden">
              {restaurants.map((restaurant) => {
                const isUpdating = updatingRestaurantId === restaurant._id;
                const isDeleting = deletingRestaurantId === restaurant._id;

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

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                        className="rounded-2xl border px-4 py-3 text-sm text-primary"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditRestaurantForm(restaurant)}
                        className="rounded-2xl border px-4 py-3 text-sm text-orange-500"
                      >
                        Edit
                      </button>

                      {restaurant.status !== "approved" ? (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(restaurant, "approved")}
                          disabled={isUpdating}
                          className="rounded-2xl border px-4 py-3 text-sm text-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? "Updating..." : "Approve"}
                        </button>
                      ) : null}

                      {restaurant.status !== "rejected" ? (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(restaurant, "rejected")}
                          disabled={isUpdating}
                          className="rounded-2xl border px-4 py-3 text-sm text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? "Updating..." : "Reject"}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleDeleteRestaurant(restaurant)}
                        disabled={isDeleting}
                        className="rounded-2xl border px-4 py-3 text-sm text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
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
