import React from "react";
import { useParams } from "react-router-dom";

const RestaurantMenu = () => {

  const { id } = useParams();

  return (
    <div className="menu-page">

      <h1>Restaurant Menu</h1>

      <p>Restaurant ID : {id}</p>

      <div className="menu-items">

        <div className="menu-card">
          <h3>Pizza Margherita</h3>
          <p>$12</p>
          <button>Add to Cart</button>
        </div>

        <div className="menu-card">
          <h3>Cheese Burger</h3>
          <p>$10</p>
          <button>Add to Cart</button>
        </div>

      </div>

    </div>
  );
};

export default RestaurantMenu;