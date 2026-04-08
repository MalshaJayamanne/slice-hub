import React from "react";
import { useNavigate } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {

  const navigate = useNavigate();

  return (

    <div
      className="restaurant-card"
      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
    >

      <img
        src={restaurant.image || "/default-restaurant.png"}
        alt={restaurant.name}
        className="restaurant-image"
      />

      <div className="restaurant-info">

        <h3>{restaurant.name}</h3>

        <p>{restaurant.category}</p>

        <p>{restaurant.description}</p>

      </div>

    </div>

  );

};

export default RestaurantCard;