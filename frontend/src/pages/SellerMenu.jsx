import React, { useState, useCallback, useEffect } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useParams } from "react-router-dom";

import foodAPI from "../api/foodAPI";

const initialForm = {
  name: "",
  price: "",
  category: "",
  description: "",
  image: "",
  availability: true,
};

const SellerMenu = () => {
  const { id } = useParams();

  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchFoods = useCallback(async () => {
    if (!id) return;

    try {
      const res = await foodAPI.getByRestaurant(id);
      setFoods(Array.isArray(res?.data?.foods) ? res.data.foods : []);
      setError("");
    } catch (err) {
      console.error("Fetch foods error:", err);
      setFoods([]);
      setError(err?.response?.data?.message || "Failed to load foods.");
    }
  }, [id]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        restaurant: id,
      };

      if (editingId) {
        await foodAPI.update(editingId, payload);
      } else {
        await foodAPI.create(payload);
      }

      resetForm();
      await fetchFoods();
      setError("");
    } catch (err) {
      console.error("Save food error:", err);
      setError(err?.response?.data?.message || "Failed to save food.");
    }
  };

  const handleDelete = async (foodId) => {
    try {
      await foodAPI.delete(foodId);
      if (editingId === foodId) {
        resetForm();
      }
      await fetchFoods();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err?.response?.data?.message || "Failed to delete food.");
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
    setError("");
  };

  const filteredFoods = (foods || []).filter((food) =>
    String(food?.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-contrast">Menu Management</h1>
          <p className="text-gray-500">
            Add, edit, or remove items from your menu
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2"
        >
          <Plus size={20} />
          {editingId ? "Update Item" : "Add Item"}
        </button>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded-xl"
        />
        <input
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 rounded-xl"
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-2 rounded-xl"
        />
        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="border p-2 rounded-xl"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded-xl md:col-span-2 min-h-28"
        />
        <label className="flex items-center gap-3 border p-2 rounded-xl text-sm font-medium">
          <input
            type="checkbox"
            checked={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.checked })}
          />
          Available for customers
        </label>
        {editingId ? (
          <button
            onClick={resetForm}
            className="border p-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <X size={16} />
            Cancel editing
          </button>
        ) : null}
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 p-2 border rounded-xl w-full"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-soft border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredFoods.map((item, index) => (
              <tr key={item?._id || index} className="border-t">
                <td className="p-4 flex gap-3 items-center">
                  <img
                    src={item?.image || "https://picsum.photos/100/100"}
                    alt={item?.name || "food"}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold">{item?.name}</p>
                    <p className="text-xs text-gray-400">
                      {item?.description || "No description"}
                    </p>
                  </div>
                </td>

                <td className="p-4">{item?.category}</td>
                <td className="p-4 text-primary font-bold">Rs. {item?.price}</td>
                <td className="p-4">
                  {item?.availability ? "Available" : "Out"}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item?._id)}
                      className="text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerMenu;
