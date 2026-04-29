import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import restaurantAPI from "../api/restaurantApi";

const initialFormData = {
  name: "",
  description: "",
  category: "",
  image: "",
};

const SellerRestaurantForm = () => {
  const navigate = useNavigate();
  const { id: restaurantId } = useParams();
  const isEditMode = Boolean(restaurantId);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const fetchRestaurant = async () => {
    if (!restaurantId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await restaurantAPI.getRestaurantById(restaurantId);
      const restaurant = res?.data?.restaurant || res?.data || null;

      if (!restaurant) {
        throw new Error("Restaurant not found");
      }

      setFormData({
        name: restaurant?.name || "",
        description: restaurant?.description || "",
        category: restaurant?.category || "",
        image: restaurant?.image || "",
      });
    } catch (fetchError) {
      console.error(fetchError);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load restaurant data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchRestaurant();
    }
  }, [restaurantId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (restaurantId) {
        await restaurantAPI.updateRestaurant(restaurantId, formData);
      } else {
        await restaurantAPI.createRestaurant(formData);
      }

      navigate("/dashboard", {
        state: {
          feedback: {
            type: "success",
            title: isEditMode ? "Restaurant updated" : "Restaurant created",
            message: isEditMode
              ? "Restaurant details were saved successfully."
              : "Restaurant profile created successfully. You can continue with menu and order setup.",
          },
        },
      });
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError?.response?.data?.message ||
          "Failed to save restaurant."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="rounded-lg border p-2 transition hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-contrast">
            {isEditMode ? "Edit Restaurant" : "Create Restaurant"}
          </h1>
          <p className="text-sm text-gray-500">
            Manage your restaurant profile
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-8"
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold">Restaurant Image URL</label>

          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-gray-400" />

            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.image}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  image: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Restaurant Name</label>

          <input
            type="text"
            required
            placeholder="Pizza Palace"
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={formData.name}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Category</label>

          <input
            type="text"
            required
            placeholder="Pizza, Burgers, Asian"
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={formData.category}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Description</label>

          <textarea
            rows={4}
            placeholder="Tell customers about your restaurant..."
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={formData.description}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}

          {isEditMode ? "Update Restaurant" : "Create Restaurant"}
        </button>
      </form>
    </div>
  );
};

export default SellerRestaurantForm;
