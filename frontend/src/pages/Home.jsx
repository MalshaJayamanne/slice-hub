import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  Search,
  Sparkles,
  Star,
  Store,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

import FoodCard from "../components/FoodCard";
import RestaurantCard from "../components/RestaurantCard";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
} from "../components/WorkspaceScaffold";
import foodAPI from "../api/foodAPI";
import { useCart } from "../context/CartContext";
import { restaurantService } from "../services/restaurantService";
import { hasAuthSession } from "../utils/auth";
import useToast from "../hooks/useToast";

export default function Home() {
  const navigate = useNavigate();
  const { addItem, canUseCart } = useCart();
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroSearch, setHeroSearch] = useState("");
  const [heroLocation, setHeroLocation] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const resRestaurants = await restaurantService.getRestaurants();
      const resFoods = await foodAPI.getAll();

      const safeRestaurants = Array.isArray(resRestaurants)
        ? resRestaurants
        : resRestaurants?.restaurants || [];

      const safeFoods = Array.isArray(resFoods?.data?.foods) ? resFoods.data.foods : [];

      setRestaurants(safeRestaurants);
      setFoods(safeFoods);
    } catch (fetchError) {
      console.error("Home fetch error:", fetchError);
      setRestaurants([]);
      setFoods([]);
      setError("Failed to load featured restaurants and dishes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const recommendedFood = useMemo(() => {
    if (!Array.isArray(foods) || foods.length === 0) return null;
    return foods[Math.floor(Math.random() * foods.length)];
  }, [foods]);

  const isSignedIn = useMemo(() => hasAuthSession(), []);

  const handleBrowseRestaurants = () => {
    navigate("/restaurants", {
      state: {
        initialSearch: heroSearch.trim(),
      },
    });
  };

  const handleAddToCart = (food) => {
    const result = addItem(food, 1);
    toast.showToast({
      type: result.success ? "success" : "error",
      title: result.success ? "Added to cart" : "Cart update failed",
      message: result.message,
    });
  };

  return (
    <div className="space-y-20 pb-24">
      <section className="relative flex min-h-[760px] items-center overflow-hidden bg-black py-24">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1920"
            alt="Food background"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/68" />
        </div>

        <div className="page-shell relative z-10 pt-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-[58rem] space-y-8"
          >
            <div className="glass-panel flex w-fit items-center gap-2 px-4 py-2.5 text-white">
              <Sparkles size={16} />
              <span className="text-xs font-extrabold uppercase tracking-[0.22em]">
                SliceHub Delivery Workspace
              </span>
            </div>

            <h1 className="max-w-[56rem] text-[4.25rem] font-extrabold leading-[0.92] tracking-[-0.065em] text-white sm:text-[5.2rem] lg:text-[6.3rem]">
              <span className="block">Discover better</span>
              <span className="block text-[#FF3B30]">restaurant experiences</span>
              <span className="block">near you</span>
            </h1>

            <p className="max-w-3xl text-[1.15rem] leading-9 text-slate-200">
              Browse approved restaurants, explore menus, and move from
              discovery to checkout in a cleaner, faster customer flow.
            </p>
          </motion.div>

          <div className="surface-panel-strong mt-12 max-w-[66rem] bg-white/96 p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[1.25fr_0.95fr_auto] lg:gap-4">
              <label className="flex items-center gap-3 rounded-[1.65rem] bg-[#f7f8fa] px-5 py-4">
                <Search size={20} className="text-gray-400" />
                <input
                  placeholder="Search restaurants..."
                  value={heroSearch}
                  onChange={(event) => setHeroSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleBrowseRestaurants();
                    }
                  }}
                  className="w-full bg-transparent text-[15px] font-semibold text-gray-700 outline-none placeholder:text-gray-400"
                />
              </label>

              <label className="flex items-center gap-3 rounded-[1.65rem] bg-[#f7f8fa] px-5 py-4">
                <MapPin size={20} className="text-gray-400" />
                <input
                  placeholder="Your location"
                  value={heroLocation}
                  onChange={(event) => setHeroLocation(event.target.value)}
                  className="w-full bg-transparent text-[15px] font-semibold text-gray-700 outline-none placeholder:text-gray-400"
                />
              </label>

              <button
                onClick={handleBrowseRestaurants}
                className="btn-primary min-h-[62px] rounded-[1.65rem] px-8 text-base"
              >
                Find Food
              </button>
            </div>
          </div>

          <div className="mt-12 grid max-w-[56rem] gap-4 sm:grid-cols-3 sm:gap-5">
            <div className="glass-panel flex items-center gap-3 px-5 py-4 text-white">
              <Star className="text-yellow-400" />
              <div>
                <p className="text-lg font-extrabold">{foods.length || "Fresh"}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-300">
                  Visible Dishes
                </p>
              </div>
            </div>

            <div className="glass-panel flex items-center gap-3 px-5 py-4 text-white">
              <Clock className="text-green-400" />
              <div>
                <p className="text-lg font-extrabold">25 min</p>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-300">
                  Avg Delivery
                </p>
              </div>
            </div>

            <div className="glass-panel flex items-center gap-3 px-5 py-4 text-white">
              <TrendingUp className="text-blue-400" />
              <div>
                <p className="text-lg font-extrabold">{restaurants.length || "Live"}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-300">
                  Approved Restaurants
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="page-shell">
          <WorkspaceLoadingState
            title="Loading featured food"
            message="Pulling the latest restaurant and dish highlights for the customer landing page."
          />
        </section>
      ) : error ? (
        <section className="page-shell">
          <WorkspaceErrorState
            title="Home feed unavailable"
            message={error}
            onAction={fetchData}
          />
        </section>
      ) : (
        <>
          <section className="page-shell">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Customer picks</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-contrast">
                  Featured Restaurants
                </h2>
              </div>
              <Link
                to="/restaurants"
                className="btn-secondary w-full sm:w-auto"
              >
                View All Restaurants
              </Link>
            </div>

            {restaurants.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {restaurants.slice(0, 6).map((restaurant) => (
                  <RestaurantCard key={restaurant?._id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <WorkspaceEmptyState
                title="No featured restaurants yet"
                message="Approved restaurants will appear here once the marketplace has active listings."
              />
            )}
          </section>

          <section className="page-shell">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Menu highlights</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-contrast">
                  Popular Dishes
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-gray-500">
                Fresh items pulled from currently visible restaurants.
              </p>
            </div>

            {foods.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {foods.slice(0, 8).map((food) => (
                  <FoodCard
                    key={food?._id}
                    food={food}
                    onAddToCart={handleAddToCart}
                    cartAccessAllowed={canUseCart}
                  />
                ))}
              </div>
            ) : (
              <WorkspaceEmptyState
                icon={Store}
                title="No popular dishes yet"
                message="Featured dishes will appear here once restaurants have visible menu items."
              />
            )}
          </section>

          <section className="page-shell">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FF3B30] via-[#ff5b33] to-orange-500 p-8 text-white shadow-[0_28px_70px_rgba(255,59,48,0.25)] sm:p-10">
              <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10 grid items-center gap-10 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/20 p-3">
                      <Sparkles size={20} />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-[-0.04em]">
                      AI Chef Recommends
                    </h2>
                  </div>

                  <p className="text-lg leading-8 text-white/80">
                    Based on trending dishes and user preferences, we think you&apos;ll love this!
                  </p>

                  {recommendedFood ? (
                    <>
                      <h3 className="text-2xl font-bold">{recommendedFood.name}</h3>

                      <p className="max-w-md text-white/80">
                        {recommendedFood.description || "A delicious choice just for you."}
                      </p>

                      <div className="flex gap-4">
                        <button
                          onClick={() => navigate(`/food/${recommendedFood._id}`)}
                          className="rounded-2xl bg-white px-6 py-3 font-bold text-[#FF3B30]"
                        >
                          View Dish
                        </button>

                        <button
                          onClick={() => handleAddToCart(recommendedFood)}
                          disabled={!canUseCart}
                          className="rounded-2xl border border-white px-6 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {canUseCart ? "Add to Cart" : "Customer Cart Only"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p>No recommendation available.</p>
                  )}
                </div>

                {recommendedFood ? (
                  <div>
                    <img
                      src={recommendedFood.image || "https://picsum.photos/500/400"}
                      alt={recommendedFood.name}
                      className="h-[320px] w-full rounded-[2rem] object-cover shadow-2xl"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="page-shell">
        <div className="surface-panel-strong space-y-6 p-10 text-center sm:p-12">
          <p className="section-kicker">Ready when you are</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.05em] text-gray-900">
            Ready to explore restaurants?
          </h2>

          <p className="mx-auto max-w-2xl text-gray-600">
            Browse hundreds of restaurants and discover delicious meals.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/restaurants"
              className="btn-primary px-8"
            >
              Browse Restaurants
            </Link>

            <Link
              to={isSignedIn ? "/dashboard" : "/login"}
              className="btn-secondary px-8"
            >
              {isSignedIn ? "Open Dashboard" : "Login"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
