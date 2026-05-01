import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  Search,
} from "lucide-react";

import { restaurantService } from "../services/restaurantService";
import foodAPI from "../api/foodAPI";
import FoodCard from "../components/FoodCard";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
} from "../components/WorkspaceScaffold";
import { useCart } from "../context/CartContext";

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, canUseCart } = useCart();

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <WorkspaceLoadingState
          title="Loading restaurant"
          message="Pulling the restaurant profile and live menu items for this customer page."
        />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <WorkspaceErrorState
          title="Restaurant unavailable"
          message={error || "Restaurant not found."}
          actionLabel="Back to Restaurants"
          onAction={() => navigate("/restaurants")}
        />
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

      <div className="page-shell py-8">
        <div className="surface-panel p-5 sm:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="input-surface w-full px-12 py-3"
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
              disabled={foodLoading}
              className="btn-primary"
            >
              {foodLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                "Search"
              )}
            </button>
            {search.trim() ? (
              <button
                onClick={() => {
                  setSearch("");
                  fetchFoods();
                }}
                disabled={foodLoading}
                className="btn-secondary"
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
          <WorkspaceErrorState
            title="Menu unavailable"
            message={error}
            onAction={search.trim() ? handleSearch : fetchFoods}
          />
        ) : foodLoading ? (
          <WorkspaceLoadingState
            title="Loading menu items"
            message="Refreshing the dishes available for this restaurant."
          />
        ) : foods.length === 0 ? (
          <WorkspaceEmptyState
            title="No food items found"
            message={
              search
                ? "Try a different keyword or clear the search to see the full menu."
                : "This restaurant has not added any menu items yet."
            }
            actionLabel={search ? "Clear Search" : undefined}
            onAction={
              search
                ? () => {
                    setSearch("");
                    fetchFoods();
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {foods.map((food) => (
              <FoodCard
                key={food?._id}
                food={food}
                onAddToCart={handleAddToCart}
                cartAccessAllowed={canUseCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
