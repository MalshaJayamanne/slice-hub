import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const FoodCard = ({ food, onAddToCart, cartAccessAllowed = true }) => {
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
      className="surface-panel-strong overflow-hidden group cursor-pointer transition-all hover:shadow-2xl"
      onClick={openFood}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={food?.image || "https://picsum.photos/400/300"}
          alt={food?.name || "food"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div
          className={`absolute right-4 top-4 rounded-2xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-xl ${
            food?.availability
              ? "bg-emerald-500 text-white"
              : "bg-gray-900/85 text-white"
          }`}
        >
          {food?.availability ? "Available" : "Unavailable"}
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-black leading-tight text-contrast transition-colors group-hover:text-primary">
            {food?.name}
          </h3>
          <span className="font-black text-xl text-primary whitespace-nowrap">
            Rs. {food?.price}
          </span>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
          {food?.category || "Uncategorized"}
        </p>

        <p className="mb-5 min-h-10 text-sm font-medium leading-relaxed text-gray-500 line-clamp-2">
          {food?.description || "No description added yet."}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (food?.availability && cartAccessAllowed) {
              onAddToCart && onAddToCart(food);
            }
          }}
          disabled={!food?.availability || !cartAccessAllowed}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f7f8fa] py-3.5 font-black text-contrast transition-all hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 active:scale-95 disabled:text-gray-400 disabled:hover:bg-[#f7f8fa]"
        >
          <Plus size={20} />
          {!food?.availability
            ? "Currently Unavailable"
            : cartAccessAllowed
              ? "Add to Cart"
              : "Customer Cart Only"}
        </button>
      </div>
    </motion.div>
  );
};

export default FoodCard;
