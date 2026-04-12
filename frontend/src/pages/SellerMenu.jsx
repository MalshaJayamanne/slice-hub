import React, { useState, useCallback, useEffect } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import foodAPI from "../api/foodAPI";

const SellerMenu = () => {
  const { id } = useParams();

  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
  });

  const fetchFoods = useCallback(async () => {
    if (!id) return;

    try {
      const res = await foodAPI.getByRestaurant(id);
      // FIX: response shape is { success, count, foods }
      setFoods(Array.isArray(res?.data?.foods) ? res.data.foods : []);
    } catch (err) {
      console.error("Fetch foods error:", err);
      setFoods([]);
    }
  }, [id]);

  // FIX: fetchFoods was never called on mount
  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleAdd = async () => {
    try {
      await foodAPI.create({
        ...form,
        price: Number(form.price), // FIX: convert string → number
        availability: true,        // FIX: add required default
        restaurant: id,
      });
      setForm({ name: "", price: "", category: "", image: "" });
      fetchFoods();
    } catch (err) {
      console.error("Add food error:", err);
    }
  };

  const handleDelete = async (foodId) => {
    try {
      await foodAPI.delete(foodId);
      fetchFoods();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredFoods = (foods || []).filter((f) =>
    String(f?.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-contrast">
            Menu Management
          </h1>
          <p className="text-gray-500">
            Add, edit, or remove items from your menu
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2"
        >
          <Plus size={20} />
          Add Item
        </button>
      </header>

      {/* ADD FORM */}
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="border p-2 rounded-xl"
        />
        <input
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
          className="border p-2 rounded-xl"
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          className="border p-2 rounded-xl"
        />
        <input
          placeholder="Image"
          value={form.image}
          onChange={(e) =>
            setForm({ ...form, image: e.target.value })
          }
          className="border p-2 rounded-xl"
        />
      </div>

      {/* SEARCH */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 p-2 border rounded-xl w-full"
        />
      </div>

      {/* TABLE */}
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
            {filteredFoods.map((item, i) => (
              <tr
                key={item?._id || i}
                className="border-t"
              >
                <td className="p-4 flex gap-3 items-center">
                  <img
                    src={
                      item?.image ||
                      "https://picsum.photos/100/100"
                    }
                    alt={item?.name || "food"}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold">{item?.name}</p>
                    <p className="text-xs text-gray-400">
                      {item?.description}
                    </p>
                  </div>
                </td>

                <td className="p-4">{item?.category}</td>
                <td className="p-4 text-primary font-bold">
                  Rs. {item?.price}
                </td>

                <td className="p-4">
                  {item?.availability ? "Available" : "Out"}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(item?._id)}
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
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