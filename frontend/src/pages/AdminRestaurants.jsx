import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, CheckCircle, XCircle, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import adminAPI from "../api/adminAPI";
import { motion } from "framer-motion";

const AdminRestaurants = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      const res = await adminAPI.getRestaurants();

      setRestaurants(Array.isArray(res.data?.restaurants) ? res.data.restaurants : []);
      setError(null);

    } catch (err) {
      console.error(err);
      setError("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await adminAPI.updateRestaurantStatus(id, status);
      const updatedRestaurant = response?.data?.restaurant;

      setRestaurants((prev) =>
        prev.map((r) =>
          r._id === id && updatedRestaurant ? updatedRestaurant : r
        )
      );

    } catch (err) {
      console.error("Failed to update status", err);
      setError(err.response?.data?.message || "Failed to update restaurant status.");
    }
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      r.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">

      <h1 className="text-3xl font-bold">
        Restaurant Management
      </h1>

      {error && (
        <div className="bg-red-50 p-4 rounded-xl flex gap-2 items-center">
          <AlertCircle />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search restaurants"
          className="border p-3 rounded-xl w-80"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <select
          className="border p-3 rounded-xl"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50 text-left text-sm">
            <tr>
              <th className="p-4">Restaurant</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Revenue</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredRestaurants.map((res) => (
              <motion.tr
                key={res._id}
                whileHover={{ backgroundColor: "#f9fafb" }}
              >

                <td className="p-4 flex items-center gap-3">
                  <img
                    src={res.image || "/default-restaurant.png"}
                    alt={res.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />

                  <div>
                    <p className="font-semibold">
                      {res.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      {res.category}
                    </p>
                  </div>
                </td>

                <td className="p-4">
                  <div>
                    <p className="font-medium">
                      {res.owner?.name || "No owner"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {res.owner?.email || "No email"}
                    </p>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <ShoppingBag size={14} />
                    {res.metrics?.totalOrders || 0}
                  </div>
                </td>

                <td className="p-4 text-green-600 font-semibold">
                  Rs {res.metrics?.totalRevenue || 0}
                </td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100">
                    {res.status || "pending"}
                  </span>
                </td>

                <td className="p-4 text-right space-x-2">

                  <button
                    className="p-2 hover:bg-green-50 rounded-lg"
                    onClick={() =>
                      updateStatus(res._id, "approved")
                    }
                  >
                    <CheckCircle size={18} className="text-green-600" />
                  </button>

                  <button
                    className="p-2 hover:bg-red-50 rounded-lg"
                    onClick={() =>
                      updateStatus(res._id, "rejected")
                    }
                  >
                    <XCircle size={18} className="text-red-600" />
                  </button>

                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => navigate(`/restaurant/${res._id}`)}
                  >
                    <ExternalLink size={18} />
                  </button>

                </td>

              </motion.tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
};

export default AdminRestaurants;
