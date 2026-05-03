import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { motion } from "framer-motion";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  if (!restaurant) return null;

  const openRestaurant = () => {
    if (!restaurant._id) return;
    navigate(`/restaurant/${restaurant._id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      className="surface-panel flex h-full flex-col overflow-hidden cursor-pointer group"
      onClick={openRestaurant}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image || "/default-restaurant.png"}
          alt={restaurant.name || "Restaurant"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4 flex gap-2">
          {restaurant.category && (
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm backdrop-blur-md">
              {restaurant.category}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.25rem] font-bold tracking-tight text-slate-900 transition-colors group-hover:text-[#FF4F40]">
            {restaurant.name}
          </h3>

          {restaurant.rating && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#f97316]">
              <Star size={12} className="fill-[#f97316] text-[#f97316]" />
              {restaurant.rating}
            </div>
          )}
        </div>

        <p className="min-h-[2.5rem] text-[14px] leading-relaxed text-slate-500 line-clamp-2">
          {restaurant.description || "A wonderful place to grab a bite."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <Clock size={16} className="text-slate-400" />
            <span>{restaurant.deliveryTime || "30-40 min"}</span>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            Free delivery
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
