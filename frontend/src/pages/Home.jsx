import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Clock, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 space-y-16 bg-[#F8F9FB]">

      {/* HERO SECTION */}

      <section className="relative min-h-[600px] flex items-center overflow-hidden bg-black py-20">

        {/* Background image */}

        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1920"
            alt="Food background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* HERO CONTENT */}

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

      {/* CTA SECTION */}

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
              className="bg-[#FF3B30] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#e5322a] transition"
            >
              Browse Restaurants
            </Link>

            <Link
              to="/login"
              className="border border-gray-300 px-8 py-3 rounded-xl font-semibold hover:bg-black hover:text-white transition"
            >
              Login
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}