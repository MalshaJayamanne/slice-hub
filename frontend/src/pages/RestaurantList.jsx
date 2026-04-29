import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  Filter,
  Search,
  SlidersHorizontal,
  Star,
  Store,
  X,
} from "lucide-react";

import RestaurantCard from "../components/RestaurantCard";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";
import { CATEGORIES } from "../constants";
import { restaurantService } from "../services/restaurantService";

const categoryOptions = [
  "All",
  ...new Set((CATEGORIES || []).map((category) => category?.name).filter(Boolean)),
];

const getSafeRestaurants = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.restaurants)
    ? data.restaurants
    : [];

const RestaurantList = () => {
  const location = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(
    location.state?.initialSearch || ""
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurants();
      setRestaurants(getSafeRestaurants(data));
      setError("");
    } catch (fetchError) {
      console.error("Restaurant fetch error:", fetchError);
      setRestaurants([]);
      setError("Failed to load restaurants. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (
      Object.prototype.hasOwnProperty.call(
        location.state || {},
        "initialSearch"
      )
    ) {
      setSearchQuery(location.state?.initialSearch || "");
    }
  }, [location.state]);

  const filteredRestaurants = useMemo(
    () =>
      (restaurants || []).filter((restaurant) => {
        const matchesSearch = String(restaurant?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" ||
          String(restaurant?.category || "").toLowerCase() ===
            selectedCategory.toLowerCase();

        const matchesRating =
          restaurant?.rating == null ||
          Number(restaurant.rating) >= minRating;

        return matchesSearch && matchesCategory && matchesRating;
      }),
    [minRating, restaurants, searchQuery, selectedCategory]
  );

  const activeFilterCount = [
    Boolean(searchQuery.trim()),
    selectedCategory !== "All",
    minRating > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setMinRating(0);
  };

  const sidebarNote = loading
    ? "Loading approved restaurants for the customer browsing workspace."
    : error
    ? "Restaurant data is unavailable right now. Retry from the main panel."
    : filteredRestaurants.length > 0
    ? `${filteredRestaurants.length} restaurants match your current filters.`
    : "Adjust the filters or clear them to widen the restaurant list.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={Store}
          title="Browse Restaurants"
          subtitle="A cleaner customer workspace for exploring approved restaurants and narrowing the list quickly."
          note={sidebarNote}
        >
          {!loading && !error ? (
            <div className="grid grid-cols-1 gap-3">
              <WorkspaceStat
                label="Approved"
                value={restaurants.length}
                hint="Restaurants currently visible on the platform"
              />
              <WorkspaceStat
                label="Matching"
                value={filteredRestaurants.length}
                hint={
                  activeFilterCount > 0
                    ? `${activeFilterCount} filters currently active`
                    : "No filters applied"
                }
                tone="warning"
              />
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Customer workspace"
      title="Explore Restaurants"
      description="Browse live restaurant listings, refine the results, and jump straight into the menus that fit what you want right now."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading restaurants"
          message="Collecting approved restaurant listings for the customer browsing flow."
        />
      ) : error ? (
        <WorkspaceErrorState
          title="Restaurants unavailable"
          message={error}
          onAction={fetchRestaurants}
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-gray-100 bg-gray-50 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:ring-2 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-semibold transition ${
                  showFilters
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === category
                      ? "border border-primary bg-primary text-white"
                      : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {searchQuery.trim() ? (
              <p className="mt-4 text-sm text-gray-500">
                Showing matches for{" "}
                <span className="font-semibold text-gray-700">
                  {searchQuery.trim()}
                </span>
                .
              </p>
            ) : null}
          </div>

          <AnimatePresence>
            {showFilters ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                      Minimum Rating
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[3, 4, 4.5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setMinRating((current) =>
                              current === rating ? 0 : rating
                            )
                          }
                          className={`inline-flex items-center gap-1 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                            minRating === rating
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                        >
                          {rating}+ <Star size={14} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      <X size={16} />
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {filteredRestaurants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <WorkspaceStat
                  label="Results"
                  value={filteredRestaurants.length}
                  hint="Restaurants currently matching your filters"
                />
                <WorkspaceStat
                  label="Category"
                  value={selectedCategory}
                  hint="Current category scope"
                  tone="dark"
                />
                <WorkspaceStat
                  label="Rating Floor"
                  value={minRating > 0 ? `${minRating}+` : "Any"}
                  hint="Minimum rating filter"
                  tone="warning"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredRestaurants.map((restaurant, index) => (
                  <motion.div
                    key={restaurant?._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <WorkspaceEmptyState
              title="No restaurants match yet"
              message="Try a different search, remove a filter, or reset the current filter set to see more approved restaurants."
              actionLabel={activeFilterCount > 0 ? "Clear Filters" : undefined}
              onAction={activeFilterCount > 0 ? clearFilters : undefined}
            />
          )}
        </div>
      )}
    </WorkspacePage>
  );
};

export default RestaurantList;
