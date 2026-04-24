import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ChevronLeft,
  Loader2,
  Search,
  Store,
} from "lucide-react";

import { restaurantService } from "../services/restaurantService";
import foodAPI from "../api/foodAPI";
import FoodCard from "../components/FoodCard";
import { useCart } from "../context/CartContext";

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [foodLoading, setFoodLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  const handleAddToCart = (food) => {
    const result = addItem(food, 1);
    setCartMessage(result.message);
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await restaurantService.getRestaurantById(id);
        setRestaurant(data || null);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load restaurant");
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const fetchFoods = useCallback(async () => {
    if (!id) return;

    try {
      setFoodLoading(true);
      const res = await foodAPI.getByRestaurant(id);
      setFoods(Array.isArray(res?.data?.foods) ? res.data.foods : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setFoods([]);
      setError(err?.response?.data?.message || "Failed to load menu items.");
    } finally {
      setFoodLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleSearch = async () => {
    if (!search.trim()) {
      return fetchFoods();
    }

    try {
      setFoodLoading(true);
      const res = await foodAPI.search({ q: search, restaurantId: id });
      setFoods(Array.isArray(res?.data?.foods) ? res.data.foods : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setFoods([]);
      setError(err?.response?.data?.message || "Failed to search menu items.");
    } finally {
      setFoodLoading(false);
    }
  };

  const availableCount = useMemo(
    () => foods.filter((food) => food?.availability).length,
    [foods]
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
          Loading restaurant...
        </p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p>{error || "Restaurant not found"}</p>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="relative overflow-hidden bg-gray-900">
        <img
          src={restaurant?.image || "https://picsum.photos/1400/600"}
          alt={restaurant?.name || "restaurant"}
          className="h-[24rem] w-full object-cover opacity-35"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 top-0 max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <button
            onClick={() => navigate("/restaurants")}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-white"
          >
            <ChevronLeft size={16} />
            All Restaurants
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
                Restaurant Menu
              </p>
              <h1 className="mt-3 text-4xl sm:text-5xl font-black">{restaurant?.name}</h1>
              <p className="mt-3 max-w-2xl text-white/80">
                {restaurant?.description || "Browse the latest dishes from this restaurant."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl bg-white/12 backdrop-blur px-4 py-4 min-w-32">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Total Foods</p>
                <p className="mt-2 text-2xl font-bold">{foods.length}</p>
              </div>
              <div className="rounded-2xl bg-white/12 backdrop-blur px-4 py-4 min-w-32">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Available</p>
                <p className="mt-2 text-2xl font-bold">{availableCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-[2rem] border bg-white shadow-sm p-5 sm:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="w-full rounded-2xl border px-12 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search food by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <button
              onClick={handleSearch}
              className="rounded-2xl bg-primary text-white px-5 py-3 font-semibold"
            >
              Search
            </button>
            {search.trim() ? (
              <button
                onClick={() => {
                  setSearch("");
                  fetchFoods();
                }}
                className="rounded-2xl border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            ) : null}
          </div>

          {cartMessage ? (
            <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              {cartMessage}
            </div>
          ) : null}
        </div>

        {error && !loading ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
            {error}
          </div>
        ) : foodLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : foods.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <Store className="mx-auto text-gray-300" size={38} />
            <p className="mt-4 text-xl font-semibold text-gray-700">No food items found</p>
            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try a different keyword or clear the search to see the full menu."
                : "This restaurant has not added any menu items yet."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {foods.map((food) => (
              <FoodCard
                key={food?._id}
                food={food}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
