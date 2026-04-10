import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Package, MapPin, LogOut, ChevronRight, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("authUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Profile Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-3xl p-8 shadow border text-center"
        >

          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-bold">
            {user?.name || "User"}
          </h2>

          <p className="text-gray-500">
            {user?.email}
          </p>

          <p className="text-sm text-gray-400 mt-2">
            Role: {user?.role}
          </p>

          <button className="mt-6 w-full flex items-center justify-center gap-2 border p-3 rounded-xl hover:bg-gray-50">
            <Settings size={18} />
            Edit Profile
          </button>

        </motion.div>

        {/* Dashboard Menu */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow border space-y-4">

          <h1 className="text-3xl font-bold mb-6">
            Welcome back {user?.name}
          </h1>

          <button
            onClick={() => navigate("/orders")}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Package />
              Order History
            </div>
            <ChevronRight />
          </button>

          <button
            onClick={() => navigate("/addresses")}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <MapPin />
              Saved Addresses
            </div>
            <ChevronRight />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-xl text-red-500 hover:bg-red-50"
          >
            <div className="flex items-center gap-3">
              <LogOut />
              Logout
            </div>
            <ChevronRight />
          </button>

          {user?.role === "seller" && (
            <button
              onClick={() => navigate("/seller/restaurant/create")}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Settings />
                Manage Restaurant
              </div>
              <ChevronRight />
            </button>
          )}

          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin/restaurants")}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Settings />
                Review Restaurants
              </div>
              <ChevronRight />
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
