import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, Loader2, Search } from "lucide-react";

import { restaurantService } from "../services/restaurantService";
import foodAPI from "../api/foodAPI";
import FoodCard from "../components/FoodCard";

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [foodLoading, setFoodLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setError(
          err?.response?.data?.message || "Failed to load restaurant"
        );
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const fetchFoods = async () => {
    if (!id) return;

    try {
      setFoodLoading(true);
      const res = await foodAPI.getByRestaurant(id);
      // FIX: response shape is { success, count, foods }
      setFoods(Array.isArray(res?.data?.foods) ? res.data.foods : []);
    } catch (err) {
      console.error(err);
      setFoods([]);
    } finally {
      setFoodLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [id]);

  const handleSearch = async () => {
    if (!search) return fetchFoods();

    try {
      setFoodLoading(true);
      const res = await foodAPI.search({ q: search, restaurantId: id });
      setFoods(Array.isArray(res?.data?.foods) ? res.data.foods : []);
    } catch (err) {
      console.error(err);
      setFoods([]);
    } finally {
      setFoodLoading(false);
    }
  };

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
      {/* HERO */}
      <div className="relative h-72 overflow-hidden bg-gray-900">
        <img
          src={restaurant?.image || "https://picsum.photos/800/400"}
          alt={restaurant?.name || "restaurant"}
          className="h-full w-full object-cover opacity-50"
        />

        <button
          onClick={() => navigate("/restaurants")}
          className="absolute left-4 top-4 bg-white p-2 rounded-full"
        >
          <ChevronLeft />
        </button>

        <div className="absolute bottom-0 p-6 text-white">
          <h1 className="text-4xl font-bold">
            {restaurant?.name}
          </h1>
        </div>
      </div>

      {/* MENU SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-4">Menu</h2>

        {/* SEARCH */}
        <div className="flex gap-3 mb-6">
          <div className="flex items-center border rounded-xl px-3 w-full">
            <Search size={18} className="text-gray-400" />
            <input
              className="w-full p-2 outline-none"
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={handleSearch}
            className="bg-primary text-white px-4 rounded-xl"
          >
            Search
          </button>
        </div>

        {/* FOOD LIST */}
        {foodLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (foods || []).length === 0 ? (
          <p className="text-gray-500">No food items yet</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(foods || []).map((food, i) => (
              <FoodCard key={food?._id || i} food={food} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
