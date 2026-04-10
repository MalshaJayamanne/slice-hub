import restaurantAPI from "../api/restaurantApi";

export const restaurantService = {
  getRestaurants: async (params = {}) => {
    const res = await restaurantAPI.getRestaurants(params);
    return res.data.restaurants || [];
  },

  getRestaurantById: async (id) => {
    const res = await restaurantAPI.getRestaurant(id);
    return res.data.restaurant;
  },
};
