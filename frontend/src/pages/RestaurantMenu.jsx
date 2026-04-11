import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, Clock, Loader2, MapPin, Star, Store } from "lucide-react";

import { restaurantService } from "../services/restaurantService";

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getRestaurantById(id);
        setRestaurant(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load restaurant details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
          Loading restaurant details...
        </p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant unavailable</h1>
          <p className="text-gray-500">{error || "Restaurant not found."}</p>
        </div>
        <button
          onClick={() => navigate("/restaurants")}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  const statusTone =
    restaurant.status === "approved"
      ? "bg-green-100 text-green-700"
      : restaurant.status === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";

  return (
    <div className="pb-16">
      <div className="relative h-72 overflow-hidden bg-gray-900">
        <img
          src={restaurant.image || "/default-restaurant.png"}
          alt={restaurant.name}
          className="h-full w-full object-cover opacity-50"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

        <button
          onClick={() => navigate("/restaurants")}
          className="absolute left-4 top-4 rounded-full bg-white p-2 text-gray-900 shadow"
        >
          <ChevronLeft />
        </button>

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-8 text-white">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone}`}>
              {restaurant.status || "pending"}
            </span>

            {restaurant.category && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                {restaurant.category}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold">{restaurant.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-white/90">
            <span className="flex items-center gap-2">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              {restaurant.rating || "New"}
            </span>

            <span className="flex items-center gap-2">
              <Clock size={16} />
              {restaurant.deliveryTime || "30-40 min"}
            </span>

            <span className="flex items-center gap-2">
              <Store size={16} />
              {restaurant.ownerId?.name || "Seller pending"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">About This Restaurant</h2>
          <p className="mt-4 leading-7 text-gray-600">
            {restaurant.description || "This restaurant has not added a description yet."}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Category
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {restaurant.category || "Not specified"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Delivery
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {restaurant.deliveryTime || "30-40 min"}
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Restaurant Info</h2>

            <div className="mt-5 space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">Owner</p>
                <p>{restaurant.ownerId?.name || "Not available"}</p>
                <p>{restaurant.ownerId?.email || "No email provided"}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">Status</p>
                <p className="capitalize">{restaurant.status || "pending"}</p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-gray-400" />
                <p>Location details are not available yet for this restaurant.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6">
            <h2 className="text-lg font-bold text-gray-900">Menu Status</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              This page now shows restaurant details reliably. Menu items can be added later once the
              food module is connected to this restaurant.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RestaurantMenu;
