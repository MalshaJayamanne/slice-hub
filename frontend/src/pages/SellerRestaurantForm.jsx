import React, { useState } from "react";
import restaurantAPI from "../api/restaurantapi";

const SellerRestaurantForm = () => {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await restaurantAPI.createRestaurant({
        name,
        description,
        category,
        image
      });

      alert("Restaurant created successfully!");

      setName("");
      setDescription("");
      setCategory("");
      setImage("");

    } catch (err) {

      console.error(err);
      alert("Failed to create restaurant");

    }

  };

  return (

    <form onSubmit={handleSubmit} className="restaurant-form">

      <h2>Create Restaurant</h2>

      <input
        placeholder="Restaurant name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <input
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />

      <button type="submit">
        Save
      </button>

    </form>

  );

};

export default SellerRestaurantForm;