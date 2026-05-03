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
import FeedbackAlert from "../components/FeedbackAlert";
import RestaurantCard from "../components/RestaurantCard";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
} from "../components/WorkspaceScaffold";
import foodAPI from "../api/foodAPI";
import { useCart } from "../context/CartContext";
import { restaurantService } from "../services/restaurantService";

export default function Home() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroSearch, setHeroSearch] = useState("");
  const [heroLocation, setHeroLocation] = useState("");
  const [cartFeedback, setCartFeedback] = useState(null);

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

  const authUser = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (_error) {
      return null;
    }
  }, []);

  const handleBrowseRestaurants = () => {
    navigate("/restaurants", {
      state: {
        initialSearch: heroSearch.trim(),
      },
    });
  };

  const handleAddToCart = (food) => {
    const result = addItem(food, 1);
    setCartFeedback({
      type: result.success ? "success" : "error",
      title: result.success ? "Added to cart" : "Cart update failed",
      message: result.message,
    });
  };

  return (
    <div className="pb-24">
      <section className="relative flex min-h-[760px] items-center overflow-hidden bg-black py-24">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1920"
            alt="Food background"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/68" />
        </div>

        <div className="page-shell relative z-10 w-full pt-6">
          <motion.div
            initial={{ opacity: 0.8, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto flex max-w-[64rem] flex-col items-center text-center"
          >
            <div className="mb-8 flex items-center gap-2 rounded-full border border-[#FF4F40]/20 bg-[#FF4F40]/5 px-4 py-2 text-[#FF4F40] shadow-sm backdrop-blur-md">
              <Sparkles size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest">
                Premium Delivery Experience
              </span>
            </div>

            <h1 className="font-display text-[4rem] font-bold leading-[0.95] tracking-tight text-white sm:text-[5.5rem] lg:text-[6.5rem]">
              <span className="block">Discover</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF4F40] to-[#f97316]">
                Slices of heaven
              </span>
              <span className="block">near you</span>
            </h1>

            <p className="mt-8 max-w-2xl text-[1.15rem] leading-relaxed text-slate-200">
              Browse top-tier restaurants, explore curated menus, and enjoy a seamless ordering experience from start to finish.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="mx-auto mt-14 max-w-[56rem]"
          >
            <div className="glass-panel p-3 shadow-2xl shadow-slate-200/50 sm:p-4">
              <div className="grid gap-3 rounded-2xl bg-white p-2 sm:grid-cols-[1.5fr_1fr_auto] sm:gap-4 sm:p-3 shadow-inner">
                <label className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-4 py-3.5 transition-colors focus-within:bg-slate-100/80">
                  <Search size={20} className="text-slate-400" />
                  <input
                    placeholder="Search for restaurants or dishes..."
                    value={heroSearch}
                    onChange={(event) => setHeroSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleBrowseRestaurants();
                      }
                    }}
                    className="w-full bg-transparent text-[15px] font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-4 py-3.5 transition-colors focus-within:bg-slate-100/80">
                  <MapPin size={20} className="text-slate-400" />
                  <input
                    placeholder="Your location"
                    value={heroLocation}
                    onChange={(event) => setHeroLocation(event.target.value)}
                    className="w-full bg-transparent text-[15px] font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>

                <button
                  onClick={handleBrowseRestaurants}
                  className="btn-primary min-h-[58px] rounded-xl px-8 text-base shadow-[#FF4F40]/20 sm:w-auto w-full"
                >
                  Find Food
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mx-auto mt-14 grid max-w-[48rem] grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
          >
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 p-6 text-center backdrop-blur-md shadow-sm border border-white/50">
              <Star className="mb-3 text-[#f97316]" size={28} />
              <p className="font-display text-3xl font-bold text-slate-900">{foods.length || "100+"}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Premium Dishes</p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 p-6 text-center backdrop-blur-md shadow-sm border border-white/50">
              <Clock className="mb-3 text-emerald-500" size={28} />
              <p className="font-display text-3xl font-bold text-slate-900">25 min</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Avg Delivery</p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 p-6 text-center backdrop-blur-md shadow-sm border border-white/50">
              <TrendingUp className="mb-3 text-blue-500" size={28} />
              <p className="font-display text-3xl font-bold text-slate-900">{restaurants.length || "Live"}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Top Restaurants</p>
            </div>
          </motion.div>
        </div>
      </section>

      {cartFeedback ? (
        <section className="page-shell mt-20">
          <FeedbackAlert
            type={cartFeedback.type}
            title={cartFeedback.title}
            message={cartFeedback.message}
            onClose={() => setCartFeedback(null)}
          />
        </section>
      ) : null}

      {loading ? (
        <section className="page-shell mt-20">
          <WorkspaceLoadingState
            title="Loading featured food"
            message="Pulling the latest restaurant and dish highlights for the customer landing page."
          />
        </section>
      ) : error ? (
        <section className="page-shell mt-20">
          <WorkspaceErrorState
            title="Home feed unavailable"
            message={error}
            onAction={fetchData}
          />
        </section>
      ) : (
        <>
          <section className="page-shell mt-20">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Customer Picks</p>
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

          <section className="page-shell mt-20">
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

          <section className="page-shell mt-20">
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
                          className="rounded-2xl border border-white px-6 py-3 font-bold"
                        >
                          Add to Cart
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

      <section className="page-shell mt-20">
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
              to={authUser ? "/dashboard" : "/login"}
              className="btn-secondary px-8"
            >
              {authUser ? "Open Dashboard" : "Login"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
