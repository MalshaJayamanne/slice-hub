import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChefHat,
  Clock3,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  ShoppingBag,
  Store,
  User,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import FeedbackAlert from "../components/FeedbackAlert";
import restaurantAPI from "../api/restaurantApi";
import { clearAuthSession, getAuthUser } from "../utils/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getAuthUser();

  const [sellerRestaurants, setSellerRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [pageFeedback, setPageFeedback] = useState(null);

  useEffect(() => {
    if (location.state?.feedback) {
      setPageFeedback(location.state.feedback);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

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

  const primaryWorkspaceAction = useMemo(() => {
    if (user?.role === "admin") {
      return {
        label: "Open Admin Dashboard",
        icon: LayoutDashboard,
        action: () => navigate("/admin/dashboard"),
      };
    }

    if (user?.role === "seller") {
      if (primarySellerRestaurant) {
        return {
          label: "Open Seller Orders",
          icon: ShoppingBag,
          action: () => navigate("/seller/orders"),
        };
      }

      return {
        label: "Create Restaurant",
        icon: PlusCircle,
        action: () => navigate("/seller/restaurant/create"),
      };
    }

    return {
      label: "Browse Restaurants",
      icon: Store,
      action: () => navigate("/restaurants"),
    };
  }, [navigate, primarySellerRestaurant, user?.role]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const sellerQuickActions = primarySellerRestaurant
    ? [
        {
          label: "Seller Orders",
          description: "Review incoming orders and update statuses",
          icon: ShoppingBag,
          action: () => navigate("/seller/orders"),
          tone: "text-primary",
        },
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
          label: "Seller Orders",
          description: "Open the seller queue even before orders start arriving",
          icon: ShoppingBag,
          action: () => navigate("/seller/orders"),
          tone: "text-primary",
        },
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
            label: "Platform Dashboard",
            description: "View the live admin summary cards",
            icon: LayoutDashboard,
            action: () => navigate("/admin/dashboard"),
            tone: "text-primary",
          },
          {
            label: "Manage Users",
            description: "Review customer, seller, and admin accounts",
            icon: Users,
            action: () => navigate("/admin/users"),
          },
          {
            label: "Manage Restaurants",
            description: "Review, approve, and reject restaurant submissions",
            icon: Store,
            action: () => navigate("/admin/restaurants"),
          },
          {
            label: "Platform Orders",
            description: "Monitor orders across all restaurants",
            icon: Package,
            action: () => navigate("/admin/orders"),
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
      label: "Browse Restaurants",
      description: "Explore menus and place a new order",
      icon: Store,
      action: () => navigate("/restaurants"),
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
    <div className="page-shell py-10 sm:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <motion.div
          whileHover={{ y: -4 }}
          className="surface-panel relative overflow-hidden p-8 text-center"
        >
          <div className="absolute right-[-2rem] top-[-2rem] h-28 w-28 rounded-full bg-primary/5" />
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 shadow-sm">
            <User size={42} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
          <p className="text-gray-500 mt-1">{user?.email || "No email"}</p>
          <p className="text-sm text-gray-400 mt-2 capitalize">
            Role: {user?.role || "N/A"}
          </p>

          <button
            type="button"
            onClick={primaryWorkspaceAction.action}
            className="btn-primary mt-6 w-full"
          >
            <primaryWorkspaceAction.icon size={18} />
            {primaryWorkspaceAction.label}
          </button>

          {user?.role === "seller" ? (
            <div className="mt-6 rounded-[1.5rem] border border-orange-100 bg-orange-50 p-4 text-left">
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

        <div className="surface-panel-strong lg:col-span-2 p-8 sm:p-9">
          <p className="section-kicker">Account workspace</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-contrast">
            Welcome back {user?.name || ""}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-gray-500">
            Pick up where you left off and jump straight into the next task.
          </p>

          {pageFeedback ? (
            <div className="mb-8 mt-8">
              <FeedbackAlert
                type={pageFeedback.type}
                title={pageFeedback.title}
                message={pageFeedback.message}
                onClose={() => setPageFeedback(null)}
              />
            </div>
          ) : null}

          <div className={pageFeedback ? "" : "mt-8"}>
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
                      className="w-full flex items-center justify-between rounded-[1.5rem] border border-gray-100 bg-[#fbfbfc] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
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
                      className="w-full flex items-center justify-between rounded-[1.5rem] border border-gray-100 bg-[#fbfbfc] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
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
                    onClick={item.action}
                    className={`w-full flex items-center justify-between rounded-[1.5rem] p-4 transition ${
                      item.danger
                        ? "text-red-500 hover:bg-red-50"
                        : "border border-gray-100 bg-[#fbfbfc] hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <Icon />
                      </div>
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
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
    </div>
  );
}
