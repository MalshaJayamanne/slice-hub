import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Save,
  Store,
} from "lucide-react";

import restaurantAPI from "../api/restaurantApi";
import {
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";
import FeedbackAlert from "../components/FeedbackAlert";

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
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const fetchRestaurant = async () => {
    if (!restaurantId) {
      return;
    }

    try {
      setLoading(true);
      setLoadError("");

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
      setLoadError(
        fetchError?.response?.data?.message || "Failed to load restaurant data."
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
      setSubmitError("");

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
    } catch (submitRequestError) {
      console.error(submitRequestError);
      setSubmitError(
        submitRequestError?.response?.data?.message ||
          "Failed to save restaurant."
      );
    } finally {
      setSaving(false);
    }
  };

  const sidebarNote = isEditMode
    ? "Update the visible restaurant details that customers and admins see in shared management flows."
    : "Create the restaurant profile first, then continue into seller menu and order management.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={Store}
          title={isEditMode ? "Edit Restaurant" : "Create Restaurant"}
          subtitle="Use the same workspace language as the seller and admin pages so setup feels connected to the rest of the flow."
          note={sidebarNote}
        >
          <div className="grid gap-3">
            <WorkspaceStat
              label="Mode"
              value={isEditMode ? "Edit" : "Create"}
              hint="This page saves restaurant profile data"
            />
            <WorkspaceStat
              label="Approval"
              value="Pending"
              hint="New seller restaurants still require admin approval"
              tone="warning"
            />
          </div>
        </WorkspaceSidebar>
      }
      eyebrow="Seller workspace"
      title={isEditMode ? "Restaurant Profile" : "New Restaurant"}
      description="Keep the restaurant profile clean and complete so menu management, approvals, and customer-facing pages all stay aligned."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading restaurant profile"
          message="Pulling the current restaurant details into the seller workspace."
        />
      ) : loadError ? (
        <WorkspaceErrorState
          title="Restaurant unavailable"
          message={loadError}
          onAction={fetchRestaurant}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-2xl border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <div className="text-sm text-gray-500">
              Seller setup feeds directly into menu, order, and admin approval flows.
            </div>
          </div>

          {submitError ? (
            <FeedbackAlert
              type="error"
              title="Save failed"
              message={submitError}
              onClose={() => setSubmitError("")}
            />
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Restaurant Image Url
                </label>
                <div className="relative">
                  <ImageIcon
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-2xl border px-11 py-3 outline-none focus:ring-2 focus:ring-primary/20"
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
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pizza Palace"
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
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
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Category
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pizza, Burgers, Asian"
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell customers about your restaurant..."
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode ? "Update Restaurant" : "Create Restaurant"}
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </WorkspacePage>
  );
};

export default SellerRestaurantForm;
