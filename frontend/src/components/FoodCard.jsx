import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Flame } from "lucide-react";
import StarRating from "./StarRating";

const FoodCard = ({ food, onAddToCart }) => {
  const navigate = useNavigate();

  if (!food) return null;

  const openFood = () => {
    if (food?._id) {
      navigate(`/food/${food._id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-gray-100 group cursor-pointer transition-all hover:shadow-2xl"
      onClick={openFood}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={food?.image || "https://picsum.photos/400/300"}
          alt={food?.name || "food"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Rating */}
        {food?.rating && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5">
            <StarRating rating={food.rating} size={14} />
            <span className="text-xs font-black text-contrast">
              {food.rating}
            </span>
          </div>
        )}

        {/* Trending Badge */}
        {food?.isTrending && (
          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
            <Flame size={12} /> Trending
          </div>
        )}

        {/* Popular Badge */}
        {food?.isPopular && (
          <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
            Best Seller
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-xl text-contrast group-hover:text-primary transition-colors leading-tight">
            {food?.name}
          </h3>
          <span className="font-black text-xl text-primary">
            Rs. {food?.price}
          </span>
        </div>

        <p className="text-gray-400 text-sm font-medium line-clamp-2 mb-4 leading-relaxed">
          {food?.description}
        </p>

        {/* AI Insight */}
        {food?.aiInsight && (
          <div className="mb-6 p-3 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-2">
            <Sparkles size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-[10px] font-bold text-primary/80 italic leading-tight">
              {food.aiInsight}
            </p>
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart && onAddToCart(food); // ✅ prevent crash if undefined
          }}
          className="w-full bg-gray-50 hover:bg-primary hover:text-white text-contrast hover:shadow-lg hover:shadow-primary/20 font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={20} />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default FoodCard;