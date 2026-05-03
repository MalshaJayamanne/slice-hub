import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Pencil,
  Plus,
  Search,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import foodAPI from "../api/foodAPI";
import restaurantAPI from "../api/restaurantApi";

const initialForm = {
  name: "",
  price: "",
  category: "",
  description: "",
  image: "",
  availability: true,
};

const SellerMenu = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }, []);

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const canManageRestaurant = useCallback(
    (restaurantData) => {
      if (!restaurantData || !currentUser) return false;
      if (currentUser.role === "admin") return true;

      const ownerId =
        restaurantData?.ownerId?._id ||
        restaurantData?.ownerId ||
        restaurantData?.owner?._id ||
        restaurantData?.owner;

      return ownerId?.toString?.() === currentUser?._id?.toString?.();
    },
    [currentUser]
  );

  const fetchFoods = useCallback(async () => {
    if (!id || forbidden) return;

    try {
      const res = await foodAPI.getByRestaurant(id);
      setFoods(Array.isArray(res?.data?.foods) ? res.data.foods : []);
      setError("");
    } catch (err) {
      console.error("Fetch foods error:", err);
      setFoods([]);
      setError(err?.response?.data?.message || "Failed to load foods.");
    }
  }, [forbidden, id]);

  useEffect(() => {
    if (!id) return;

    const loadPageData = async () => {
      try {
        setLoading(true);
        const [restaurantRes, foodsRes] = await Promise.all([
          restaurantAPI.getRestaurant(id),
          foodAPI.getByRestaurant(id),
        ]);

        const restaurantData = restaurantRes?.data?.restaurant || null;
        const hasAccess = canManageRestaurant(restaurantData);

        if (!hasAccess) {
          setRestaurant(null);
          setFoods([]);
          setForbidden(true);
          setError("You can only manage food for your own restaurant.");
          return;
        }

        setRestaurant(restaurantData);
        setFoods(Array.isArray(foodsRes?.data?.foods) ? foodsRes.data.foods : []);
        setForbidden(false);
        setError("");
      } catch (err) {
        console.error("Seller menu load error:", err);
        setRestaurant(null);
        setFoods([]);
        setForbidden(false);
        setError(err?.response?.data?.message || "Failed to load restaurant menu.");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [canManageRestaurant, id]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.category.trim()) {
      setError("Food name and category are required.");
      return false;
    }

    if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      setError("Price must be a valid number greater than or equal to 0.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        ...form,
        price: Number(form.price),
        restaurant: id,
      };

      if (editingId) {
        await foodAPI.update(editingId, payload);
        setSuccess("Food item updated successfully.");
      } else {
        await foodAPI.create(payload);
        setSuccess("Food item added successfully.");
      }

      resetForm();
      await fetchFoods();
      setError("");
    } catch (err) {
      console.error("Save food error:", err);
      setSuccess("");
      setError(err?.response?.data?.message || "Failed to save food.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (foodId) => {
    try {
      setDeletingId(foodId);
      await foodAPI.delete(foodId);
      if (editingId === foodId) {
        resetForm();
      }
      await fetchFoods();
      setSuccess("Food item deleted successfully.");
      setError("");
    } catch (err) {
      console.error("Delete error:", err);
      setSuccess("");
      setError(err?.response?.data?.message || "Failed to delete food.");
    } finally {
      setDeletingId("");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item?._id || null);
    setForm({
      name: item?.name || "",
      price: item?.price?.toString?.() || "",
      category: item?.category || "",
      description: item?.description || "",
      image: item?.image || "",
      availability: item?.availability ?? true,
    });
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredFoods = useMemo(
    () =>
      (foods || []).filter((food) =>
        `${food?.name || ""} ${food?.category || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [foods, search]
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Loading seller menu
          </p>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
            Access Restricted
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            This restaurant is not in your seller workspace
          </h1>
          <p className="mt-3 text-gray-600">
            You can only manage food items for restaurants that belong to your account.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/restaurants")}
              className="rounded-2xl border px-5 py-3 font-semibold text-gray-700 hover:bg-white"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8 py-8 sm:py-10">
      <div className="surface-panel shadow-md bg-gradient-to-br from-orange-50 via-white to-red-50 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white"
              >
                <ChevronLeft size={16} />
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate(`/restaurant/${id}`)}
                className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white"
              >
                <Store size={16} />
                View Customer Menu
              </button>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                Seller Food Management
              </p>
              <h1 className="font-display mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
                {restaurant?.name || "Restaurant Menu"}
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Add new dishes, update availability, and keep your menu polished for customers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="kpi-card px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Foods</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{foods.length}</p>
            </div>
            <div className="kpi-card px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Available</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {foods.filter((item) => item?.availability).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      ) : null}

      <div className="grid xl:grid-cols-[1.1fr_1.4fr] gap-8">
        <section className="surface-panel p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                {editingId ? "Editing" : "Create"}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold text-slate-900">
                {editingId ? "Update Food Item" : "Add New Food"}
              </h2>
            </div>

            {editingId ? (
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                <X size={16} />
                Cancel
              </button>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              {saving ? "Saving..." : editingId ? "Update Food" : "Add Food"}
            </button>

            <button
              onClick={resetForm}
              disabled={saving}
              className="btn-secondary"
            >
              <X size={18} />
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
            <input
              placeholder="Food name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-surface"
            />
            <input
              placeholder="Price"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-surface"
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-surface"
            />
            <input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="input-surface"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="textarea-surface min-h-32 md:col-span-2 xl:col-span-1"
            />
            <label className="soft-panel flex items-center gap-3 p-4 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.checked })}
              />
              Available for customers
            </label>
          </div>
        </section>

        <section className="surface-panel p-6 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Menu Library
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold text-slate-900">Existing Foods</h2>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search by name or category"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-surface pl-11 py-3"
              />
            </div>
          </div>

          {filteredFoods.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
              <Store className="mx-auto text-gray-300" size={36} />
              <p className="mt-4 text-lg font-semibold text-gray-700">No foods found</p>
              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try a different search term or clear the search field."
                  : "Start by adding your first food item on the left."}
              </p>
            </div>
          ) : (
          <div className="surface-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-lite">
                <thead>
                  <tr>
                    <th className="w-14"></th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map((item) => (
                    <tr key={item?._id}>
                      <td className="w-14">
                        <div className="h-11 w-11 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={item?.image || "https://picsum.photos/100/100"}
                            alt={item?.name || "food"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td>
                        <p className="font-display font-bold text-slate-900">{item?.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                          {item?.description || "No description"}
                        </p>
                      </td>
                      <td className="text-slate-500">{item?.category}</td>
                      <td className="whitespace-nowrap font-semibold text-[#FF4F40]">
                        Rs. {item?.price}
                      </td>
                      <td>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${item?.availability ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {item?.availability ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-500"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item?._id)}
                            disabled={deletingId === item?._id}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === item?._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SellerMenu;
