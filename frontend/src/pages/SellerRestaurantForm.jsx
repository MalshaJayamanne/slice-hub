import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import restaurantAPI from "../api/restaurantApi";
import { Save, Image as ImageIcon, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

const SellerRestaurantForm = () => {
  const navigate = useNavigate();
  const { id: restaurantId } = useParams();
  const isEditMode = Boolean(restaurantId);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: ""
  });

  useEffect(() => {
    if (isEditMode) {
      fetchRestaurant();
    }
  }, [restaurantId, isEditMode]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);

      const res = await restaurantAPI.getRestaurantById(restaurantId);
      const restaurant = res.data.restaurant;

      setFormData({
        name: restaurant.name || "",
        description: restaurant.description || "",
        category: restaurant.category || "",
        image: restaurant.image || ""
      });

    } catch (err) {
      console.error(err);
      setError("Failed to load restaurant data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (restaurantId) {
        await restaurantAPI.updateRestaurant(restaurantId, formData);
      } else {
        await restaurantAPI.createRestaurant(formData);
      }

      setError(null);
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save restaurant.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">

        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 border rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Restaurant" : "Create Restaurant"}
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your restaurant profile
          </p>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border">

        {/* Image */}
        <div className="space-y-2">

          <label className="font-semibold text-sm">Restaurant Image URL</label>

          <div className="flex items-center gap-2">

            <ImageIcon size={20} className="text-gray-400" />

            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              className="w-full border rounded-lg px-4 py-2"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
            />

          </div>

        </div>

        {/* Name */}
        <div className="space-y-2">

          <label className="font-semibold text-sm">Restaurant Name</label>

          <input
            type="text"
            required
            placeholder="Pizza Palace"
            className="w-full border rounded-lg px-4 py-2"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

        </div>

        {/* Category */}
        <div className="space-y-2">

          <label className="font-semibold text-sm">Category</label>

          <input
            type="text"
            required
            placeholder="Pizza, Burgers, Asian"
            className="w-full border rounded-lg px-4 py-2"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />

        </div>

        {/* Description */}
        <div className="space-y-2">

          <label className="font-semibold text-sm">Description</label>

          <textarea
            rows={4}
            placeholder="Tell customers about your restaurant..."
            className="w-full border rounded-lg px-4 py-2"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:opacity-90"
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
