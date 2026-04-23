import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  Clock3,
  LogOut,
  MapPin,
  Package,
  PlusCircle,
  Settings,
  Store,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import restaurantAPI from "../api/restaurantApi";

export default function Dashboard() {
  const navigate = useNavigate();

  let user = null;
  try {
    const storedUser = localStorage.getItem("authUser");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid user JSON:", error);
    user = null;
  }

  const [sellerRestaurants, setSellerRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "seller") return;

    const fetchSellerRestaurants = async () => {
      try {
        setRestaurantsLoading(true);
        const res = await restaurantAPI.getRestaurants();
        const restaurants = Array.isArray(res?.data?.restaurants)
          ? res.data.restaurants
          : [];

        const ownedRestaurants = restaurants.filter((restaurant) => {
          const ownerId =
            restaurant?.ownerId?._id ||
            restaurant?.ownerId ||
            restaurant?.owner?._id ||
            restaurant?.owner;

          return ownerId?.toString() === user?._id?.toString();
        });

        setSellerRestaurants(ownedRestaurants);
      } catch (error) {
        console.error("Failed to load seller restaurants:", error);
        setSellerRestaurants([]);
      } finally {
        setRestaurantsLoading(false);
      }
    };

    fetchSellerRestaurants();
  }, [user?._id, user?.role]);

  const primarySellerRestaurant = useMemo(
    () => sellerRestaurants[0] || null,
    [sellerRestaurants]
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  const sellerQuickActions = primarySellerRestaurant
    ? [
        {
          label: "Manage Foods",
          description: "Add, edit, and remove menu items",
          icon: ChefHat,
          action: () => navigate(`/seller/menu/${primarySellerRestaurant._id}`),
          tone: "text-primary",
        },
        {
          label: "Edit Restaurant",
          description: "Update profile, category, and image",
          icon: Store,
          action: () =>
            navigate(`/seller/restaurant/edit/${primarySellerRestaurant._id}`),
        },
      ]
    : [
        {
          label: "Create Restaurant",
          description: "Set up your restaurant before adding foods",
          icon: PlusCircle,
          action: () => navigate("/seller/restaurant/create"),
          tone: "text-primary",
        },
      ];

  const adminQuickActions =
    user?.role === "admin"
      ? [
          {
            label: "Manage Restaurants",
            description: "Review, approve, and reject restaurant submissions",
            icon: Package,
            action: () => navigate("/admin/restaurants"),
            tone: "text-primary",
          },
        ]
      : [];

  const commonActions = [
    {
      label: "Order History",
      description: "View your recent activity",
      icon: Clock3,
      action: () => navigate("/orders"),
      hidden: user?.role !== "customer",
    },
    {
      label: "Saved Addresses",
      description: "Manage delivery locations",
      icon: MapPin,
      disabled: true,
    },
    {
      label: "Logout",
      description: "Sign out of your account",
      icon: LogOut,
      action: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-[2rem] p-8 shadow-sm border text-center"
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <User size={42} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
          <p className="text-gray-500 mt-1">{user?.email || "No email"}</p>
          <p className="text-sm text-gray-400 mt-2 capitalize">
            Role: {user?.role || "N/A"}
          </p>

          <button
            disabled
            className="mt-6 w-full flex items-center justify-center gap-2 border p-3 rounded-2xl text-gray-400 cursor-not-allowed bg-gray-50"
            title="Profile editing is not connected yet"
          >
            <Settings size={18} />
            Edit Profile Soon
          </button>

          {user?.role === "seller" ? (
            <div className="mt-6 rounded-2xl bg-orange-50 border border-orange-100 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Seller Workspace
              </p>
              {restaurantsLoading ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Loading restaurant access...
                </div>
              ) : primarySellerRestaurant ? (
                <div className="mt-3">
                  <p className="font-semibold text-gray-900">
                    {primarySellerRestaurant.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Your food management tools are ready.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  Create a restaurant first, then you can manage its foods here.
                </p>
              )}
            </div>
          ) : null}
        </motion.div>

        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back {user?.name || ""}
          </h1>
          <p className="text-gray-500 mb-8">
            Pick up where you left off and jump straight into the next task.
          </p>

          {user?.role === "seller" ? (
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                Seller Actions
              </p>
              <div className="space-y-3">
                {sellerQuickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center justify-between rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                          <Icon className={item.tone || "text-gray-700"} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {user?.role === "admin" ? (
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                Admin Actions
              </p>
              <div className="space-y-3">
                {adminQuickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center justify-between rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                          <Icon className={item.tone || "text-gray-700"} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Account
            </p>
            <div className="space-y-3">
              {commonActions.filter((item) => !item.hidden).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.disabled ? undefined : item.action}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between rounded-2xl p-4 transition ${
                      item.danger
                        ? "text-red-500 hover:bg-red-50"
                        : item.disabled
                        ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <Icon />
                      </div>
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-sm text-gray-500">
                          {item.disabled ? `${item.description} - coming soon` : item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
