import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { motion } from "framer-motion";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();


  if (!restaurant) return null;

  const openRestaurant = () => {
    if (!restaurant._id) return; // extra safety
    navigate(`/restaurant/${restaurant._id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      className="surface-panel overflow-hidden cursor-pointer group"
      onClick={openRestaurant}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image || "/default-restaurant.png"}
          alt={restaurant.name || "Restaurant"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4 flex gap-2">
          {restaurant.category && (
            <span className="rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-700 shadow-sm backdrop-blur-sm">
              {restaurant.category}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-xl font-extrabold tracking-[-0.03em] text-slate-900 transition-colors group-hover:text-primary">
            {restaurant.name}
          </h3>

          {restaurant.rating && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
              <Star size={14} className="fill-orange-400 text-orange-400" />
              {restaurant.rating}
            </div>
          )}
        </div>

        <p className="min-h-[3rem] text-sm leading-6 text-gray-500 line-clamp-2">
          {restaurant.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <Clock size={14} />
            <span>{restaurant.deliveryTime || "30-40 min"}</span>
          </div>
          <span className="rounded-full bg-[#f7f8fa] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Free delivery
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
