import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
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
import { getCategoryStyles } from "../utils/categoryUtils";

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
  const [selectedCategory, setSelectedCategory] = useState(
    location.state?.initialCategory || "All"
  );
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
    if (location.state) {
      if (Object.prototype.hasOwnProperty.call(location.state, "initialSearch")) {
        setSearchQuery(location.state.initialSearch || "");
      }
      if (Object.prototype.hasOwnProperty.call(location.state, "initialCategory")) {
        setSelectedCategory(location.state.initialCategory || "All");
      }
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

        const matchesRating = (restaurant?.averageRating || 0) >= minRating;

        return matchesSearch && matchesCategory && matchesRating;
      }),
    [restaurants, searchQuery, selectedCategory, minRating]
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
          title="Marketplace"
          subtitle="Explore the best restaurants in your area, refined by category and rating."
          note={sidebarNote}
        >
          {!loading && !error ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                <WorkspaceStat
                  label="Available"
                  value={restaurants.length}
                  hint="Approved vendors online"
                />
                <WorkspaceStat
                  label="Matches"
                  value={filteredRestaurants.length}
                  hint={
                    activeFilterCount > 0
                      ? `${activeFilterCount} active filters`
                      : "No active filters"
                  }
                  tone="warning"
                />
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">
                  Quick Hint
                </p>
                <p className="mt-2 text-xs font-medium leading-relaxed text-sky-700">
                  Select a category chip to narrow your search to specific cuisines instantly.
                </p>
              </div>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Marketplace Explorer"
      title="Discover Food"
      description="Jump straight into curated menus, or use the filters below to find exactly what you're craving right now."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading marketplace"
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
          <div className="surface-panel p-6 sm:p-8 mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="relative flex-1 group">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="input-surface w-full py-4 pl-14 text-base"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 font-bold transition-all ${
                    showFilters
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                      : "border-slate-100 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <SlidersHorizontal size={18} />
                  Filters
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-4 font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
                Browse by Category
              </p>
              <div className="flex flex-wrap gap-2.5">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
                      selectedCategory === category
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 -translate-y-0.5"
                        : "bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-md border border-transparent hover:border-slate-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="surface-panel p-8 mb-8 border-2 border-primary/10">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="flex flex-col justify-end">
                      <p className="text-sm font-medium text-slate-500 mb-2">
                        Browse through our verified restaurants and their latest menus.
                      </p>
                      <p className="text-xs text-slate-400">
                        Ratings and reviews are provided by customers who have completed orders.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {filteredRestaurants.length > 0 ? (
            <div className="surface-panel overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100">
              <div className="overflow-x-auto">
                <table className="table-lite w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="w-20 px-6 py-5"></th>
                      <th className="min-w-[240px] px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-400">Restaurant</th>
                      <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-400">Category</th>
                      <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-400">Rating</th>
                      <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-400">Delivery</th>
                      <th className="w-32 px-6 py-5 text-right text-xs font-black uppercase tracking-widest text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRestaurants.map((restaurant, index) => (
                      <motion.tr
                        key={restaurant?._id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                        onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                      >
                        <td className="w-20 px-6 py-6">
                          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                            {restaurant.image ? (
                              <img
                                src={restaurant.image}
                                alt={restaurant.name}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Store size={24} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="font-display text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {restaurant.name}
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-400">
                            {restaurant.description || "Premium dining experience"}
                          </p>
                        </td>
                        <td className="px-6 py-6">
                          {restaurant.category ? (
                            <span className={`inline-flex items-center rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${getCategoryStyles(restaurant.category)}`}>
                              {restaurant.category}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <Star size={14} className={restaurant.averageRating > 0 ? "fill-amber-500 text-amber-500" : "text-slate-300"} />
                            <span className={restaurant.averageRating > 0 ? "text-sm font-bold text-amber-600" : "text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap"}>
                              {restaurant.averageRating > 0 ? restaurant.averageRating.toFixed(1) : "No ratings"}
                            </span>
                            {restaurant.numReviews > 0 && (
                              <span className="text-[10px] font-bold text-slate-400">
                                ({restaurant.numReviews})
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap text-base font-bold text-slate-500">
                          {restaurant.deliveryTime || "25–35 min"}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button
                            type="button"
                            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white transition-all group-hover:bg-primary group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:-translate-x-1"
                          >
                            <ChevronRight size={22} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <WorkspaceEmptyState
              title="No restaurants found"
              message="We couldn't find any restaurants matching your current criteria. Try expanding your search or clearing filters."
              actionLabel={activeFilterCount > 0 ? "Clear All Filters" : undefined}
              onAction={activeFilterCount > 0 ? clearFilters : undefined}
            />
          )}
        </div>
      )}
    </WorkspacePage>
  );
};

export default RestaurantList;
