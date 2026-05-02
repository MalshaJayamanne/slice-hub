import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

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
      whileHover={{ y: -6, scale: 1.01 }}
      className="surface-panel flex h-full flex-col overflow-hidden group cursor-pointer"
      onClick={openFood}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={food?.image || "https://picsum.photos/400/300"}
          alt={food?.name || "food"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div
          className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${
            food?.availability
              ? "bg-emerald-500/90 text-white"
              : "bg-slate-900/80 text-white"
          }`}
        >
          {food?.availability ? "Available" : "Sold Out"}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.35rem] font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#FF4F40]">
            {food?.name}
          </h3>
          <span className="whitespace-nowrap font-display text-xl font-bold text-[#FF4F40]">
            Rs. {food?.price}
          </span>
        </div>

        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          {food?.category || "Specialty"}
        </p>

        <p className="mb-6 min-h-[2.5rem] text-[14px] leading-relaxed text-slate-500 line-clamp-2">
          {food?.description || "A delicious culinary creation prepared with fresh ingredients."}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (food?.availability) {
              onAddToCart && onAddToCart(food);
            }
          }}
          disabled={!food?.availability}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-[#FF4F40] hover:text-white hover:shadow-lg hover:shadow-[#FF4F40]/25 active:scale-[0.98] disabled:text-slate-400 disabled:hover:bg-slate-50 disabled:hover:shadow-none"
        >
          <Plus size={18} />
          {food?.availability ? "Add to Cart" : "Currently Unavailable"}
        </button>
      </div>
    </motion.div>
  );
};

export default FoodCard;
