import API from "./axios";

const restaurantAPI = {

  // Get all restaurants with search/filter
  getRestaurants: (params = {}) =>
    API.get("/restaurants", { params }),

  // Get single restaurant
  getRestaurant: (id) =>
    API.get(`/restaurants/${id}`),

  // Create restaurant
  createRestaurant: (data) =>
    API.post("/restaurants", data),

  // Update restaurant
  updateRestaurant: (id, data) =>
    API.put(`/restaurants/${id}`, data),

  // Delete restaurant
  deleteRestaurant: (id) =>
    API.delete(`/restaurants/${id}`),

  // Update restaurant approval status
  updateStatus: (id, status) =>
    API.patch(`/restaurants/${id}/status`, { status }),

};

export default restaurantAPI;