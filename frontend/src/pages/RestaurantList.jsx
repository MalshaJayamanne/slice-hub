import React, { useState, useEffect } from "react";
import { restaurantService } from "../services/restaurantService";
import RestaurantCard from "../components/RestaurantCard";

import { Search, Filter, Star, Loader2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { CATEGORIES } from "../constants";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurants();
      setRestaurants(data);
      setError(null);
    } catch (err) {
      setError("Failed to load restaurants. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = (r.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      (r.category || "").toLowerCase() === selectedCategory.toLowerCase();

    const matchesRating = (r.rating || 0) >= minRating;

    return matchesSearch && matchesCategory && matchesRating;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-500 font-bold animate-pulse text-xs uppercase tracking-widest">
          Discovering the best slices...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <AlertCircle size={40} className="text-red-500" />
        <h2 className="text-2xl font-bold text-gray-800">
          Something went wrong
        </h2>
        <p className="text-gray-500">{error}</p>

        <button
          onClick={fetchRestaurants}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Explore Restaurants
        </h1>

        {/* SEARCH */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search restaurants..."
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-3 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
          >
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6">

        {/* ALL BUTTON */}
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium ${
            selectedCategory === "All"
              ? "bg-orange-500 text-white shadow-md shadow-orange-200 border border-orange-500"
              : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
          }`}
        >
          All
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium ${
              selectedCategory === cat.name
                ? "bg-orange-500 text-white shadow-md shadow-orange-200 border border-orange-500"
                : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ADVANCED FILTER */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 grid md:grid-cols-3 gap-6 shadow-sm">

              <div>
                <h4 className="font-bold mb-3 text-gray-700">
                  Minimum Rating
                </h4>

                <div className="flex gap-2">
                  {[3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setMinRating(minRating === rating ? 0 : rating)
                      }
                      className={`px-3 py-2 border rounded-lg flex items-center gap-1 transition ${
                        minRating === rating
                          ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"
                          : "border-gray-200 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                    >
                      {rating}+ <Star size={14} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setMinRating(0);
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="border border-red-200 px-4 py-2 rounded-lg text-red-500 flex items-center gap-2 hover:bg-red-50 transition"
                >
                  <X size={16} />
                  Reset Filters
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULT COUNT */}
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {filteredRestaurants.length} Restaurants Found
      </h2>

      {/* RESTAURANT GRID */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant, i) => (
            <motion.div
              key={restaurant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No restaurants found.</p>

          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setMinRating(0);
            }}
            className="text-primary font-medium mt-3 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
