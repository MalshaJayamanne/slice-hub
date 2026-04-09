import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { motion } from "framer-motion";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const openRestaurant = () => {
    navigate(`/restaurant/${restaurant._id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl overflow-hidden shadow-soft border border-gray-100 cursor-pointer group"
      onClick={openRestaurant}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={restaurant.image || "/default-restaurant.png"}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {restaurant.category && (
            <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
              {restaurant.category}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg text-contrast group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>

          {/* Rating */}
          {restaurant.rating && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-sm font-bold">
              <Star size={14} className="fill-orange-400 text-orange-400" />
              {restaurant.rating}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-2 line-clamp-2">
          {restaurant.description}
        </p>

        {/* Delivery */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock size={14} />
          <span>{restaurant.deliveryTime || "30-40 min"}</span>
          <span>•</span>
          <span>Free Delivery</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;