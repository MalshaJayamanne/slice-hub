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
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-gray-100 group cursor-pointer transition-all hover:shadow-2xl"
      onClick={openFood}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={food?.image || "https://picsum.photos/400/300"}
          alt={food?.name || "food"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-2xl shadow-xl text-[10px] font-black uppercase tracking-widest ${
            food?.availability
              ? "bg-emerald-500 text-white"
              : "bg-gray-900/85 text-white"
          }`}
        >
          {food?.availability ? "Available" : "Unavailable"}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2 gap-3">
          <h3 className="font-black text-xl text-contrast group-hover:text-primary transition-colors leading-tight">
            {food?.name}
          </h3>
          <span className="font-black text-xl text-primary whitespace-nowrap">
            Rs. {food?.price}
          </span>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80 mb-3">
          {food?.category || "Uncategorized"}
        </p>

        <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-4 leading-relaxed min-h-10">
          {food?.description || "No description added yet."}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (food?.availability) {
              onAddToCart && onAddToCart(food);
            }
          }}
          disabled={!food?.availability}
          className="w-full bg-gray-50 hover:bg-primary hover:text-white disabled:hover:bg-gray-50 disabled:text-gray-400 text-contrast hover:shadow-lg hover:shadow-primary/20 font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={20} />
          {food?.availability ? "Add to Cart" : "Currently Unavailable"}
        </button>
      </div>
    </motion.div>
  );
};

export default FoodCard;
