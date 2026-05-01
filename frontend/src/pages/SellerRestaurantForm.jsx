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
import useToast from "../hooks/useToast";

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
  const toast = useToast();

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
      const message =
        submitError?.response?.data?.message ||
        "Failed to save restaurant.";
      setError(message);
      toast.error(message, "Save failed");
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
    <div className="page-shell py-10 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
      <div className="surface-panel-strong p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="btn-secondary rounded-xl px-3 py-3"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <p className="section-kicker">Seller workspace</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-contrast">
            {isEditMode ? "Edit Restaurant" : "Create Restaurant"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
            Manage your restaurant profile
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-6 flex items-center gap-2 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-red-600">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        <div className="space-y-2">
          <label className="ml-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
            Restaurant Image URL
          </label>

          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-gray-400" />

            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              className="input-surface"
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
          <label className="ml-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
            Restaurant Name
          </label>

          <input
            type="text"
            required
            placeholder="Pizza Palace"
            className="input-surface"
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
          <label className="ml-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
            Category
          </label>

          <input
            type="text"
            required
            placeholder="Pizza, Burgers, Asian"
            className="input-surface"
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
          <label className="ml-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
            Description
          </label>

          <textarea
            rows={4}
            placeholder="Tell customers about your restaurant..."
            className="textarea-surface"
            value={formData.description}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}

            {isEditMode ? "Update Restaurant" : "Create Restaurant"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </form>
      </div>
      </div>
    </div>
  );
};

export default SellerRestaurantForm;
