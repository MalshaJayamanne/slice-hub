import React from "react";
import { Star } from "lucide-react";

export const StarRating = ({ rating, size = 16 }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-slate-200"
          }
        />
      ))}

      <span className="text-sm font-bold text-slate-600 ml-1">
        {rating}
      </span>
    </div>
  );
};

export default StarRating;
