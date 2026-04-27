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
import { restaurantService } from "../services/restaurantService";

export default function Home() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const resRestaurants = await restaurantService.getRestaurants();
      const resFoods = await foodAPI.getAll?.();

      const safeRestaurants = Array.isArray(resRestaurants)
        ? resRestaurants
        : resRestaurants?.restaurants || [];

      const safeFoods = Array.isArray(resFoods)
        ? resFoods
        : Array.isArray(resFoods?.data)
        ? resFoods.data
        : Array.isArray(resFoods?.data?.foods)
        ? resFoods.data.foods
        : Array.isArray(resFoods?.foods)
        ? resFoods.foods
        : [];

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

  return (
    <div className="space-y-16 bg-[#F8F9FB] pb-20">
      <section className="relative flex min-h-[600px] items-center overflow-hidden bg-black py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1920"
            alt="Food background"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl space-y-6"
          >
            <div className="flex w-fit items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                SliceHub Food Delivery
              </span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight sm:text-6xl">
              Discover the <span className="text-[#FF3B30]">Best Food</span> Near You
            </h1>

            <p className="text-lg text-gray-200">
              Browse restaurants, explore menus, and order your favorite meals
              with fast delivery.
            </p>
          </motion.div>

          <div className="mt-10 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-3 shadow-xl">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search size={20} className="text-gray-400" />
              <input
                placeholder="Search restaurants..."
                className="w-full font-medium text-gray-700 outline-none"
              />
            </div>

            <div className="flex flex-1 items-center gap-2 border-l px-3">
              <MapPin size={20} className="text-gray-400" />
              <input
                placeholder="Your location"
                className="w-full font-medium text-gray-700 outline-none"
              />
            </div>

            <button
              onClick={() => navigate("/restaurants")}
              className="rounded-xl bg-[#FF3B30] px-6 py-3 font-semibold text-white transition hover:bg-[#e5322a]"
            >
              Find Food
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-10">
            <div className="flex items-center gap-3">
              <Star className="text-yellow-400" />
              <div>
                <p className="font-bold">4.9 / 5</p>
                <p className="text-xs text-gray-300">User Rating</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-green-400" />
              <div>
                <p className="font-bold">25 min</p>
                <p className="text-xs text-gray-300">Avg Delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="text-blue-400" />
              <div>
                <p className="font-bold">500+</p>
                <p className="text-xs text-gray-300">Restaurants</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="mx-auto max-w-7xl px-6">
          <WorkspaceLoadingState
            title="Loading featured food"
            message="Pulling the latest restaurant and dish highlights for the customer landing page."
          />
        </section>
      ) : error ? (
        <section className="mx-auto max-w-7xl px-6">
          <WorkspaceErrorState
            title="Home feed unavailable"
            message={error}
            onAction={fetchData}
          />
        </section>
      ) : (
        <>
          <section className="mx-auto max-w-7xl px-6">
            <h2 className="mb-6 text-3xl font-bold">Featured Restaurants</h2>

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

          <section className="mx-auto max-w-7xl px-6">
            <h2 className="mb-6 text-3xl font-bold">Popular Dishes</h2>

            {foods.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {foods.slice(0, 8).map((food) => (
                  <FoodCard
                    key={food?._id}
                    food={food}
                    onAddToCart={(item) => console.log("Added:", item)}
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

          <section className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF3B30] to-orange-500 p-10 text-white">
              <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10 grid items-center gap-10 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/20 p-3">
                      <Sparkles size={20} />
                    </div>
                    <h2 className="text-3xl font-extrabold">AI Chef Recommends</h2>
                  </div>

                  <p className="text-lg text-white/80">
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
                          className="rounded-xl bg-white px-6 py-3 font-bold text-[#FF3B30]"
                        >
                          View Dish
                        </button>

                        <button
                          onClick={() => console.log("AI Add:", recommendedFood)}
                          className="rounded-xl border border-white px-6 py-3 font-bold"
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
                      className="h-[300px] w-full rounded-2xl object-cover shadow-2xl"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="mx-auto max-w-7xl px-6">
        <div className="space-y-6 rounded-3xl bg-white p-12 text-center shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900">
            Ready to explore restaurants?
          </h2>

          <p className="text-gray-600">
            Browse hundreds of restaurants and discover delicious meals.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/restaurants"
              className="rounded-xl bg-[#FF3B30] px-8 py-3 font-semibold text-white"
            >
              Browse Restaurants
            </Link>

            <Link
              to="/login"
              className="rounded-xl border border-gray-300 px-8 py-3 font-semibold"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
