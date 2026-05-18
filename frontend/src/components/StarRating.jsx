import React, { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({ maxRating = 5, rating = 0, onRate, readonly = false, size = 24 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hover || rating);

        return (
          <button
            key={index}
            type="button"
            className={`transition-all duration-200 ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
            }`}
            onClick={() => !readonly && onRate && onRate(starValue)}
            onMouseEnter={() => !readonly && setHover(starValue)}
            onMouseLeave={() => !readonly && setHover(0)}
            disabled={readonly}
          >
            <Star
              size={size}
              className={`${
                isActive
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-slate-300"
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
