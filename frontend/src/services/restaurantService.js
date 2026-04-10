import axios from "axios";

const API_URL = "http://localhost:5000/api/restaurants";

export const restaurantService = {
  getRestaurants: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },
};