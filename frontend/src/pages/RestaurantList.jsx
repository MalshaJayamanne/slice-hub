import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Filter,
  Search,
  SlidersHorizontal,
  Star,
  Store,
  X,
} from "lucide-react";

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
  const navigate = useNavigate();
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
          <div className="surface-panel p-5 sm:p-6 mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  className="input-surface w-full py-3 pl-12"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold transition-all ${
                  showFilters
                    ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                    selectedCategory === category
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
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
                className="surface-panel p-6"
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

              <div className="surface-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table-lite">
                    <thead>
                      <tr>
                        <th className="w-14"></th>
                        <th>Restaurant</th>
                        <th>Category</th>
                        <th>Rating</th>
                        <th>Delivery</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRestaurants.map((restaurant, index) => (
                        <motion.tr
                          key={restaurant?._id || index}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <td className="w-14">
                            <div className="h-11 w-11 overflow-hidden rounded-xl bg-slate-100">
                              {restaurant.image ? (
                                <img
                                  src={restaurant.image}
                                  alt={restaurant.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Store size={18} className="text-slate-300" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <p className="font-display font-bold text-slate-900">
                              {restaurant.name}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                              {restaurant.description || "—"}
                            </p>
                          </td>
                          <td>
                            {restaurant.category ? (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {restaurant.category}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td>
                            {restaurant.rating ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-orange-500">
                                <Star size={13} className="fill-orange-400 text-orange-400" />
                                {restaurant.rating}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap text-slate-500">
                            {restaurant.deliveryTime || "30–40 min"}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF4F40] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#E63E30]"
                            >
                              View Menu
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
