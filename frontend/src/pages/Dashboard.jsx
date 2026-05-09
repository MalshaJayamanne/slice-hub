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
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";

import FeedbackAlert from "../components/FeedbackAlert";
import restaurantAPI from "../api/restaurantApi";
import orderAPI from "../api/orderAPI";
import {
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
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

  useEffect(() => {
    if (user?.role !== "customer") return;

    const fetchCustomerStats = async () => {
      try {
        setOrdersLoading(true);
        const res = await orderAPI.getMyOrders();
        setOrders(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load customer orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchCustomerStats();
  }, [user?._id, user?.role]);

  const customerStats = useMemo(() => {
    if (user?.role !== "customer") return null;
    return {
      total: orders.length,
      spent: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      pending: orders.filter((o) => o.status === "Pending").length,
    };
  }, [orders, user?.role]);

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
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
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
      label: "Payment History",
      description: "Review your transaction logs",
      icon: CreditCard,
      action: () => navigate("/payments"),
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
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={User}
          title={user?.name || "Profile"}
          subtitle={user?.email || "Account management"}
          note={`Your ${user?.role || "user"} workspace is active and synced with live platform data.`}
        >
          <div className="space-y-4">
            <button
              type="button"
              onClick={primaryWorkspaceAction.action}
              className="btn-primary w-full"
            >
              <primaryWorkspaceAction.icon size={18} />
              {primaryWorkspaceAction.label}
            </button>

            {user?.role === "customer" && customerStats && (
              <div className="grid grid-cols-1 gap-3">
                <WorkspaceStat
                  label="Total Orders"
                  value={customerStats.total}
                  hint="Placed across all restaurants"
                />
                <WorkspaceStat
                  label="Wallet Outflow"
                  value={`Rs. ${customerStats.spent.toFixed(2)}`}
                  hint="Total amount spent on platform"
                  tone="warning"
                />
              </div>
            )}

            {user?.role === "seller" && (
              <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                  Seller Status
                </p>
                {restaurantsLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    Syncing...
                  </div>
                ) : primarySellerRestaurant ? (
                  <div className="mt-3">
                    <p className="font-display font-semibold text-slate-900">
                      {primarySellerRestaurant.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Live on marketplace
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-gray-600">
                    Setup your restaurant to start selling.
                  </p>
                )}
              </div>
            )}
          </div>
        </WorkspaceSidebar>
      }
      eyebrow="Account Workspace"
      title={`Welcome back, ${user?.name?.split(" ")[0] || "User"}`}
      description="Access your orders, manage your profile, and jump into your specialized workspaces from this central hub."
    >
      <div className="space-y-8">
        {pageFeedback ? (
          <FeedbackAlert
            type={pageFeedback.type}
            title={pageFeedback.title}
            message={pageFeedback.message}
            onClose={() => setPageFeedback(null)}
          />
        ) : null}

        {user?.role === "seller" && (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
              Seller Control Panel
            </p>
            <div className="space-y-3">
              {sellerQuickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center justify-between rounded-[1.5rem] border border-gray-100 bg-[#fbfbfc] p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40"
                  >
                    <div className="flex items-center gap-5 text-left">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                        <Icon className={item.tone || "text-slate-600"} size={24} />
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-slate-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {user?.role === "admin" && (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
              Platform Administration
            </p>
            <div className="space-y-3">
              {adminQuickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center justify-between rounded-[1.5rem] border border-gray-100 bg-[#fbfbfc] p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40"
                  >
                    <div className="flex items-center gap-5 text-left">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                        <Icon className={item.tone || "text-slate-600"} size={24} />
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-slate-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
            Standard Actions
          </p>
          <div className="space-y-3">
            {commonActions.filter((item) => !item.hidden).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between rounded-[1.5rem] p-5 transition ${
                    item.danger
                      ? "text-red-500 hover:bg-red-50/50"
                      : "border border-gray-100 bg-[#fbfbfc] hover:bg-white hover:shadow-lg hover:shadow-slate-200/40"
                  }`}
                >
                  <div className="flex items-center gap-5 text-left">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                      <Icon className={item.danger ? "text-red-500" : "text-slate-600"} size={24} />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </WorkspacePage>
  );
}
