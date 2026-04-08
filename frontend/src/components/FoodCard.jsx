import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FoodCard = ({ food }) => {
  const navigate = useNavigate();

  const openFood = () => {
    navigate(`/food/${food._id}`);
  };

  return (
    <motion.div
      className="food-card"
      whileHover={{ scale: 1.03 }}
      onClick={openFood}
    >
      <div className="food-image">
        <img
          src={food.image || "https://picsum.photos/300/200"}
          alt={food.name}
        />
      </div>

      <div className="food-info">
        <h3>{food.name}</h3>
        <p>{food.description}</p>

        <div className="food-bottom">
          <span className="food-price">Rs. {food.price}</span>
          <button className="add-btn">Add</button>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodCard;