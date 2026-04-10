import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { restaurantService } from "../services/restaurantService";
import { Star, Clock, ChevronLeft, Search, Plus, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const RestaurantMenu = ({ onAddToCart }) => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);

      const data = await restaurantService.getRestaurantById(id);

      setRestaurant(data);
      setMenuItems(Array.isArray(data.menu) ? data.menu : []);

      setError(null);
    } catch (err) {
      setError("Failed to load restaurant.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10" />
        <p>Loading menu...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="text-center p-10">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <p>{error}</p>

        <button
          onClick={() => navigate("/restaurants")}
          className="mt-4 bg-primary text-white px-6 py-2 rounded"
        >
          Back Home
        </button>
      </div>
    );
  }

  const categories = ["All", ...(restaurant.category ? [restaurant.category] : [])];

  const filteredMenu = menuItems.filter((item) => {

    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;

    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <div className="pb-20">

      {/* Restaurant Banner */}
      <div className="relative h-64 overflow-hidden">

        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover brightness-50"
        />

        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 bg-white p-2 rounded-full"
        >
          <ChevronLeft />
        </button>

        <div className="absolute inset-0 flex items-center justify-center text-white">

          <div className="text-center">

            <h1 className="text-4xl font-bold">{restaurant.name}</h1>

            <div className="flex justify-center gap-4 mt-2">

              <span className="flex items-center gap-1">
                <Star size={16} fill="yellow" />
                {restaurant.rating || "New"}
              </span>

              <span className="flex items-center gap-1">
                <Clock size={16} />
                {restaurant.deliveryTime || "30-40 min"}
              </span>

            </div>

          </div>

        </div>
      </div>

      {/* Menu Section */}

      <div className="max-w-7xl mx-auto p-6">

        {/* Search */}

        <div className="mb-6 flex gap-4">

          <div className="relative w-full">

            <Search className="absolute left-3 top-3 text-gray-400" />

            <input
              type="text"
              placeholder="Search food..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

          </div>

        </div>

        {/* Categories */}

        <div className="flex gap-3 mb-8 overflow-x-auto">

          {categories.map((cat) => (

            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-gray-100"
              }`}
            >
              {cat}
            </button>

          ))}

        </div>

        {/* Menu Grid */}

        {filteredMenu.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">

            {filteredMenu.map((item) => (

              <motion.div
                key={item._id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-xl shadow p-4"
              >

                <img
                  src={item.image}
                  alt={item.name}
                  className="h-40 w-full object-cover rounded-lg mb-4"
                />

                <h3 className="font-bold">{item.name}</h3>

                <p className="text-gray-500 text-sm mb-2">
                  {item.description}
                </p>

                <div className="flex justify-between items-center">

                  <span className="font-bold text-primary">
                    ${item.price}
                  </span>

                  <button
                    onClick={() => onAddToCart?.(item)}
                    className="bg-black text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add
                  </button>

                </div>

              </motion.div>

            ))}

          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Menu coming soon
            </h2>
            <p className="mt-2 text-gray-500">
              This restaurant is available, but its menu items have not been added yet.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};

export default RestaurantMenu;
