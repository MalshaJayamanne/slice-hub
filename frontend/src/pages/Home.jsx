import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

// ✅ Existing components
import RestaurantCard from "../components/RestaurantCard";
import FoodCard from "../components/FoodCard";

// ✅ APIs
import { restaurantService } from "../services/restaurantService";
import foodAPI from "../api/foodAPI";

export default function Home() {
  const navigate = useNavigate();

  // ✅ State
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);

  // ✅ Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resRestaurants = await restaurantService.getRestaurants();
        const resFoods = await foodAPI.getAll?.();

        const safeRestaurants = Array.isArray(resRestaurants)
          ? resRestaurants
          : resRestaurants?.restaurants || [];

        const safeFoods = Array.isArray(resFoods)
          ? resFoods
          : resFoods?.data?.foods || [];

        setRestaurants(safeRestaurants);
        setFoods(safeFoods);
      } catch (err) {
        console.error("Home fetch error:", err);
      }
    };

    fetchData();
  }, []);

  // ✅ FIXED: Stable AI Recommendation
  const recommendedFood = useMemo(() => {
    if (!Array.isArray(foods) || foods.length === 0) return null;

    return foods[Math.floor(Math.random() * foods.length)];
  }, [foods]);

  return (
    <div className="pb-20 space-y-16 bg-[#F8F9FB]">

      {/* ================= HERO SECTION ================= */}

      <section className="relative min-h-[600px] flex items-center overflow-hidden bg-black py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1920"
            alt="Food background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 max-w-3xl"
          >
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl w-fit backdrop-blur">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                SliceHub Food Delivery
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
              Discover the <span className="text-[#FF3B30]">Best Food</span> Near You
            </h1>

            <p className="text-lg text-gray-200">
              Browse restaurants, explore menus, and order your favorite meals
              with fast delivery.
            </p>
          </motion.div>

          {/* SEARCH BAR */}
          <div className="mt-10 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search size={20} className="text-gray-400" />
              <input
                placeholder="Search restaurants..."
                className="w-full outline-none font-medium text-gray-700"
              />
            </div>

            <div className="flex items-center gap-2 flex-1 px-3 border-l">
              <MapPin size={20} className="text-gray-400" />
              <input
                placeholder="Your location"
                className="w-full outline-none font-medium text-gray-700"
              />
            </div>

            <button
              onClick={() => navigate("/restaurants")}
              className="bg-[#FF3B30] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#e5322a] transition"
            >
              Find Food
            </button>
          </div>

          {/* STATS */}
          <div className="flex flex-wrap gap-10 mt-10">
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

      {/* ================= FEATURED RESTAURANTS ================= */}

      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">
          Featured Restaurants
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.slice(0, 6).map((restaurant) => (
            <RestaurantCard
              key={restaurant?._id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </section>

      {/* ================= POPULAR DISHES ================= */}

      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">
          Popular Dishes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {foods.slice(0, 8).map((food) => (
            <FoodCard
              key={food?._id}
              food={food}
              onAddToCart={(item) => console.log("Added:", item)}
            />
          ))}
        </div>
      </section>

      {/* ================= AI RECOMMENDATION ================= */}

      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-br from-[#FF3B30] to-orange-500 rounded-3xl p-10 text-white relative overflow-hidden">

          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-3xl font-extrabold">
                  AI Chef Recommends
                </h2>
              </div>

              <p className="text-white/80 text-lg">
                Based on trending dishes and user preferences, we think you’ll love this!
              </p>

              {recommendedFood ? (
                <>
                  <h3 className="text-2xl font-bold">
                    {recommendedFood.name}
                  </h3>

                  <p className="text-white/80 max-w-md">
                    {recommendedFood.description || "A delicious choice just for you."}
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate(`/food/${recommendedFood._id}`)}
                      className="bg-white text-[#FF3B30] px-6 py-3 rounded-xl font-bold"
                    >
                      View Dish
                    </button>

                    <button
                      onClick={() => console.log("AI Add:", recommendedFood)}
                      className="border border-white px-6 py-3 rounded-xl font-bold"
                    >
                      Add to Cart
                    </button>
                  </div>
                </>
              ) : (
                <p>No recommendation available.</p>
              )}
            </div>

            {recommendedFood && (
              <div>
                <img
                  src={recommendedFood.image || "https://picsum.photos/500/400"}
                  alt={recommendedFood.name}
                  className="rounded-2xl shadow-2xl w-full h-[300px] object-cover"
                />
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}

      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">
            Ready to explore restaurants?
          </h2>

          <p className="text-gray-600">
            Browse hundreds of restaurants and discover delicious meals.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/restaurants"
              className="bg-[#FF3B30] text-white px-8 py-3 rounded-xl font-semibold"
            >
              Browse Restaurants
            </Link>

            <Link
              to="/login"
              className="border border-gray-300 px-8 py-3 rounded-xl font-semibold"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}